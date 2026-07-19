<?php

namespace Tests\Feature;

use App\Models\ProjectApproval;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_freelancer_can_create_project_without_client(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        Sanctum::actingAs($freelancer);

        $response = $this->postJson('/api/projects', [
            'title' => 'E-commerce Store',
            'description' => 'Online clothing store',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.project.client_id', null)
            ->assertJsonPath('data.project.status', 'draft')
            ->assertJsonStructure(['data' => ['project' => ['shareLink']]]);

        $this->assertDatabaseHas('projects', [
            'owner_id' => $freelancer->id,
            'client_id' => null,
            'status' => 'draft',
        ]);
    }

    public function test_freelancer_can_send_project_to_client(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        Sanctum::actingAs($freelancer);

        $project = Project::create([
            'title' => 'Website',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-test-123',
            'status' => Project::STATUS_DRAFT,
        ]);

        $response = $this->postJson("/api/projects/{$project->id}/send");

        $response->assertOk()
            ->assertJsonPath('data.project.status', 'sent');
    }

    public function test_client_approval_attaches_client_id(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $clientUser = User::factory()->create([
            'role' => User::ROLE_CLIENT,
            'email' => 'client@example.com',
        ]);

        $project = Project::create([
            'title' => 'Mobile App',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-approve-123',
            'status' => Project::STATUS_SENT,
        ]);

        ProjectApproval::create([
            'project_id' => $project->id,
            'status' => ProjectApproval::STATUS_PENDING,
        ]);

        Sanctum::actingAs($clientUser);

        $response = $this->postJson('/api/share/share-approve-123/approve');

        $response->assertOk()
            ->assertJsonPath('data.project.status', 'approved')
            ->assertJsonPath('data.project_approval.status', 'approved');

        $project->refresh();

        $this->assertNotNull($project->client_id);
        $this->assertNotNull($project->approved_at);

        $this->assertDatabaseHas('clients', [
            'id' => $project->client_id,
            'owner_id' => $freelancer->id,
            'user_id' => $clientUser->id,
            'email' => 'client@example.com',
        ]);
    }

    public function test_share_link_requires_authentication(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);

        Project::create([
            'title' => 'Protected Project',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-public-123',
            'status' => Project::STATUS_SENT,
        ]);

        $this->getJson('/api/share/share-public-123')->assertUnauthorized();
    }

    public function test_logged_in_client_can_view_share_link(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $clientUser = User::factory()->create(['role' => User::ROLE_CLIENT]);

        Project::create([
            'title' => 'Public Project',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-public-123',
            'status' => Project::STATUS_SENT,
        ]);

        Sanctum::actingAs($clientUser);

        $response = $this->getJson('/api/share/share-public-123');

        $response->assertOk()
            ->assertJsonPath('data.project.name', 'Public Project');
    }

    public function test_freelancer_owner_can_view_share_link(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);

        Project::create([
            'title' => 'Owner Preview',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-owner-preview',
            'status' => Project::STATUS_SENT,
        ]);

        Sanctum::actingAs($freelancer);

        $this->getJson('/api/share/share-owner-preview')
            ->assertOk()
            ->assertJsonPath('data.project.name', 'Owner Preview');
    }
}
