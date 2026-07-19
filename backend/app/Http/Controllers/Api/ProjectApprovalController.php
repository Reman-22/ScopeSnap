<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogger;
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

        $project->load('approvalClient');

        if ($project->approval_status === null) {
            return $this->notFound('No project approval record found for this project');
        }

        return $this->success(
            ['project_approval' => $project->approvalPayload()],
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

        if (! $project->hasPendingApproval()) {
            return $this->error('No pending project approval found for this project', 422);
        }

        $client = ClientProjectLinker::resolve($clientUser, $project);

        $project->update([
            'client_id' => $client->id,
            'approved_at' => now(),
            'status' => Project::STATUS_APPROVED,
            'approval_status' => Project::APPROVAL_STATUS_APPROVED,
            'approval_comment' => $validator->validated()['comment'] ?? null,
            'approval_client_id' => $client->id,
        ]);

        ActivityLogger::log(
            $project,
            ActivityLog::ACTION_SCOPE_APPROVED,
            "Client \"{$client->name}\" approved the project scope",
            $clientUser
        );

        $project->load('approvalClient');

        return $this->success(
            [
                'project_approval' => $project->approvalPayload(),
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

        if (! $project->hasPendingApproval()) {
            return $this->error('No pending project approval found for this project', 422);
        }

        $client = ClientProjectLinker::resolve($clientUser, $project);

        $project->update([
            'status' => Project::STATUS_DRAFT,
            'approval_status' => Project::APPROVAL_STATUS_REJECTED,
            'approval_comment' => $validator->validated()['comment'] ?? null,
            'approval_client_id' => $client->id,
        ]);

        ActivityLogger::log(
            $project,
            ActivityLog::ACTION_SCOPE_REJECTED,
            "Client \"{$client->name}\" rejected the project scope",
            $clientUser
        );

        $project->load('approvalClient');

        return $this->success(
            [
                'project_approval' => $project->approvalPayload(),
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
}
