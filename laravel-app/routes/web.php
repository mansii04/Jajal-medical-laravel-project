<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CaseController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Laravel Blade UI)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Screen 2: Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Screen 3: Case List & Screen 5: Case Details (Admin & Viewer)
    Route::get('/cases', [CaseController::class, 'index'])->name('cases.index');
    Route::get('/cases/{case}', [CaseController::class, 'show'])->name('cases.show');

    // Screen 4: Create & Edit Case (Admin Only)
    Route::middleware('can:create,App\Models\MedicalCase')->group(function () {
        Route::get('/cases/create', [CaseController::class, 'create'])->name('cases.create');
        Route::post('/cases', [CaseController::class, 'store'])->name('cases.store');
    });

    Route::middleware('can:update,case')->group(function () {
        Route::get('/cases/{case}/edit', [CaseController::class, 'edit'])->name('cases.edit');
        Route::put('/cases/{case}', [CaseController::class, 'update'])->name('cases.update');
    });

    Route::delete('/cases/{case}', [CaseController::class, 'destroy'])
        ->middleware('can:delete,case')
        ->name('cases.destroy');
});
