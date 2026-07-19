<?php

namespace App\Support;

use App\Models\ScopeItem;
use App\Models\ScopeSection;

class ScopeFormatter
{
    /**
     * @return array<string, mixed>
     */
    public static function section(ScopeSection $section, bool $withItems = true): array
    {
        $data = [
            'id' => $section->id,
            'project_id' => $section->project_id,
            'projectId' => $section->project_id,
            'title' => $section->title,
            'position' => $section->position,
            'created_at' => $section->created_at,
            'createdAt' => $section->created_at,
            'updated_at' => $section->updated_at,
            'updatedAt' => $section->updated_at,
        ];

        if ($withItems && $section->relationLoaded('items')) {
            $data['items'] = $section->items
                ->map(fn (ScopeItem $item) => self::item($item))
                ->values()
                ->all();
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    public static function item(ScopeItem $item): array
    {
        return [
            'id' => $item->id,
            'section_id' => $item->section_id,
            'sectionId' => $item->section_id,
            'title' => $item->title,
            'description' => $item->description,
            'status' => $item->statusForFrontend(),
            'status_value' => $item->status,
            'position' => $item->position,
            'created_at' => $item->created_at,
            'createdAt' => $item->created_at,
            'updated_at' => $item->updated_at,
            'updatedAt' => $item->updated_at,
        ];
    }

    /**
     * @param  iterable<ScopeSection>  $sections
     * @return list<array<string, mixed>>
     */
    public static function sections(iterable $sections): array
    {
        return collect($sections)
            ->map(fn (ScopeSection $section) => self::section($section))
            ->values()
            ->all();
    }
}
