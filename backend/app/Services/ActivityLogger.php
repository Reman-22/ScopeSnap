<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;

class ActivityLogger
{
    public static function log(
        Project $project,
        string $action,
        string $description,
        ?User $user = null
    ): ActivityLog {
        return ActivityLog::create([
            'project_id' => $project->id,
            'user_id' => $user?->id ?? auth()->id(),
            'description' => $description,
            'action' => $action,
        ]);
    }
}
