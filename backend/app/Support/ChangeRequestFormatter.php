<?php

namespace App\Support;

use App\Models\ChangeRequest;

class ChangeRequestFormatter
{
    /**
     * @return array<string, mixed>
     */
    public static function format(ChangeRequest $changeRequest): array
    {
        return [
            'id' => $changeRequest->id,
            'project_id' => $changeRequest->project_id,
            'projectId' => $changeRequest->project_id,
            'client_id' => $changeRequest->client_id,
            'clientId' => $changeRequest->client_id,
            'item_id' => $changeRequest->item_id,
            'itemId' => $changeRequest->item_id,
            'title' => $changeRequest->title,
            'description' => $changeRequest->description,
            'status' => $changeRequest->statusForFrontend(),
            'status_value' => $changeRequest->status,
            'reason' => $changeRequest->reason,
            'client' => $changeRequest->relationLoaded('client') && $changeRequest->client
                ? [
                    'id' => $changeRequest->client->id,
                    'name' => $changeRequest->client->name,
                    'email' => $changeRequest->client->email,
                ]
                : null,
            'item' => $changeRequest->relationLoaded('item') && $changeRequest->item
                ? [
                    'id' => $changeRequest->item->id,
                    'title' => $changeRequest->item->title,
                ]
                : null,
            'created_at' => $changeRequest->created_at,
            'createdAt' => $changeRequest->created_at,
            'updated_at' => $changeRequest->updated_at,
            'updatedAt' => $changeRequest->updated_at,
        ];
    }

    /**
     * @param  iterable<ChangeRequest>  $changeRequests
     * @return list<array<string, mixed>>
     */
    public static function collection(iterable $changeRequests): array
    {
        return collect($changeRequests)
            ->map(fn (ChangeRequest $changeRequest) => self::format($changeRequest))
            ->values()
            ->all();
    }
}
