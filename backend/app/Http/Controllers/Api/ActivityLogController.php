<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use App\Support\ActivityLogFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->ensureCanViewProject($request, $project);

        $activityLogs = $project->activityLogs()
            ->with('user')
            ->latest()
            ->get();

        return $this->success(
            ['activity_logs' => ActivityLogFormatter::collection($activityLogs)],
            'Activity logs retrieved'
        );
    }

    private function ensureCanViewProject(Request $request, Project $project): void
    {
        $user = $request->user();

        if ($project->owner_id === $user?->id) {
            return;
        }

        if ($project->client_id) {
            $isProjectClient = Client::query()
                ->where('id', $project->client_id)
                ->where('user_id', $user?->id)
                ->exists();

            if ($isProjectClient) {
                return;
            }
        }

        abort(403, 'You do not have access to this project activity log');
    }
}
