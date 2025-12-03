<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\SwapController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SpecialtyController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::post('/me/avatar', [AuthController::class, 'uploadProfilePicture']);
    Route::apiResource('skills', SkillController::class);
    Route::get('swaps', [SwapController::class, 'index']);
    Route::post('swaps', [SwapController::class, 'store']);
    Route::post('swaps/{swap}/accept', [SwapController::class, 'accept']);
    Route::post('swaps/{swap}/reject', [SwapController::class, 'reject']);

    Route::apiResource('courses', CourseController::class)->only(['index', 'store', 'show']);
    Route::post('courses/{course}/enroll', [CourseController::class, 'enroll']);

    Route::get('messages', [ChatController::class, 'index']);
    Route::post('messages', [ChatController::class, 'send']);
    Route::delete('messages/{message}', [ChatController::class, 'destroy']);

    Route::get('meetings', [MeetingController::class, 'index']);
    Route::post('meetings', [MeetingController::class, 'store']);
    Route::post('calls', [CallController::class, 'store']);
    Route::get('calls/{call}', [CallController::class, 'show']);
    Route::post('calls/{call}/accept', [CallController::class, 'accept']);
    Route::post('calls/{call}/decline', [CallController::class, 'decline']);
    Route::post('calls/{call}/end', [CallController::class, 'end']);
    Route::apiResource('posts', PostController::class)->only(['index', 'store', 'show', 'destroy']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::get('search', [SearchController::class, 'search']);
});

// Public list of specialties to allow registration
Route::get('specialties', [SpecialtyController::class, 'index']);
