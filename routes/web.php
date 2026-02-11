<?php

use App\Http\Controllers\AdminProgramsController;
use App\Http\Controllers\AdminTutorApplicationController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\SignupController;
use App\Http\Controllers\TutorApplicationController;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/soraya-learning-hub', function () {
    return Inertia::render('SorayaLearningHub');
});

Route::get('/prices', function () {
    return Inertia::render('Prices');
});

Route::get('/developers', function () {
    return Inertia::render('Developers');
});

Route::get('/tutor-application', [TutorApplicationController::class, 'index'])->name('tutor.application');
Route::post('/tutor-application', [TutorApplicationController::class, 'store'])->name('tutor.application.store');

Route::get('/signup', [SignupController::class, 'index'])->name('signup');
Route::post('/signup-store', [SignupController::class, 'store'])->name('signup.store');

Route::get('/login', [LoginController::class, 'index'])->name('login');
Route::post('/login-store', [LoginController::class, 'store'])->name('login.store');
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

Route::middleware(['auth', 'role:parent'])->prefix('parent')->group(function () {
    Route::get(
        '/home',
        function () {
            return Inertia::render('Parent/Home');
        }
    );
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get(
        '/dashboard',
        function () {
            return Inertia::render('Admin/Dashboard');
        }
    );

    Route::get('/programs', [AdminProgramsController::class, 'index'])->name('admin.programs.index');
    Route::get('/programs/create', [AdminProgramsController::class, 'create'])->name('admin.programs.create');
    Route::post('/programs', [AdminProgramsController::class, 'store'])->name('admin.programs.store');
    Route::get('/programs/{program}', [AdminProgramsController::class, 'show'])->name('admin.programs.show');
    Route::get('/programs/{program}/edit', [AdminProgramsController::class, 'edit'])->name('admin.programs.edit');
    Route::put('/programs/{program}', [AdminProgramsController::class, 'update'])->name('admin.programs.update');
    Route::delete('/programs/{program}', [AdminProgramsController::class, 'destroy'])->name('admin.programs.destroy');

    Route::get('/tutor-applications', [AdminTutorApplicationController::class, 'index'])->name('admin.tutor-applications.index');
});
