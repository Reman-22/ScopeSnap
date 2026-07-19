<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ScopeItem;
use App\Models\ActivityLog;
use App\Services\ActivityLogger;
use App\Models\ScopeSection;
use App\Support\ScopeFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ScopeItemController extends Controller
{
    public function index(Request $request, Project $project, ScopeSection $section): JsonResponse
    {
        $this->ensureSectionBelongsToProject($request, $project, $section);

        $items = $section->items()->orderBy('position')->get();

        return $this->success(
            ['items' => $items->map(fn (ScopeItem $item) => ScopeFormatter::item($item))->values()],
            'Scope items retrieved'
        );
    }

    public function store(Request $request, Project $project, ScopeSection $section): JsonResponse
    {
        $this->ensureSectionBelongsToProject($request, $project, $section);
        $this->ensureProjectEditable($project);

        $validator = Validator::make($request->all(), $this->rules());

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $validator->validated();
        $position = $data['position'] ?? (($section->items()->max('position') ?? -1) + 1);

        $item = $section->items()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => $this->normalizeStatus($data['status'] ?? ScopeItem::STATUS_INCLUDED),
            'position' => $position,
        ]);

        ActivityLogger::log(
            $project,
            ActivityLog::ACTION_ITEM_ADDED,
            "Item \"{$item->title}\" was added to section \"{$section->title}\"",
            $request->user()
        );

        return $this->created(
            ['item' => ScopeFormatter::item($item)],
            'Scope item created successfully'
        );
    }

    public function show(Request $request, Project $project, ScopeSection $section, ScopeItem $item): JsonResponse
    {
        $this->ensureItemBelongsToSection($request, $project, $section, $item);

        return $this->success(
            ['item' => ScopeFormatter::item($item)],
            'Scope item retrieved'
        );
    }

    public function update(Request $request, Project $project, ScopeSection $section, ScopeItem $item): JsonResponse
    {
        $this->ensureItemBelongsToSection($request, $project, $section, $item);
        $this->ensureProjectEditable($project);

        $validator = Validator::make($request->all(), $this->rules(isUpdate: true));

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $validator->validated();

        if (array_key_exists('status', $data)) {
            $data['status'] = $this->normalizeStatus($data['status']);
        }

        $item->update($data);

        return $this->success(
            ['item' => ScopeFormatter::item($item->fresh())],
            'Scope item updated successfully'
        );
    }

    public function destroy(Request $request, Project $project, ScopeSection $section, ScopeItem $item): JsonResponse
    {
        $this->ensureItemBelongsToSection($request, $project, $section, $item);
        $this->ensureProjectEditable($project);

        $item->delete();

        return $this->success(null, 'Scope item deleted successfully');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(bool $isUpdate = false): array
    {
        $required = $isUpdate ? 'sometimes' : 'required';

        return [
            'title' => [$required, 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', Rule::in([
                ScopeItem::STATUS_INCLUDED,
                ScopeItem::STATUS_EXCLUDED,
                ScopeItem::STATUS_NEEDS_REVIEW,
                'pending',
            ])],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }

    private function normalizeStatus(string $status): string
    {
        return $status === 'pending' ? ScopeItem::STATUS_NEEDS_REVIEW : $status;
    }

    private function ensureSectionBelongsToProject(
        Request $request,
        Project $project,
        ScopeSection $section
    ): void {
        if ($project->owner_id !== $request->user()?->id) {
            abort(403, 'You do not have access to this project');
        }

        if ($section->project_id !== $project->id) {
            abort(404, 'Scope section not found');
        }
    }

    private function ensureItemBelongsToSection(
        Request $request,
        Project $project,
        ScopeSection $section,
        ScopeItem $item
    ): void {
        $this->ensureSectionBelongsToProject($request, $project, $section);

        if ($item->section_id !== $section->id) {
            abort(404, 'Scope item not found');
        }
    }

    private function ensureProjectEditable(Project $project): void
    {
        if ($project->isApproved()) {
            abort(422, 'Approved projects cannot be edited');
        }
    }
}
