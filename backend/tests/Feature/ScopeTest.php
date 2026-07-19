<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ScopeItem;
use App\Models\ScopeSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_freelancer_can_create_section_and_item(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        Sanctum::actingAs($freelancer);

        $project = Project::create([
            'title' => 'Website',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-scope-1',
            'status' => Project::STATUS_DRAFT,
        ]);

        $sectionResponse = $this->postJson("/api/projects/{$project->id}/sections", [
            'title' => 'UI Design',
        ]);

        $sectionResponse->assertCreated()
            ->assertJsonPath('data.section.title', 'UI Design')
            ->assertJsonPath('data.section.position', 0);

        $sectionId = $sectionResponse->json('data.section.id');

        $itemResponse = $this->postJson("/api/projects/{$project->id}/sections/{$sectionId}/items", [
            'title' => 'Homepage',
            'description' => 'Main landing page',
            'status' => 'pending',
        ]);

        $itemResponse->assertCreated()
            ->assertJsonPath('data.item.status', 'pending')
            ->assertJsonPath('data.item.status_value', 'needs_review');
    }

    public function test_project_show_includes_scope_sections(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        Sanctum::actingAs($freelancer);

        $project = Project::create([
            'title' => 'App',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-scope-2',
            'status' => Project::STATUS_DRAFT,
        ]);

        $section = ScopeSection::create([
            'project_id' => $project->id,
            'title' => 'Backend',
            'position' => 0,
        ]);

        ScopeItem::create([
            'section_id' => $section->id,
            'title' => 'Auth API',
            'status' => ScopeItem::STATUS_INCLUDED,
            'position' => 0,
        ]);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertOk()
            ->assertJsonPath('data.project.scopeSections.0.title', 'Backend')
            ->assertJsonPath('data.project.scopeSections.0.items.0.title', 'Auth API');
    }

    public function test_share_link_includes_scope_for_client_view(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $clientUser = User::factory()->create(['role' => User::ROLE_CLIENT]);

        $project = Project::create([
            'title' => 'Shared App',
            'owner_id' => $freelancer->id,
            'share_link' => 'share-scope-public',
            'status' => Project::STATUS_SENT,
        ]);

        ScopeSection::create([
            'project_id' => $project->id,
            'title' => 'Features',
            'position' => 0,
        ]);

        Sanctum::actingAs($clientUser);

        $response = $this->getJson('/api/share/share-scope-public');

        $response->assertOk()
            ->assertJsonPath('data.project.scopeSections.0.title', 'Features');
    }
}
