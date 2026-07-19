<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScopeItem extends Model
{
    public const STATUS_INCLUDED = 'included';

    public const STATUS_EXCLUDED = 'excluded';

    public const STATUS_NEEDS_REVIEW = 'needs_review';

    /**
     * @var list<string>
     */
    public const STATUSES = [
        self::STATUS_INCLUDED,
        self::STATUS_EXCLUDED,
        self::STATUS_NEEDS_REVIEW,
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'section_id',
        'title',
        'description',
        'status',
        'position',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(ScopeSection::class, 'section_id');
    }

    public function statusForFrontend(): string
    {
        return $this->status === self::STATUS_NEEDS_REVIEW ? 'pending' : $this->status;
    }
}
