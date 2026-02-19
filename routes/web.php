<?php

use App\Http\Controllers\AdminBookingController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminLearnersController;
use App\Http\Controllers\AdminLecturesController;
use App\Http\Controllers\AdminParentController;
use App\Http\Controllers\AdminProgramsController;
use App\Http\Controllers\AdminRefundRequestController;
use App\Http\Controllers\AdminRevenueController;
use App\Http\Controllers\AdminTutorApplicationController;
use App\Http\Controllers\AdminTutorController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ParentBookProgramController;
use App\Http\Controllers\ParentHomeController;
use App\Http\Controllers\ParentLearnerController;
use App\Http\Controllers\ParentLecturesController;
use App\Http\Controllers\ParentTutorController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RefundRequestController;
use App\Http\Controllers\SignupController;
use App\Http\Controllers\TutorApplicationController;
use App\Http\Controllers\TutorController;
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

// Parent routes
Route::middleware(['auth', 'role:parent'])->prefix('parent')->group(function () {
    Route::get('/home', [ParentHomeController::class, 'index'])->name('parent.home');

    // Learners
    Route::get('/learners', [ParentLearnerController::class, 'index'])->name('learners.index');
    Route::get('/learner/create', [ParentLearnerController::class, 'create'])->name('learners.create');
    Route::post('/learners', [ParentLearnerController::class, 'store'])->name('learners.store');
    Route::get('/learner/{learner}', [ParentLearnerController::class, 'show'])->name('learners.show');
    Route::get('/learner/{learner}/edit', [ParentLearnerController::class, 'edit'])->name('learners.edit');
    Route::put('/learner/{learner}', [ParentLearnerController::class, 'update'])->name('learners.update');
    Route::delete('/learner/{learner}', [ParentLearnerController::class, 'destroy'])->name('learners.destroy');

    Route::get('/book-program', [ParentBookProgramController::class, 'index'])->name('parent.book-program');
    Route::get('/book-program/pricing', [ParentBookProgramController::class, 'getPricing'])->name('parent.book-program.pricing');
    Route::post('/book-program', [ParentBookProgramController::class, 'store'])->name('parent.book-program.store');
    Route::get('/book-program/{program}/booking', [ParentBookProgramController::class, 'booking'])->name('parent.book-program.booking');
    Route::get('/book-program/bookings', [ParentBookProgramController::class, 'bookings'])->name('parent.book-program.bookings');
    Route::patch('/book-program/{booking}/cancel', [ParentBookProgramController::class, 'cancel'])->name('parent.book-program.cancel');
    Route::post('/book-program/{booking}/receipt', [ParentBookProgramController::class, 'storeReceipt'])->name('parent.book-program.receipt');

    // Refund requests
    Route::get('/request-refund', [RefundRequestController::class, 'index'])->name('parent.request-refund');
    Route::post('/request-refund', [RefundRequestController::class, 'store'])->name('parent.request-refund.store');
    Route::get('/my-refund-requests', [RefundRequestController::class, 'myRequests'])->name('parent.my-refund-requests');

    // Lectures
    Route::get('/lectures', [ParentLecturesController::class, 'index'])->name('parent.lectures');

    // Tutors
    Route::get('/tutors', [ParentTutorController::class, 'index'])->name('parent.tutors.index');
    Route::get('/tutors/{tutor_id}', [ParentTutorController::class, 'show'])->name('parent.tutors.show');
});

