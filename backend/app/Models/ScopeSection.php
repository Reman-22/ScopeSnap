<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScopeSection extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'project_id',
        'title',
        'position',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * @return HasMany<ScopeItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(ScopeItem::class, 'section_id')->orderBy('position');
    }
}
