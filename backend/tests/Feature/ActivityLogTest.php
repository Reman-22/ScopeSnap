<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Client;
use App\Models\Project;
use App\Models\ProjectApproval;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_creation_logs_activity(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        Sanctum::actingAs($freelancer);

        $response = $this->postJson('/api/projects', [
            'title' => 'Logged Project',
            'description' => 'Test logging',
        ]);

        $projectId = $response->json('data.project.id');

        $this->assertDatabaseHas('activity_logs', [
            'project_id' => $projectId,
            'user_id' => $freelancer->id,
            'action' => ActivityLog::ACTION_PROJECT_CREATED,
        ]);
    }

    public function test_scope_approval_logs_activity(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $clientUser = User::factory()->create(['role' => User::ROLE_CLIENT]);

        $project = Project::create([
            'title' => 'Approval Log Project',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-activity-1',
            'status' => Project::STATUS_SENT,
        ]);

        ProjectApproval::create([
            'project_id' => $project->id,
            'status' => ProjectApproval::STATUS_PENDING,
        ]);

        Sanctum::actingAs($clientUser);
        $this->postJson('/api/share/share-activity-1/approve')->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'project_id' => $project->id,
            'user_id' => $clientUser->id,
            'action' => ActivityLog::ACTION_SCOPE_APPROVED,
        ]);
    }

    public function test_freelancer_can_list_project_activity_logs(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        Sanctum::actingAs($freelancer);

        $project = Project::create([
            'title' => 'Timeline Project',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-activity-2',
            'status' => Project::STATUS_DRAFT,
        ]);

        ActivityLog::create([
            'project_id' => $project->id,
            'user_id' => $freelancer->id,
            'description' => 'Project created',
            'action' => ActivityLog::ACTION_PROJECT_CREATED,
        ]);

        $this->getJson("/api/projects/{$project->id}/activity-logs")
            ->assertOk()
            ->assertJsonPath('data.activity_logs.0.type', 'project_created')
            ->assertJsonPath('data.activity_logs.0.action', 'project_created');
    }

    public function test_client_can_list_activity_for_their_project(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $clientUser = User::factory()->create(['role' => User::ROLE_CLIENT]);

        $client = Client::create([
            'owner_id' => $freelancer->id,
            'user_id' => $clientUser->id,
            'name' => $clientUser->name,
            'email' => $clientUser->email,
        ]);

        $project = Project::create([
            'title' => 'Client Timeline Project',
            'owner_id' => $freelancer->id,
            'client_id' => $client->id,
            'share_link' => 'share-activity-3',
            'status' => Project::STATUS_APPROVED,
        ]);

        ActivityLog::create([
            'project_id' => $project->id,
            'user_id' => $clientUser->id,
            'description' => 'Scope approved',
            'action' => ActivityLog::ACTION_SCOPE_APPROVED,
        ]);

        Sanctum::actingAs($clientUser);

        $this->getJson("/api/projects/{$project->id}/activity-logs")
            ->assertOk()
            ->assertJsonPath('data.activity_logs.0.type', 'scope_approved');
    }
}
