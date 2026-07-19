<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\Project;
use App\Models\User;
use App\Services\ClientProjectLinker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApprovalController extends Controller
{
    public function show(Request $request, Project $project): JsonResponse
    {
        if ($project->owner_id !== $request->user()?->id) {
            abort(403, 'You do not have access to this project');
        }

        $approval = $project->approval()->with('client')->first();

        if (! $approval) {
            return $this->notFound('No approval record found for this project');
        }

        return $this->success(
            ['approval' => $this->formatApproval($approval)],
            'Approval retrieved'
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

        $approval = $project->approval;

        if (! $approval || $approval->status !== Approval::STATUS_PENDING) {
            return $this->error('No pending approval found for this project', 422);
        }

        $client = ClientProjectLinker::resolve($clientUser, $project);

        $approval->update([
            'client_id' => $client->id,
            'comment' => $validator->validated()['comment'] ?? null,
            'status' => Approval::STATUS_APPROVED,
        ]);

        $project->update([
            'client_id' => $client->id,
            'approved_at' => now(),
            'status' => Project::STATUS_APPROVED,
        ]);

        return $this->success(
            [
                'approval' => $this->formatApproval($approval->fresh()->load('client')),
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

        $approval = $project->approval;

        if (! $approval || $approval->status !== Approval::STATUS_PENDING) {
            return $this->error('No pending approval found for this project', 422);
        }

        $client = ClientProjectLinker::resolve($clientUser, $project);

        $approval->update([
            'client_id' => $client->id,
            'comment' => $validator->validated()['comment'] ?? null,
            'status' => Approval::STATUS_REJECTED,
        ]);

        $project->update([
            'status' => Project::STATUS_DRAFT,
        ]);

        return $this->success(
            [
                'approval' => $this->formatApproval($approval->fresh()->load('client')),
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
    private function formatApproval(Approval $approval): array
    {
        return [
            'id' => $approval->id,
            'project_id' => $approval->project_id,
            'projectId' => $approval->project_id,
            'client_id' => $approval->client_id,
            'clientId' => $approval->client_id,
            'comment' => $approval->comment,
            'status' => $approval->status,
            'client' => $approval->relationLoaded('client') && $approval->client
                ? [
                    'id' => $approval->client->id,
                    'name' => $approval->client->name,
                    'email' => $approval->client->email,
                ]
                : null,
            'created_at' => $approval->created_at,
            'createdAt' => $approval->created_at,
            'updated_at' => $approval->updated_at,
            'updatedAt' => $approval->updated_at,
        ];
    }
}
