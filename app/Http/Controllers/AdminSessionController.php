<?php

namespace App\Http\Controllers;

use App\Models\BookingSession;
use App\Models\Tutor;
use App\Services\PayrollService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminSessionController extends Controller
{

    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }
    public function substituteTutor(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|string|exists:booking_sessions,session_id',
            'tutor_ids' => 'required|array|min:1',
            'tutor_ids.*' => 'required|string|exists:tutors,tutor_id',
        ]);

        $session = BookingSession::with('booking.program')->findOrFail($request->session_id);
        $program = $session->booking->program;

        // Check if the number of tutors exceeds capacity
        $tutorCapacity = $program->tutor_capacity ?? 1;
        $selectedTutorCount = count($request->tutor_ids);

        if ($selectedTutorCount > $tutorCapacity) {
            return back()->withErrors([
                'tutor_ids' => "Cannot assign more than {$tutorCapacity} tutor(s) for this program."
            ]);
        }

        // Replace all tutors with the new selection
        $session->tutors()->sync($request->tutor_ids);

        // Log the substitution
        Log::info('Tutors substituted for session', [
            'session_id' => $session->session_id,
            'new_tutor_ids' => $request->tutor_ids,
            'tutor_count' => $selectedTutorCount,
            'capacity' => $tutorCapacity,
            'substituted_by' => auth()->id(),
        ]);

        return back()->with('success', "{$selectedTutorCount} tutor(s) assigned successfully");
    }

    public function updateStatus(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string|exists:booking_sessions,session_id',
            'status' => 'required|in:pending,ongoing,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $session = BookingSession::findOrFail($request->session_id);
        $oldStatus = $session->status;
        $session->status = $request->status;

        if ($request->has('notes')) {
            $session->notes = $request->notes;
        }

        $session->save();

        // Generate payroll when session is marked as completed
        if ($request->status === BookingSession::STATUS_COMPLETED && $oldStatus !== BookingSession::STATUS_COMPLETED) {
            try {
                $payrolls = $this->payrollService->generateForSession($session);
                Log::info('Payroll generated for completed session', [
                    'session_id' => $session->session_id,
                    'payroll_count' => count($payrolls),
                    'updated_by' => auth()->id(),
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to generate payroll for session', [
                    'session_id' => $session->session_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Session status updated', [
            'session_id' => $session->session_id,
            'old_status' => $oldStatus,
            'new_status' => $request->status,
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Session status updated successfully');
    }
}
