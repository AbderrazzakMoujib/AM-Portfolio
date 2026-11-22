<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Skill::orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $skill = Skill::create(
            $request->validate($this->rules())
        );

        return response()->json([
            'message' => 'Compétence ajoutée.',
            'data' => $skill,
        ], 201);
    }

    public function show(Skill $skill): JsonResponse
    {
        return response()->json(['data' => $skill]);
    }

    public function update(
        Request $request,
        Skill $skill
    ): JsonResponse {
        $skill->update(
            $request->validate($this->rules(true))
        );

        return response()->json([
            'message' => 'Compétence modifiée.',
            'data' => $skill->fresh(),
        ]);
    }

    public function destroy(Skill $skill): JsonResponse
    {
        $skill->delete();

        return response()->json([
            'message' => 'Compétence supprimée.',
        ]);
    }

    private function rules(bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return [
            'name' => [$required, 'string', 'max:100'],
            'category' => [$required, 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_visible' => ['sometimes', 'boolean'],
        ];
    }
}
