<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'profile' => Profile::first(),
            'settings' => SiteSetting::first(),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'headline' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'short_bio' => ['nullable', 'string', 'max:2000'],
            'about' => ['nullable', 'string', 'max:20000'],
            'portrait_url' => ['nullable', 'string', 'max:2048'],
            'cv_url' => ['nullable', 'string', 'max:2048'],
            'available_for_work' => ['required', 'boolean'],
        ]);

        $profile = Profile::firstOrCreate(
            ['id' => 1],
            [
                'full_name' => $data['full_name'],
                'headline' => $data['headline'],
            ]
        );

        $profile->update($data);

        return response()->json([
            'message' => 'Profil mis à jour.',
            'data' => $profile->fresh(),
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'site_title' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'github_url' => ['nullable', 'url:http,https', 'max:2048'],
            'linkedin_url' => ['nullable', 'url:http,https', 'max:2048'],
            'instagram_url' => ['nullable', 'url:http,https', 'max:2048'],
            'seo_description' => ['nullable', 'string', 'max:1000'],
        ]);

        $settings = SiteSetting::firstOrCreate(
            ['id' => 1],
            ['site_title' => $data['site_title']]
        );

        $settings->update($data);

        return response()->json([
            'message' => 'Paramètres mis à jour.',
            'data' => $settings->fresh(),
        ]);
    }
}
