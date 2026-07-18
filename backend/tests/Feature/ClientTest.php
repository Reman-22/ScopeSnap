<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    public function test_freelancer_can_create_client(): void
    {
        $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        Sanctum::actingAs($freelancer);

        $response = $this->postJson('/api/clients', [
            'name' => 'Sara Client',
            'email' => 'sara@example.com',
            'phone' => '0501234567',
            'company' => 'Sara Store',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.client.name', 'Sara Client');

        $this->assertDatabaseHas('clients', [
            'owner_id' => $freelancer->id,
            'email' => 'sara@example.com',
        ]);
    }

    public function test_client_role_cannot_create_contacts(): void
    {
        $clientUser = User::factory()->create(['role' => User::ROLE_CLIENT]);
        Sanctum::actingAs($clientUser);

        $response = $this->postJson('/api/clients', [
            'name' => 'Blocked Client',
            'email' => 'blocked@example.com',
        ]);

        $response->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_freelancer_only_sees_own_clients(): void
    {
        $freelancerA = User::factory()->create(['role' => User::ROLE_FREELANCER]);
        $freelancerB = User::factory()->create(['role' => User::ROLE_FREELANCER]);

        Client::create([
            'owner_id' => $freelancerA->id,
            'name' => 'Mine',
            'email' => 'mine@example.com',
        ]);

        Client::create([
            'owner_id' => $freelancerB->id,
            'name' => 'Theirs',
            'email' => 'theirs@example.com',
        ]);

        Sanctum::actingAs($freelancerA);

        $response = $this->getJson('/api/clients');

        $response->assertOk()
            ->assertJsonCount(1, 'data.clients')
            ->assertJsonPath('data.clients.0.email', 'mine@example.com');
    }
}
