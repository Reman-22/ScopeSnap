<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\ChangeRequestController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ProjectApprovalController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ScopeItemController;
use App\Http\Controllers\Api\ScopeSectionController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'index']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [UserController::class, 'register']);
    Route::post('/login', [UserController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/share/{shareLink}', [ProjectController::class, 'showByShareLink']);

    Route::prefix('auth')->group(function () {
        Route::get('/me', [UserController::class, 'me']);
        Route::post('/profile', [UserController::class, 'update']);
        Route::post('/logout', [UserController::class, 'logout']);
    });

    Route::middleware('client')->group(function () {
        Route::post('/share/{shareLink}/approve', [ProjectApprovalController::class, 'approve']);
        Route::post('/share/{shareLink}/reject', [ProjectApprovalController::class, 'reject']);
        Route::get('/change-requests', [ChangeRequestController::class, 'indexForClient']);
        Route::post('/projects/{project}/change-requests', [ChangeRequestController::class, 'store']);
    });

    Route::get('/change-requests/{changeRequest}', [ChangeRequestController::class, 'show']);
    Route::delete('/change-requests/{changeRequest}', [ChangeRequestController::class, 'destroy']);
    Route::get('/projects/{project}/activity-logs', [ActivityLogController::class, 'index']);

    Route::middleware('freelancer')->group(function () {
        Route::apiResource('clients', ClientController::class);
        Route::post('projects/{project}/send', [ProjectController::class, 'send']);
        Route::get('projects/{project}/project-approval', [ProjectApprovalController::class, 'show']);
        Route::get('projects/{project}/change-requests', [ChangeRequestController::class, 'indexForProject']);
        Route::patch('change-requests/{changeRequest}/status', [ChangeRequestController::class, 'updateStatus']);
        Route::apiResource('projects', ProjectController::class);
        Route::apiResource('projects.sections', ScopeSectionController::class);
        Route::apiResource('projects.sections.items', ScopeItemController::class);
    });
});
