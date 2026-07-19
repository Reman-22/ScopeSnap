<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectApproval;
use App\Models\User;
use App\Services\ClientProjectLinker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectApprovalController extends Controller
{
    public function show(Request $request, Project $project): JsonResponse
    {
        if ($project->owner_id !== $request->user()?->id) {
            abort(403, 'You do not have access to this project');
        }

        $projectApproval = $project->projectApproval()->with('client')->first();

        if (! $projectApproval) {
            return $this->notFound('No project approval record found for this project');
        }

        return $this->success(
            ['project_approval' => $this->formatProjectApproval($projectApproval)],
            'Project approval retrieved'
        );
    }

    public function approve(Request $request, string $shareLink): JsonResponse
    {
        /** @var User $clientUser */
        $clientUser = $request->user();

        $validator = Validator::make($request->all(), [
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $project = $this->findProjectByShareLink($shareLink);

        if ($project->isApproved()) {
            return $this->error('Project is already approved', 422);
        }

        if ($project->status !== Project::STATUS_SENT) {
            return $this->error('Project must be sent before it can be approved', 422);
        }

        $projectApproval = $project->projectApproval;

        if (! $projectApproval || $projectApproval->status !== ProjectApproval::STATUS_PENDING) {
            return $this->error('No pending project approval found for this project', 422);
        }

        $client = ClientProjectLinker::resolve($clientUser, $project);

        $projectApproval->update([
            'client_id' => $client->id,
            'comment' => $validator->validated()['comment'] ?? null,
            'status' => ProjectApproval::STATUS_APPROVED,
        ]);

        $project->update([
            'client_id' => $client->id,
            'approved_at' => now(),
            'status' => Project::STATUS_APPROVED,
        ]);

        return $this->success(
            [
                'project_approval' => $this->formatProjectApproval($projectApproval->fresh()->load('client')),
                'project' => [
                    'id' => $project->id,
                    'status' => $project->status,
                    'approvedAt' => $project->approved_at,
                ],
            ],
            'Project approved successfully'
        );
    }

    public function reject(Request $request, string $shareLink): JsonResponse
    {
        /** @var User $clientUser */
        $clientUser = $request->user();

        $validator = Validator::make($request->all(), [
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $project = $this->findProjectByShareLink($shareLink);

        if ($project->isApproved()) {
            return $this->error('Approved projects cannot be rejected', 422);
        }

        if ($project->status !== Project::STATUS_SENT) {
            return $this->error('Project must be sent before it can be rejected', 422);
        }

        $projectApproval = $project->projectApproval;

        if (! $projectApproval || $projectApproval->status !== ProjectApproval::STATUS_PENDING) {
            return $this->error('No pending project approval found for this project', 422);
        }

        $client = ClientProjectLinker::resolve($clientUser, $project);

        $projectApproval->update([
            'client_id' => $client->id,
            'comment' => $validator->validated()['comment'] ?? null,
            'status' => ProjectApproval::STATUS_REJECTED,
        ]);

        $project->update([
            'status' => Project::STATUS_DRAFT,
        ]);

        return $this->success(
            [
                'project_approval' => $this->formatProjectApproval($projectApproval->fresh()->load('client')),
                'project' => [
                    'id' => $project->id,
                    'status' => $project->status,
                ],
            ],
            'Project rejected successfully'
        );
    }

    private function findProjectByShareLink(string $shareLink): Project
    {
        $project = Project::query()
            ->where('share_link', $shareLink)
            ->first();

        if (! $project) {
            abort(404, 'Project not found');
        }

        return $project;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatProjectApproval(ProjectApproval $projectApproval): array
    {
        return [
            'id' => $projectApproval->id,
            'project_id' => $projectApproval->project_id,
            'projectId' => $projectApproval->project_id,
            'client_id' => $projectApproval->client_id,
            'clientId' => $projectApproval->client_id,
            'comment' => $projectApproval->comment,
            'status' => $projectApproval->status,
            'client' => $projectApproval->relationLoaded('client') && $projectApproval->client
                ? [
                    'id' => $projectApproval->client->id,
                    'name' => $projectApproval->client->name,
                    'email' => $projectApproval->client->email,
                ]
                : null,
            'created_at' => $projectApproval->created_at,
            'createdAt' => $projectApproval->created_at,
            'updated_at' => $projectApproval->updated_at,
            'updatedAt' => $projectApproval->updated_at,
        ];
    }
}
