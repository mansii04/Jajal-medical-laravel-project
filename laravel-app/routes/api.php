<?php

use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\CaseApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Implements all 7 required REST endpoints with Sanctum token authentication.
*/

// 1. POST /api/login (Public)
Route::post('/login', [AuthApiController::class, 'login']);

// Protected endpoints
Route::middleware('auth:sanctum')->group(function () {
    // 2. POST /api/logout (Authenticated)
    Route::post('/logout', [AuthApiController::class, 'logout']);
    
    // 3. GET /api/cases
    // 4. POST /api/cases
    // 5. GET /api/cases/{id}
    // 6. PUT /api/cases/{id}
    // 7. DELETE /api/cases/{id}
    Route::apiResource('cases', CaseApiController::class);
});
