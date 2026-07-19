<?php

use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ScopeItemController;
use App\Http\Controllers\Api\ScopeSectionController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'index']);

Route::get('/share/{shareLink}', [ProjectController::class, 'showByShareLink']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [UserController::class, 'register']);
    Route::post('/login', [UserController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [UserController::class, 'me']);
        Route::post('/profile', [UserController::class, 'update']);
        Route::post('/logout', [UserController::class, 'logout']);
    });

    Route::middleware('client')->group(function () {
        Route::post('/share/{shareLink}/approve', [ApprovalController::class, 'approve']);
        Route::post('/share/{shareLink}/reject', [ApprovalController::class, 'reject']);
    });

    Route::middleware('freelancer')->group(function () {
        Route::apiResource('clients', ClientController::class);
        Route::post('projects/{project}/send', [ProjectController::class, 'send']);
        Route::get('projects/{project}/approval', [ApprovalController::class, 'show']);
        Route::apiResource('projects', ProjectController::class);
        Route::apiResource('projects.sections', ScopeSectionController::class);
        Route::apiResource('projects.sections.items', ScopeItemController::class);
    });
});
