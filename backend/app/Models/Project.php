<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Project extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_SENT = 'sent';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_IN_PROGRESS = 'in-progress';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const APPROVAL_STATUS_PENDING = 'pending';

    public const APPROVAL_STATUS_APPROVED = 'approved';

    public const APPROVAL_STATUS_REJECTED = 'rejected';

    /**
     * @var list<string>
     */
    public const APPROVAL_STATUSES = [
        self::APPROVAL_STATUS_PENDING,
        self::APPROVAL_STATUS_APPROVED,
        self::APPROVAL_STATUS_REJECTED,
    ];

    /**
     * @var list<string>
     */
    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_SENT,
        self::STATUS_APPROVED,
        self::STATUS_IN_PROGRESS,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'description',
        'client_id',
        'owner_id',
        'approved_at',
        'approval_status',
        'approval_comment',
        'approval_client_id',
        'share_link',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (empty($project->share_link)) {
                $project->share_link = (string) Str::uuid();
            }
        });
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function approvalClient(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'approval_client_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * @return HasMany<ScopeSection, $this>
     */
    public function scopeSections(): HasMany
    {
        return $this->hasMany(ScopeSection::class)->orderBy('position');
    }

    /**
     * @return HasMany<ChangeRequest, $this>
     */
    public function changeRequests(): HasMany
    {
        return $this->hasMany(ChangeRequest::class);
    }

    /**
     * @return HasMany<ActivityLog, $this>
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class)->latest();
    }

    public function isApproved(): bool
    {
        return in_array($this->status, [
            self::STATUS_APPROVED,
            self::STATUS_IN_PROGRESS,
            self::STATUS_COMPLETED,
        ], true);
    }

    public function hasPendingApproval(): bool
    {
        return $this->approval_status === self::APPROVAL_STATUS_PENDING;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function approvalPayload(): ?array
    {
        if ($this->approval_status === null) {
            return null;
        }

        $client = $this->relationLoaded('approvalClient') ? $this->approvalClient : null;

        return [
            'id' => $this->id,
            'project_id' => $this->id,
            'projectId' => $this->id,
            'client_id' => $this->approval_client_id,
            'clientId' => $this->approval_client_id,
            'comment' => $this->approval_comment,
            'status' => $this->approval_status,
            'client' => $client
                ? [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                ]
                : null,
            'created_at' => $this->updated_at,
            'createdAt' => $this->updated_at,
            'updated_at' => $this->updated_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
