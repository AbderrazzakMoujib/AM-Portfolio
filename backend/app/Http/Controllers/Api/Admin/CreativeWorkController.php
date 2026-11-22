<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CreativeWork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CreativeWorkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $works = CreativeWork::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where(
                    'title',
                    'like',
                    '%' . $request->query('search') . '%'
                );
            })
            ->orderBy('sort_order')
            ->latest()
            ->paginate(12);

        return response()->json($works);
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

        $work = CreativeWork::create($data);

        return response()->json([
            'message' => 'Création ajoutée.',
            'data' => $work,
        ], 201);
    }

    public function show(CreativeWork $creativeWork): JsonResponse
    {
        return response()->json([
            'data' => $creativeWork,
        ]);
    }

    public function update(
        Request $request,
        CreativeWork $creativeWork
    ): JsonResponse {
        if ($request->exists('slug')) {
            $request->merge([
                'slug' => Str::slug($request->input('slug', '')),
            ]);
        }

        $data = $request->validate(
            $this->rules($creativeWork, true)
        );

        $creativeWork->update($data);

        return response()->json([
            'message' => 'Création modifiée.',
            'data' => $creativeWork->fresh(),
        ]);
    }

    public function destroy(CreativeWork $creativeWork): JsonResponse
    {
        $creativeWork->delete();

        return response()->json([
            'message' => 'Création supprimée.',
        ]);
    }

    private function rules(
        ?CreativeWork $work = null,
        bool $partial = false
    ): array {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'title' => [$required, 'string', 'max:255'],
            'slug' => [
                $required,
                'string',
                'max:255',
                Rule::unique('creative_works', 'slug')
                    ->ignore($work?->id),
            ],
            'category' => [$required, 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'media_url' => ['nullable', 'string', 'max:2048'],
            'status' => [
                'sometimes',
                Rule::in(['draft', 'published']),
            ],
            'featured' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
