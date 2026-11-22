<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Image invalide.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('image');

        $path = $file->store('projects', 'public');

        $url = url(Storage::disk('public')->url($path));

        return response()->json([
            'message' => 'Image téléchargée avec succès.',
            'image' => [
                'path' => $path,
                'url' => $url,
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
            ],
        ], 201);
    }
}
