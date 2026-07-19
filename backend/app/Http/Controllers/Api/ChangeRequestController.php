<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChangeRequest;
use App\Models\ActivityLog;
use App\Models\Client;
use App\Models\Project;
use App\Models\ScopeItem;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Support\ChangeRequestFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ChangeRequestController extends Controller
{
    public function indexForClient(Request $request): JsonResponse
    {
        /** @var User $clientUser */
        $clientUser = $request->user();

        $clientIds = Client::query()
            ->where('user_id', $clientUser->id)
            ->pluck('id');

        $changeRequests = ChangeRequest::query()
            ->whereIn('client_id', $clientIds)
            ->with(['client', 'item', 'project'])
            ->latest()
            ->get();

        return $this->success(
            ['change_requests' => ChangeRequestFormatter::collection($changeRequests)],
            'Change requests retrieved'
        );
    }

    public function indexForProject(Request $request, Project $project): JsonResponse
    {
        $this->ensureOwnedByFreelancer($request, $project);

        $changeRequests = $project->changeRequests()
            ->with(['client', 'item'])
            ->latest()
            ->get();

        return $this->success(
            ['change_requests' => ChangeRequestFormatter::collection($changeRequests)],
            'Change requests retrieved'
        );
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        /** @var User $clientUser */
        $clientUser = $request->user();

        if (! $project->isApproved()) {
            return $this->error('Change requests can only be created for approved projects', 422);
        }

        if (! $project->client_id) {
            return $this->error('Change requests require a project that was approved by a linked client', 422);
        }

        $client = Client::query()
            ->where('id', $project->client_id)
            ->where('user_id', $clientUser->id)
            ->first();

        if (! $client) {
            return $this->forbidden('You are not the linked client for this project');
        }

        $validator = Validator::make($request->all(), $this->storeRules($project));

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $validator->validated();

        $changeRequest = ChangeRequest::create([
            'project_id' => $project->id,
            'client_id' => $client->id,
            'item_id' => $data['item_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => ChangeRequest::STATUS_PENDING,
        ]);

        ActivityLogger::log(
            $project,
            ActivityLog::ACTION_CHANGE_REQUEST_CREATED,
            "Change request \"{$changeRequest->title}\" was created",
            $clientUser
        );

        $changeRequest->load(['client', 'item']);

        return $this->created(
            ['change_request' => ChangeRequestFormatter::format($changeRequest)],
            'Change request created successfully'
        );
    }

    public function show(Request $request, ChangeRequest $changeRequest): JsonResponse
    {
        $this->ensureCanView($request, $changeRequest);

        $changeRequest->load(['client', 'item', 'project']);

        return $this->success(
            ['change_request' => ChangeRequestFormatter::format($changeRequest)],
            'Change request retrieved'
        );
    }

    public function updateStatus(Request $request, ChangeRequest $changeRequest): JsonResponse
    {
        $project = $changeRequest->project;

        if ($project->owner_id !== $request->user()?->id) {
            return $this->forbidden('Only the project owner can update change request status');
        }

        if ($changeRequest->status !== ChangeRequest::STATUS_PENDING) {
            return $this->error('Only pending change requests can be updated', 422);
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in([
                ChangeRequest::STATUS_APPROVED,
                ChangeRequest::STATUS_REJECTED,
                'accepted',
            ])],
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $validator->validated();
        $status = $data['status'] === 'accepted'
            ? ChangeRequest::STATUS_APPROVED
            : $data['status'];

        $changeRequest->update([
            'status' => $status,
            'reason' => $data['reason'] ?? null,
        ]);

        if ($status === ChangeRequest::STATUS_APPROVED) {
            ActivityLogger::log(
                $project,
                ActivityLog::ACTION_CHANGE_REQUEST_APPROVED,
                "Change request \"{$changeRequest->title}\" was approved",
                $request->user()
            );
        } else {
            ActivityLogger::log(
                $project,
                ActivityLog::ACTION_CHANGE_REQUEST_REJECTED,
                "Change request \"{$changeRequest->title}\" was rejected",
                $request->user()
            );
        }

        $changeRequest->load(['client', 'item']);

        return $this->success(
            ['change_request' => ChangeRequestFormatter::format($changeRequest->fresh())],
            'Change request updated successfully'
        );
    }

    public function destroy(Request $request, ChangeRequest $changeRequest): JsonResponse
    {
        $changeRequest->load(['project', 'client']);

        if ($changeRequest->status !== ChangeRequest::STATUS_PENDING) {
            return $this->error('Only pending change requests can be deleted', 422);
        }

        $isOwner = $changeRequest->project->owner_id === $request->user()?->id;
        $isClient = $changeRequest->client->user_id === $request->user()?->id;

        if (! $isOwner && ! $isClient) {
            return $this->forbidden('You do not have access to this change request');
        }

        $title = $changeRequest->title;
        $project = $changeRequest->project;

        $changeRequest->delete();

        ActivityLogger::log(
            $project,
            ActivityLog::ACTION_CHANGE_REQUEST_DELETED,
            "Change request \"{$title}\" was deleted",
            $request->user()
        );

        return $this->success(null, 'Change request deleted successfully');
    }

    /**
     * @return array<string, mixed>
     */
    private function storeRules(Project $project): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['required', 'string', 'min:3', 'max:5000'],
            'item_id' => [
                'nullable',
                'integer',
                function (string $attribute, mixed $value, \Closure $fail) use ($project): void {
                    if (! $value) {
                        return;
                    }

                    $exists = ScopeItem::query()
                        ->where('id', $value)
                        ->whereHas('section', fn ($query) => $query->where('project_id', $project->id))
                        ->exists();

                    if (! $exists) {
                        $fail('The selected scope item does not belong to this project.');
                    }
                },
            ],
        ];
    }

    private function ensureOwnedByFreelancer(Request $request, Project $project): void
    {
        if ($project->owner_id !== $request->user()?->id) {
            abort(403, 'You do not have access to this project');
        }
    }

    private function ensureCanView(Request $request, ChangeRequest $changeRequest): void
    {
        $changeRequest->loadMissing(['project', 'client']);

        $user = $request->user();

        $isOwner = $changeRequest->project->owner_id === $user?->id;
        $isClient = $changeRequest->client->user_id === $user?->id;

        if (! $isOwner && ! $isClient) {
            abort(403, 'You do not have access to this change request');
        }
    }
}
