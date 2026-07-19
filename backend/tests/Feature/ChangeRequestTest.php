<?php

namespace Tests\Feature;

use App\Models\ChangeRequest;
use App\Models\Client;
use App\Models\Project;
use App\Models\ScopeItem;
use App\Models\ScopeSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChangeRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_create_change_request_on_approved_project(): void
    {
        [$project, $clientUser, $client] = $this->approvedProjectSetup();
        Sanctum::actingAs($clientUser);

        $response = $this->postJson("/api/projects/{$project->id}/change-requests", [
            'title' => 'Add blog section',
            'description' => 'Please add a blog to the website',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.change_request.status', 'pending')
            ->assertJsonPath('data.change_request.clientId', $client->id);

        $this->assertDatabaseHas('change_requests', [
            'project_id' => $project->id,
            'client_id' => $client->id,
            'status' => ChangeRequest::STATUS_PENDING,
        ]);
    }

    public function test_freelancer_can_approve_change_request(): void
    {
        [$project, $clientUser, $client, $freelancer] = $this->approvedProjectSetup(withFreelancer: true);
        Sanctum::actingAs($clientUser);

        $createResponse = $this->postJson("/api/projects/{$project->id}/change-requests", [
            'title' => 'Add payment gateway',
            'description' => 'Integrate Stripe payments',
        ]);

        $changeRequestId = $createResponse->json('data.change_request.id');

        Sanctum::actingAs($freelancer);

        $response = $this->patchJson("/api/change-requests/{$changeRequestId}/status", [
            'status' => 'accepted',
            'reason' => 'Will be billed separately',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.change_request.status', 'accepted')
            ->assertJsonPath('data.change_request.status_value', 'approved')
            ->assertJsonPath('data.change_request.reason', 'Will be billed separately');
    }

    public function test_client_can_link_change_request_to_scope_item(): void
    {
        [$project, $clientUser] = $this->approvedProjectSetup();
        Sanctum::actingAs($clientUser);

        $section = ScopeSection::create([
            'project_id' => $project->id,
            'title' => 'Features',
            'position' => 0,
        ]);

        $item = ScopeItem::create([
            'section_id' => $section->id,
            'title' => 'Blog',
            'status' => ScopeItem::STATUS_INCLUDED,
            'position' => 0,
        ]);

        $response = $this->postJson("/api/projects/{$project->id}/change-requests", [
            'title' => 'Expand blog feature',
            'description' => 'Add categories and tags',
            'item_id' => $item->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.change_request.itemId', $item->id);
    }

    public function test_change_request_cannot_be_created_before_approval(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $clientUser = User::factory()->create(['role' => User::ROLE_CLIENT]);

        $project = Project::create([
            'title' => 'Draft App',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-cr-1',
            'status' => Project::STATUS_SENT,
        ]);

        Sanctum::actingAs($clientUser);

        $this->postJson("/api/projects/{$project->id}/change-requests", [
            'title' => 'Too early',
            'description' => 'Should fail',
        ])->assertStatus(422);
    }

    public function test_change_request_does_not_link_client_to_project(): void
    {
        [$project, $clientUser, $client] = $this->approvedProjectSetup();
        Sanctum::actingAs($clientUser);

        $this->postJson("/api/projects/{$project->id}/change-requests", [
            'title' => 'Add blog section',
            'description' => 'Please add a blog to the website',
        ])->assertCreated();

        $project->refresh();

        $this->assertSame($client->id, $project->client_id);
    }

    public function test_unlinked_client_cannot_create_change_request(): void
    {
        [$project, , $client] = $this->approvedProjectSetup();
        $otherClientUser = User::factory()->create(['role' => User::ROLE_CLIENT]);

        Sanctum::actingAs($otherClientUser);

        $this->postJson("/api/projects/{$project->id}/change-requests", [
            'title' => 'Unauthorized request',
            'description' => 'Should fail',
        ])->assertForbidden();

        $this->assertDatabaseMissing('change_requests', [
            'project_id' => $project->id,
            'client_id' => $client->id,
            'title' => 'Unauthorized request',
        ]);
    }

    /**
     * @return array{0: Project, 1: User, 2: Client, 3?: User}
     */
    private function approvedProjectSetup(bool $withFreelancer = false): array
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $clientUser = User::factory()->create([
            'role' => User::ROLE_CLIENT,
            'email' => 'client-cr@example.com',
        ]);

        $client = Client::create([
            'owner_id' => $freelancer->id,
            'user_id' => $clientUser->id,
            'name' => $clientUser->name,
            'email' => $clientUser->email,
        ]);

        $project = Project::create([
            'title' => 'Approved App',
            'owner_id' => $freelancer->id,
            'client_id' => $client->id,
            'share_link' => 'share-cr-'.uniqid(),
            'status' => Project::STATUS_APPROVED,
            'approved_at' => now(),
            'approval_status' => Project::APPROVAL_STATUS_APPROVED,
            'approval_client_id' => $client->id,
        ]);

        if ($withFreelancer) {
            return [$project, $clientUser, $client, $freelancer];
        }

        return [$project, $clientUser, $client];
    }
}
