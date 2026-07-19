<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    public const ACTION_PROJECT_CREATED = 'project_created';

    public const ACTION_PROJECT_UPDATED = 'project_updated';

    public const ACTION_SCOPE_SENT = 'scope_sent';

    public const ACTION_SECTION_ADDED = 'section_added';

    public const ACTION_SECTION_UPDATED = 'section_updated';

    public const ACTION_SECTION_DELETED = 'section_deleted';

    public const ACTION_ITEM_ADDED = 'item_added';

    public const ACTION_ITEM_UPDATED = 'item_updated';

    public const ACTION_ITEM_DELETED = 'item_deleted';

    public const ACTION_SCOPE_APPROVED = 'scope_approved';

    public const ACTION_SCOPE_REJECTED = 'scope_rejected';

    public const ACTION_CHANGE_REQUEST_CREATED = 'change_request_created';

    public const ACTION_CHANGE_REQUEST_APPROVED = 'change_request_approved';

    public const ACTION_CHANGE_REQUEST_REJECTED = 'change_request_rejected';

    public const ACTION_CHANGE_REQUEST_DELETED = 'change_request_deleted';

    /**
     * @var list<string>
     */
    public const ACTIONS = [
        self::ACTION_PROJECT_CREATED,
        self::ACTION_PROJECT_UPDATED,
        self::ACTION_SCOPE_SENT,
        self::ACTION_SECTION_ADDED,
        self::ACTION_SECTION_UPDATED,
        self::ACTION_SECTION_DELETED,
        self::ACTION_ITEM_ADDED,
        self::ACTION_ITEM_UPDATED,
        self::ACTION_ITEM_DELETED,
        self::ACTION_SCOPE_APPROVED,
        self::ACTION_SCOPE_REJECTED,
        self::ACTION_CHANGE_REQUEST_CREATED,
        self::ACTION_CHANGE_REQUEST_APPROVED,
        self::ACTION_CHANGE_REQUEST_REJECTED,
        self::ACTION_CHANGE_REQUEST_DELETED,
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'project_id',
        'user_id',
        'description',
        'action',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function typeForFrontend(): string
    {
        return match ($this->action) {
            self::ACTION_CHANGE_REQUEST_CREATED => 'change_requested',
            self::ACTION_CHANGE_REQUEST_APPROVED => 'change_accepted',
            self::ACTION_CHANGE_REQUEST_REJECTED => 'change_rejected',
            default => $this->action,
        };
    }
}
