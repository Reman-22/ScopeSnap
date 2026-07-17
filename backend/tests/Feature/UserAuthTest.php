<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_freelancer(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Ahmed Dev',
            'email' => 'ahmed@example.com',
            'password' => 'Password1',
            'role' => 1,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', true)
            ->assertJsonPath('data.user.role_label', 'freelancer')
            ->assertJsonStructure(['data' => ['token', 'user']]);

        $this->assertDatabaseHas('users', [
            'email' => 'ahmed@example.com',
            'role' => 1,
        ]);
    }

    public function test_user_can_register_as_client_using_string_role(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Sara Client',
            'email' => 'sara@example.com',
            'password' => 'Password1',
            'role' => 'client',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.role', false)
            ->assertJsonPath('data.user.role_label', 'client');
    }

    public function test_registration_rejects_password_without_mixed_case(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password1',
            'role' => 0,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_user_can_register_without_image(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'No Image User',
            'email' => 'noimage@example.com',
            'password' => 'Password1',
            'role' => 0,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.img', null);

        $this->assertDatabaseHas('users', [
            'email' => 'noimage@example.com',
            'img' => null,
        ]);
    }

    public function test_registration_rejects_invalid_file_when_image_is_uploaded(): void
    {
        Storage::fake('public');

        $response = $this->post('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'media@example.com',
            'password' => 'Password1',
            'role' => 1,
            'img' => UploadedFile::fake()->create('video.mp4', 100, 'video/mp4'),
        ], ['Accept' => 'application/json']);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_authenticated_user_can_access_me_endpoint(): void
    {
        $user = User::factory()->create([
            'role' => User::ROLE_FREELANCER,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.user.email', $user->email);
    }
}
