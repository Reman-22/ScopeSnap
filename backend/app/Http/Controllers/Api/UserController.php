<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $this->normalizeRoleInput($request);

        $validator = Validator::make($request->all(), $this->registrationRules());

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $validator->validated();

        if ($request->hasFile('img')) {
            $data['img'] = $request->file('img')->store('users', 'public');
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone'] ?? null,
            'img' => $data['img'] ?? null,
            'role' => (bool) $data['role'],
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->created([
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 'Account created successfully');
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:64'],
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $credentials = $validator->validated();

        if (! Auth::attempt($credentials)) {
            return $this->error('Invalid email or password', 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 'Login successful');
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return $this->success([
            'user' => $this->formatUser($user),
        ], 'User profile retrieved');
    }

    public function update(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->normalizeRoleInput($request);

        $validator = Validator::make($request->all(), $this->updateRules($user));

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $validator->validated();

        if ($request->hasFile('img')) {
            if ($user->img) {
                Storage::disk('public')->delete($user->img);
            }

            $data['img'] = $request->file('img')->store('users', 'public');
        }

        if (array_key_exists('role', $data)) {
            $data['role'] = (bool) $data['role'];
        }

        $user->update($data);

        return $this->success([
            'user' => $this->formatUser($user->fresh()),
        ], 'Profile updated successfully');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'img' => $user->img ? Storage::disk('public')->url($user->img) : null,
            'role' => $user->role,
            'role_label' => $user->roleLabel(),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    private function normalizeRoleInput(Request $request): void
    {
        if (! $request->has('role')) {
            return;
        }

        $role = $request->input('role');

        if (in_array($role, ['freelancer', 'Freelancer', 1, '1', true], true)) {
            $request->merge(['role' => 1]);

            return;
        }

        if (in_array($role, ['client', 'Client', 0, '0', false], true)) {
            $request->merge(['role' => 0]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function registrationRules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                Password::min(8)->max(64)->mixedCase(),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'img' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:2048'],
            'role' => ['required', Rule::in([0, 1, '0', '1', true, false])],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function updateRules(User $user): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'min:3', 'max:100'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => [
                'sometimes',
                'required',
                'string',
                Password::min(8)->max(64)->mixedCase(),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'img' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:2048'],
            'role' => ['sometimes', 'required', Rule::in([0, 1, '0', '1', true, false])],
        ];
    }
}
