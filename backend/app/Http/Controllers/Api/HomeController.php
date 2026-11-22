<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Skill;
use App\Models\CreativeWork;
use App\Models\SiteSetting;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'profile' => Profile::first(),

            'settings' => SiteSetting::first(),

            'skills' => Skill::query()
                ->where('is_visible', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),

            'featured_projects' => Project::query()
                ->where('status', 'published')
                ->where('featured', true)
                ->orderBy('sort_order')
                ->latest()
                ->limit(6)
                ->get(),

            'creative_works' => CreativeWork::query()
                ->where('status', 'published')
                ->where('featured', true)
                ->orderBy('sort_order')
                ->latest()
                ->limit(8)
                ->get(),
        ]);
    }
}
