<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Project;
use App\Models\User;

class ClientProjectLinker
{
    public static function resolve(User $clientUser, Project $project): Client
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
}