// Admin routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // Programs
    Route::get('/programs', [AdminProgramsController::class, 'index'])->name('admin.programs.index');
    Route::get('/programs/create', [AdminProgramsController::class, 'create'])->name('admin.programs.create');
    Route::post('/programs', [AdminProgramsController::class, 'store'])->name('admin.programs.store');
    Route::get('/programs/{program}', [AdminProgramsController::class, 'show'])->name('admin.programs.show');
    Route::get('/programs/{program}/edit', [AdminProgramsController::class, 'edit'])->name('admin.programs.edit');
    Route::put('/programs/{program}', [AdminProgramsController::class, 'update'])->name('admin.programs.update');
    Route::delete('/programs/{program}', [AdminProgramsController::class, 'destroy'])->name('admin.programs.destroy');

    // Bookings
    Route::get('/bookings', [AdminBookingController::class, 'index'])->name('admin.bookings');
    Route::patch('/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus'])->name('admin.bookings.update-status');
    Route::patch('/bookings/{booking}/assign-tutor', [AdminBookingController::class, 'assignTutor'])->name('admin.bookings.assign-tutor');

    // Refund Requests
    Route::get('/refund-requests', [AdminRefundRequestController::class, 'index'])->name('admin.refund-requests.index');
    Route::get('/refund-requests/{refundRequest}', [AdminRefundRequestController::class, 'show'])->name('admin.refund-requests.show');
    Route::patch('/refund-requests/{refundRequest}/approve', [AdminRefundRequestController::class, 'approve'])->name('admin.refund-requests.approve');
    Route::patch('/refund-requests/{refundRequest}/reject', [AdminRefundRequestController::class, 'reject'])->name('admin.refund-requests.reject');

    // Revenue
    Route::get('/revenue', [AdminRevenueController::class, 'index'])->name('admin.revenue');
    Route::get('/payment-setup', [AdminRevenueController::class, 'paymentSetup'])->name('admin.payment-setup');
    Route::post('/revenue/payment-types', [AdminRevenueController::class, 'store'])->name('admin.revenue.payment-types.store');
    Route::put('/revenue/payment-types/{paymentType}', [AdminRevenueController::class, 'update'])->name('admin.revenue.payment-types.update');
    Route::delete('/revenue/payment-types/{paymentType}', [AdminRevenueController::class, 'destroy'])->name('admin.revenue.payment-types.destroy');

    // Parents
    Route::get('/parents', [AdminParentController::class, 'index'])->name('admin.parents');

    // Learners
    Route::get('/learners', [AdminLearnersController::class, 'index'])->name('admin.learners');

    // Lectures
    Route::get('/lectures', [AdminLecturesController::class, 'index'])->name('admin.lectures');
    Route::post('/lectures', [AdminLecturesController::class, 'store'])->name('admin.lectures.store');
    Route::put('/lectures/{lecture}', [AdminLecturesController::class, 'update'])->name('admin.lectures.update');
    Route::delete('/lectures/{lecture}', [AdminLecturesController::class, 'destroy'])->name('admin.lectures.destroy');

    // Tutors
    Route::get('/tutors', [AdminTutorController::class, 'index'])->name('admin.tutors');
    Route::get('/tutors/create', [AdminTutorController::class, 'create'])->name('admin.tutors.create');
    Route::post('/tutors', [AdminTutorController::class, 'store'])->name('admin.tutors.store');
    Route::get('/tutors/{tutor_id}', [AdminTutorController::class, 'show'])->name('admin.tutors.show');
    Route::get('/tutors/{tutor_id}/edit', [AdminTutorController::class, 'edit'])->name('admin.tutors.edit');
    Route::put('/tutors/{tutor_id}', [AdminTutorController::class, 'update'])->name('admin.tutors.update');
    Route::patch('/tutors/{tutor_id}/update-status', [AdminTutorController::class, 'updateStatus'])->name('admin.tutors.status');
    Route::delete('/tutors/{tutor_id}', [AdminTutorController::class, 'destroy'])->name('admin.tutors.destroy');

    // Tutor Applications
    Route::get('/tutor-applications', [AdminTutorApplicationController::class, 'index'])->name('admin.tutor-applications.index');
    Route::get('/tutor-applications/{id}', [AdminTutorApplicationController::class, 'show'])->name('admin.applications.show');
    Route::patch('/tutor-applications/{id}/approve', [AdminTutorApplicationController::class, 'approve'])->name('admin.applications.approve');
    Route::patch('/tutor-applications/{id}/reject', [AdminTutorApplicationController::class, 'reject'])->name('admin.applications.reject');
    Route::get('/tutor-applications/{id}/download', [AdminTutorApplicationController::class, 'downloadDocument'])->name('admin.applications.download');

    // Admin reset password for specific user (already under admin middleware)
    Route::patch('/users/{user}/reset-password', [PasswordResetController::class, 'resetByAdmin'])
        ->name('admin.users.reset-password');

    // Generate secure password
    Route::get('/generate-password', [PasswordResetController::class, 'generate'])
        ->name('admin.generate-password');
});

// Self password update (for any authenticated user)
Route::patch('/password/update', [PasswordResetController::class, 'updateSelf'])
    ->name('password.update')
    ->middleware('auth');

// Notification routes (for any authenticated user)
Route::middleware('auth')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

// Tutor routes
Route::middleware(['auth', 'role:tutor'])->prefix('tutor')->group(function () {
    Route::get('/dashboard', [TutorController::class, 'index'])->name('tutor.dashboard');
    Route::get('/bookings', [TutorController::class, 'bookings'])->name('tutor.bookings');
    Route::get('/lectures', [TutorController::class, 'lectures'])->name('tutor.lectures');
    Route::patch('/lectures/{lecture}', [TutorController::class, 'updateLecture'])->name('tutor.lectures.update');
    Route::get('/profile', [TutorController::class, 'profile'])->name('tutor.profile');
    Route::put('/profile', [TutorController::class, 'updateProfile'])->name('tutor.profile.update');
});
