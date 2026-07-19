<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    public const ACTION_PROJECT_CREATED = 'project_created';

    public const ACTION_SECTION_ADDED = 'section_added';

    public const ACTION_ITEM_ADDED = 'item_added';

    public const ACTION_SCOPE_APPROVED = 'scope_approved';

    public const ACTION_CHANGE_REQUEST_CREATED = 'change_request_created';

    public const ACTION_CHANGE_REQUEST_APPROVED = 'change_request_approved';

    /**
     * @var list<string>
     */
    public const ACTIONS = [
        self::ACTION_PROJECT_CREATED,
        self::ACTION_SECTION_ADDED,
        self::ACTION_ITEM_ADDED,
        self::ACTION_SCOPE_APPROVED,
        self::ACTION_CHANGE_REQUEST_CREATED,
        self::ACTION_CHANGE_REQUEST_APPROVED,
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
            default => $this->action,
        };
    }
}
