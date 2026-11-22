<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::query()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->latest()
            ->get();

        return response()->json([
            'data' => $projects,
        ]);
    }

    public function featured(): JsonResponse
    {
        $projects = Project::query()
            ->where('status', 'published')
            ->where('featured', true)
            ->orderBy('sort_order')
            ->latest()
            ->take(6)
            ->get();

        return response()->json([
            'data' => $projects,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json([
            'data' => $project,
        ]);
    }
}
