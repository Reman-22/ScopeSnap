<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_CLIENT = 0;

    public const ROLE_FREELANCER = 1;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'img',
        'role',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'boolean',
        ];
    }

    public function isFreelancer(): bool
    {
        return (bool) $this->role;
    }

    public function isClient(): bool
    {
        return ! (bool) $this->role;
    }

    public function roleLabel(): string
    {
        return $this->isFreelancer() ? 'freelancer' : 'client';
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Client, $this>
     */
    public function clients()
    {
        return $this->hasMany(Client::class, 'owner_id');
    }
}
