<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use App\Support\ScopeFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $freelancer */
        $freelancer = $request->user();

        $projects = Project::query()
            ->where('owner_id', $freelancer->id)
            ->with(['client', 'scopeSections.items'])
            ->latest()
            ->get()
            ->map(fn (Project $project) => $this->formatProject($project));

        return $this->success(['projects' => $projects], 'Projects retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $freelancer */
        $freelancer = $request->user();

        $validator = Validator::make($request->all(), $this->storeRules());

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $project = Project::create([
            ...$validator->validated(),
            'owner_id' => $freelancer->id,
            'client_id' => null,
            'status' => Project::STATUS_DRAFT,
        ]);

        return $this->created(
            ['project' => $this->formatProject($project)],
            'Project created successfully'
        );
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->ensureOwnedByFreelancer($request, $project);

        $project->load(['client', 'scopeSections.items']);

        return $this->success(
            ['project' => $this->formatProject($project)],
            'Project retrieved'
        );
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->ensureOwnedByFreelancer($request, $project);

        if ($project->isApproved()) {
            return $this->error('Approved projects cannot be edited', 422);
        }

        $validator = Validator::make($request->all(), $this->updateRules());

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $project->update($validator->validated());

        return $this->success(
            ['project' => $this->formatProject($project->fresh()->load(['client', 'scopeSections.items']))],
            'Project updated successfully'
        );
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->ensureOwnedByFreelancer($request, $project);

        $project->delete();

        return $this->success(null, 'Project deleted successfully');
    }

    public function send(Request $request, Project $project): JsonResponse
    {
        $this->ensureOwnedByFreelancer($request, $project);

        if ($project->status !== Project::STATUS_DRAFT) {
            return $this->error('Only draft projects can be sent to the client', 422);
        }

        $project->update(['status' => Project::STATUS_SENT]);

        return $this->success(
            ['project' => $this->formatProject($project->fresh()->load(['client', 'scopeSections.items']))],
            'Project sent to client'
        );
    }

    public function showByShareLink(string $shareLink): JsonResponse
    {
        $project = Project::query()
            ->where('share_link', $shareLink)
            ->with(['client', 'scopeSections.items'])
            ->first();

        if (! $project) {
            return $this->notFound('Project not found');
        }

        return $this->success(
            ['project' => $this->formatProject($project)],
            'Project retrieved'
        );
    }

    public function approve(Request $request, string $shareLink): JsonResponse
    {
        /** @var User $clientUser */
        $clientUser = $request->user();

        $project = Project::query()
            ->where('share_link', $shareLink)
            ->first();

        if (! $project) {
            return $this->notFound('Project not found');
        }

        if ($project->isApproved()) {
            return $this->error('Project is already approved', 422);
        }

        if ($project->status !== Project::STATUS_SENT) {
            return $this->error('Project must be sent before it can be approved', 422);
        }

        $client = $this->resolveClientForProject($clientUser, $project);

        $project->update([
            'client_id' => $client->id,
            'approved_at' => now(),
            'status' => Project::STATUS_APPROVED,
        ]);

        return $this->success(
            ['project' => $this->formatProject($project->fresh()->load(['client', 'scopeSections.items']))],
            'Project approved successfully'
        );
    }

    private function ensureOwnedByFreelancer(Request $request, Project $project): void
    {
        if ($project->owner_id !== $request->user()?->id) {
            abort(403, 'You do not have access to this project');
        }
    }

    private function resolveClientForProject(User $clientUser, Project $project): Client
    {
        $client = Client::query()
            ->where('owner_id', $project->owner_id)
            ->where(function ($query) use ($clientUser) {
                $query->where('user_id', $clientUser->id)
                    ->orWhere('email', $clientUser->email);
            })
            ->first();

        if (! $client) {
            $client = Client::create([
                'owner_id' => $project->owner_id,
                'user_id' => $clientUser->id,
                'name' => $clientUser->name,
                'email' => $clientUser->email,
                'phone' => $clientUser->phone,
            ]);
        } elseif (! $client->user_id) {
            $client->update(['user_id' => $clientUser->id]);
        }

        return $client;
    }

    /**
     * @return array<string, mixed>
     */
    private function storeRules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function updateRules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['sometimes', 'required', Rule::in(Project::STATUSES)],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatProject(Project $project): array
    {
        return [
            'id' => $project->id,
            'name' => $project->title,
            'title' => $project->title,
            'description' => $project->description,
            'client_id' => $project->client_id,
            'clientId' => $project->client_id,
            'owner_id' => $project->owner_id,
            'ownerId' => $project->owner_id,
            'approved_at' => $project->approved_at,
            'approvedAt' => $project->approved_at,
            'share_link' => $project->share_link,
            'shareLink' => $project->share_link,
            'status' => $project->status,
            'client' => $project->relationLoaded('client') && $project->client
                ? [
                    'id' => $project->client->id,
                    'name' => $project->client->name,
                    'email' => $project->client->email,
                    'company' => $project->client->company,
                ]
                : null,
            'scopeSections' => $project->relationLoaded('scopeSections')
                ? ScopeFormatter::sections($project->scopeSections)
                : [],
            'created_at' => $project->created_at,
            'createdAt' => $project->created_at,
            'updated_at' => $project->updated_at,
            'updatedAt' => $project->updated_at,
        ];
    }
}
