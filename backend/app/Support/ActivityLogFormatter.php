<?php

namespace App\Support;

use App\Models\ActivityLog;

class ActivityLogFormatter
{
    /**
     * @return array<string, mixed>
     */
    public static function format(ActivityLog $activityLog): array
    {
        return [
            'id' => $activityLog->id,
            'project_id' => $activityLog->project_id,
            'projectId' => $activityLog->project_id,
            'user_id' => $activityLog->user_id,
            'userId' => $activityLog->user_id,
            'description' => $activityLog->description,
            'action' => $activityLog->action,
            'type' => $activityLog->typeForFrontend(),
            'user' => $activityLog->relationLoaded('user') && $activityLog->user
                ? [
                    'id' => $activityLog->user->id,
                    'name' => $activityLog->user->name,
                    'email' => $activityLog->user->email,
                ]
                : null,
            'timestamp' => $activityLog->created_at,
            'created_at' => $activityLog->created_at,
            'createdAt' => $activityLog->created_at,
        ];
    }

    /**
     * @param  iterable<ActivityLog>  $activityLogs
     * @return list<array<string, mixed>>
     */
    public static function collection(iterable $activityLogs): array
    {
        return collect($activityLogs)
            ->map(fn (ActivityLog $activityLog) => self::format($activityLog))
            ->values()
            ->all();
    }
}
