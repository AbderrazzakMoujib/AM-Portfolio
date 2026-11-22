<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            ContactMessage::latest()->paginate(15)
        );
    }

    public function show(ContactMessage $message): JsonResponse
    {
        return response()->json([
            'data' => $message,
        ]);
    }

    public function update(
        Request $request,
        ContactMessage $message
    ): JsonResponse {
        $data = $request->validate([
            'is_read' => ['required', 'boolean'],
        ]);

        $message->update($data);

        return response()->json([
            'message' => 'Message mis à jour.',
            'data' => $message->fresh(),
        ]);
    }

    public function destroy(ContactMessage $message): JsonResponse
    {
        $message->delete();

        return response()->json([
            'message' => 'Message supprimé.',
        ]);
    }
}
