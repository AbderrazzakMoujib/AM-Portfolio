<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::query();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if (in_array($request->query('status'), ['draft', 'published'], true)) {
            $query->where('status', $request->query('status'));
        }

        $projects = $query
            ->orderBy('sort_order')
            ->latest()
            ->paginate(10);

        return response()->json($projects);
    }

    
public function store(Request $request): JsonResponse
{
    $request->merge([
        'slug' => Str::slug(
            $request->input('slug')
                ?: $request->input('title', '')
        ),
    ]);

    $data = $request->validate($this->rules());

    $project = Project::create($data);

    return response()->json([
        'message' => 'Projet créé avec succès.',
        'project' => $project,
    ], 201);
}


    public function show(Project $project): JsonResponse
    {
        return response()->json([
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate(
            $this->rules($project, true)
        );

        if (isset($data['title']) && !isset($data['slug'])) {
            // Preserve the existing slug unless explicitly changed.
            unset($data['slug']);
        }

        $project->update($data);

        return response()->json([
            'message' => 'Projet modifié avec succès.',
            'project' => $project->fresh(),
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json([
            'message' => 'Projet supprimé avec succès.',
        ]);
    }

    private function rules(
        ?Project $project = null,
        bool $updating = false
    ): array {
        $required = $updating ? 'sometimes' : 'required';

        return [
            'title' => [
                $required,
                'string',
                'max:255',
            ],
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('projects', 'slug')->ignore($project?->id),
            ],
            'category' => [
                $required,
                'string',
                'max:100',
            ],
            'description' => [
                $required,
                'string',
                'max:5000',
            ],
            'content' => [
                'nullable',
                'string',
            ],
            'technologies' => [
                'nullable',
                'array',
            ],
            'technologies.*' => [
                'string',
                'max:100',
            ],
            'cover_image' => [
                'nullable',
                'string',
                'max:2048',
            ],
            'project_url' => [
                'nullable',
                'url:http,https',
                'max:2048',
            ],
            'github_url' => [
                'nullable',
                'url:http,https',
                'max:2048',
            ],
            'status' => [
                'sometimes',
                Rule::in(['draft', 'published']),
            ],
            'featured' => [
                'sometimes',
                'boolean',
            ],
            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
            ],
        ];
    }
}
