<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ProjectController;

use App\Http\Controllers\Api\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\ContentController;
use App\Http\Controllers\Api\Admin\SkillController;
use App\Http\Controllers\Api\Admin\CreativeWorkController;
use App\Http\Controllers\Api\Admin\MessageController;

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/

Route::prefix('public')->group(function () {

    // Homepage
    Route::get('/home', [HomeController::class, 'index']);

    // Public projects
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/featured', [ProjectController::class, 'featured']);
    Route::get('/projects/{slug}', [ProjectController::class, 'show']);

    // Contact
    Route::post('/contact', [ContactController::class, 'store'])
        ->middleware('throttle:5,1');
});

/*
|--------------------------------------------------------------------------
| Authenticated User
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Admin API
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {

        Route::get('/dashboard', function () {
            return response()->json([
                'message' => 'Bienvenue dans AM Portfolio Admin',
                'status' => 'success',
            ]);
        });

        // Projects
        Route::apiResource('projects', AdminProjectController::class);

        // Media upload
        Route::post('/media/upload', [MediaController::class, 'store'])
            ->middleware('throttle:30,1');

        // Profile & Settings
        Route::get('/content', [ContentController::class, 'show']);
        Route::put('/profile', [ContentController::class, 'updateProfile']);
        Route::put('/settings', [ContentController::class, 'updateSettings']);

        // Skills CRUD
        Route::apiResource('skills', SkillController::class);

        // Creative Works CRUD
        Route::apiResource('creative-works', CreativeWorkController::class);

        // Messages
        Route::get('/messages', [MessageController::class, 'index']);
        Route::get('/messages/{message}', [MessageController::class, 'show']);
        Route::patch('/messages/{message}', [MessageController::class, 'update']);
        Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
    });
