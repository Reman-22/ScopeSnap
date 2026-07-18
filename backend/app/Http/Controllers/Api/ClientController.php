<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $freelancer */
        $freelancer = $request->user();

        $clients = Client::query()
            ->where('owner_id', $freelancer->id)
            ->latest()
            ->get()
            ->map(fn (Client $client) => $this->formatClient($client));

        return $this->success(['clients' => $clients], 'Clients retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $freelancer */
        $freelancer = $request->user();

        $validator = Validator::make($request->all(), $this->rules($freelancer));

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $client = Client::create([
            ...$validator->validated(),
            'owner_id' => $freelancer->id,
        ]);

        return $this->created(
            ['client' => $this->formatClient($client)],
            'Client created successfully'
        );
    }

    public function show(Request $request, Client $client): JsonResponse
    {
        $this->ensureOwnedByFreelancer($request, $client);

        return $this->success(
            ['client' => $this->formatClient($client)],
            'Client retrieved'
        );
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        /** @var User $freelancer */
        $freelancer = $request->user();

        $this->ensureOwnedByFreelancer($request, $client);

        $validator = Validator::make($request->all(), $this->rules($freelancer, $client));

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $client->update($validator->validated());

        return $this->success(
            ['client' => $this->formatClient($client->fresh())],
            'Client updated successfully'
        );
    }

    public function destroy(Request $request, Client $client): JsonResponse
    {
        $this->ensureOwnedByFreelancer($request, $client);

        $client->delete();

        return $this->success(null, 'Client deleted successfully');
    }

    private function ensureOwnedByFreelancer(Request $request, Client $client): void
    {
        if ($client->owner_id !== $request->user()?->id) {
            abort(403, 'You do not have access to this client');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(User $freelancer, ?Client $client = null): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:100'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('clients', 'email')
                    ->where('owner_id', $freelancer->id)
                    ->ignore($client?->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatClient(Client $client): array
    {
        return [
            'id' => $client->id,
            'owner_id' => $client->owner_id,
            'user_id' => $client->user_id,
            'name' => $client->name,
            'email' => $client->email,
            'phone' => $client->phone,
            'company' => $client->company,
            'created_at' => $client->created_at,
            'updated_at' => $client->updated_at,
        ];
    }
}
