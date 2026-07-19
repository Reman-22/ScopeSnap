<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ScopeSection;
use App\Support\ScopeFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScopeSectionController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->ensureOwnedByFreelancer($request, $project);

        $sections = $project->scopeSections()
            ->with('items')
            ->orderBy('position')
            ->get();

        return $this->success(
            ['sections' => ScopeFormatter::sections($sections)],
            'Scope sections retrieved'
        );
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->ensureOwnedByFreelancer($request, $project);
        $this->ensureProjectEditable($project);

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $validator->validated();
        $position = $data['position'] ?? (($project->scopeSections()->max('position') ?? -1) + 1);

        $section = $project->scopeSections()->create([
            'title' => $data['title'],
            'position' => $position,
        ]);

        $section->load('items');

        return $this->created(
            ['section' => ScopeFormatter::section($section)],
            'Scope section created successfully'
        );
    }

    public function show(Request $request, Project $project, ScopeSection $section): JsonResponse
    {
        $this->ensureSectionBelongsToProject($request, $project, $section);

        $section->load('items');

        return $this->success(
            ['section' => ScopeFormatter::section($section)],
            'Scope section retrieved'
        );
    }

    public function update(Request $request, Project $project, ScopeSection $section): JsonResponse
    {
        $this->ensureSectionBelongsToProject($request, $project, $section);
        $this->ensureProjectEditable($project);

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'position' => ['sometimes', 'required', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $section->update($validator->validated());
        $section->load('items');

        return $this->success(
            ['section' => ScopeFormatter::section($section)],
            'Scope section updated successfully'
        );
    }

    public function destroy(Request $request, Project $project, ScopeSection $section): JsonResponse
    {
        $this->ensureSectionBelongsToProject($request, $project, $section);
        $this->ensureProjectEditable($project);

        $section->delete();

        return $this->success(null, 'Scope section deleted successfully');
    }

    private function ensureOwnedByFreelancer(Request $request, Project $project): void
    {
        if ($project->owner_id !== $request->user()?->id) {
            abort(403, 'You do not have access to this project');
        }
    }

    private function ensureSectionBelongsToProject(
        Request $request,
        Project $project,
        ScopeSection $section
    ): void {
        $this->ensureOwnedByFreelancer($request, $project);

        if ($section->project_id !== $project->id) {
            abort(404, 'Scope section not found');
        }
    }

    private function ensureProjectEditable(Project $project): void
    {
        if ($project->isApproved()) {
            abort(422, 'Approved projects cannot be edited');
        }
    }
}
