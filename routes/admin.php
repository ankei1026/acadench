use App\Http\Controllers\AdminSessionController;

Route::middleware(['web', 'auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/sessions', [AdminSessionController::class, 'index'])->name('admin.sessions.index');
    Route::patch('/sessions/{session}', [AdminSessionController::class, 'updateStatus'])->name('admin.sessions.update-status');
});
