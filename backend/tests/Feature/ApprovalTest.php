<?php

namespace Tests\Feature;

use App\Models\Approval;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_sending_project_creates_pending_approval(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        Sanctum::actingAs($freelancer);

        $project = Project::create([
            'title' => 'Website',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-approval-1',
            'status' => Project::STATUS_DRAFT,
        ]);

        $this->postJson("/api/projects/{$project->id}/send")
            ->assertOk()
            ->assertJsonPath('data.project.status', 'sent');

        $this->assertDatabaseHas('approvals', [
            'project_id' => $project->id,
            'status' => Approval::STATUS_PENDING,
            'client_id' => null,
        ]);
    }

    public function test_client_can_approve_with_optional_comment(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $clientUser = User::factory()->create([
            'role' => User::ROLE_CLIENT,
            'email' => 'client@example.com',
        ]);

        $project = Project::create([
            'title' => 'App',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-approval-2',
            'status' => Project::STATUS_SENT,
        ]);

        Approval::create([
            'project_id' => $project->id,
            'status' => Approval::STATUS_PENDING,
        ]);

        Sanctum::actingAs($clientUser);

        $response = $this->postJson('/api/share/share-approval-2/approve', [
            'comment' => 'Looks good to me',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.approval.status', 'approved')
            ->assertJsonPath('data.approval.comment', 'Looks good to me');

        $project->refresh();

        $this->assertSame(Project::STATUS_APPROVED, $project->status);
        $this->assertNotNull($project->client_id);
    }

    public function test_client_can_reject_with_optional_comment(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $clientUser = User::factory()->create(['role' => User::ROLE_CLIENT]);

        $project = Project::create([
            'title' => 'App',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-approval-3',
            'status' => Project::STATUS_SENT,
        ]);

        Approval::create([
            'project_id' => $project->id,
            'status' => Approval::STATUS_PENDING,
        ]);

        Sanctum::actingAs($clientUser);

        $response = $this->postJson('/api/share/share-approval-3/reject', [
            'comment' => 'Need more details',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.approval.status', 'rejected')
            ->assertJsonPath('data.project.status', 'draft');
    }

    public function test_freelancer_can_view_project_approval(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        Sanctum::actingAs($freelancer);

        $project = Project::create([
            'title' => 'Dashboard',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-approval-4',
            'status' => Project::STATUS_SENT,
        ]);

        Approval::create([
            'project_id' => $project->id,
            'status' => Approval::STATUS_PENDING,
        ]);

        $this->getJson("/api/projects/{$project->id}/approval")
            ->assertOk()
            ->assertJsonPath('data.approval.status', 'pending');
    }
}
