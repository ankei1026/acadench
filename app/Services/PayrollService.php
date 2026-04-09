<?php

namespace App\Services;

use App\Models\BookingSession;
use App\Models\Payroll;
use Illuminate\Support\Facades\Log;

class PayrollService
{
    /**
     * Tutor share percentage of program price (43%)
     */
    private const TUTOR_SHARE_PERCENTAGE = 43.00;

    /**
     * Generate payroll entries for a completed session.
     * Tutor gets 43% of the program price per session.
     *
     * @param BookingSession $session
     * @param float $substitutionBonus Bonus amount for substitute tutors (default 0)
     * @return array Array of created Payroll records
     */
    public function generateForSession(BookingSession $session, float $substitutionBonus = 0.00): array
    {
        $payrolls = [];
        $booking = $session->booking;

        if (!$booking) {
            Log::warning('Cannot generate payroll: Booking not found', ['session_id' => $session->session_id]);
            return [];
        }

        $program = $booking->program;

        if (!$program) {
            Log::warning('Cannot generate payroll: Program not found', ['session_id' => $session->session_id]);
            return [];
        }

        // Get tutors assigned to this session
        $sessionTutors = $session->tutors;

        if ($sessionTutors->isEmpty()) {
            Log::warning('No tutors assigned to session', ['session_id' => $session->session_id]);
            return [];
        }

        // Get original tutors from booking
        $bookingTutorIds = $booking->tutor_ids ?? [];
        if (is_string($bookingTutorIds)) {
            $bookingTutorIds = json_decode($bookingTutorIds, true) ?? [];
        }

        // Calculate base rate (43% of program price)
        $programPrice = $program->price ?? 0;
        $baseRate = $programPrice * (self::TUTOR_SHARE_PERCENTAGE / 100);

        // Process each tutor assigned to the session
        foreach ($sessionTutors as $tutor) {
            // Check if payroll already exists for this tutor and session
            $existingPayroll = Payroll::where('tutor_id', $tutor->tutor_id)
                ->where('session_id', $session->session_id)
                ->first();

            if ($existingPayroll) {
                Log::info('Payroll already exists for this session/tutor', [
                    'tutor_id' => $tutor->tutor_id,
                    'session_id' => $session->session_id,
                ]);
                $payrolls[] = $existingPayroll;
                continue;
            }

            $isSubstitution = !in_array($tutor->tutor_id, $bookingTutorIds);

            // Find original tutor if this is a substitution
            $originalTutorId = null;
            if ($isSubstitution && !empty($bookingTutorIds)) {
                $originalTutorId = $bookingTutorIds[0] ?? null;
            }

            try {
                $payroll = Payroll::create([
                    'tutor_id' => $tutor->tutor_id,
                    'session_id' => $session->session_id,
                    'booking_id' => $booking->book_id,
                    'prog_id' => $program->prog_id,
                    'session_date' => $session->session_date,
                    'program_price' => $programPrice,
                    'tutor_share_percentage' => self::TUTOR_SHARE_PERCENTAGE,
                    'base_rate' => $baseRate,
                    'substitution_bonus' => $isSubstitution ? $substitutionBonus : 0,
                    'status' => Payroll::STATUS_PENDING,
                    'is_substitution' => $isSubstitution,
                    'original_tutor_id' => $originalTutorId,
                    'attendance_status' => Payroll::ATTENDANCE_PRESENT,
                ]);

                $payrolls[] = $payroll;

                Log::info('Payroll generated for session', [
                    'payroll_id' => $payroll->payroll_id,
                    'tutor_id' => $tutor->tutor_id,
                    'session_id' => $session->session_id,
                    'program_price' => $programPrice,
                    'tutor_percentage' => self::TUTOR_SHARE_PERCENTAGE . '%',
                    'base_rate' => $baseRate,
                    'is_substitution' => $isSubstitution,
                    'total_amount' => $payroll->total_amount,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to create payroll', [
                    'session_id' => $session->session_id,
                    'tutor_id' => $tutor->tutor_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $payrolls;
    }

    /**
     * Generate payroll for all completed sessions that don't have payroll yet.
     */
    public function generateForUnprocessedSessions(): int
    {
        $count = 0;

        $sessions = BookingSession::where('status', BookingSession::STATUS_COMPLETED)
            ->whereDoesntHave('payrolls')
            ->with(['booking.program', 'tutors'])
            ->get();

        foreach ($sessions as $session) {
            $payrolls = $this->generateForSession($session);
            $count += count($payrolls);
        }

        return $count;
    }

    /**
     * Calculate tutor earnings summary
     */
    public function getTutorEarningsSummary(string $tutorId, $startDate = null, $endDate = null): array
    {
        $query = Payroll::where('tutor_id', $tutorId);

        if ($startDate && $endDate) {
            $query->whereBetween('session_date', [$startDate, $endDate]);
        }

        $payrolls = $query->get();

        $totalSessions = $payrolls->count();
        $completedSessions = $payrolls->where('attendance_status', Payroll::ATTENDANCE_PRESENT)->count();
        $substitutionSessions = $payrolls->where('is_substitution', true)->count();

        $pendingAmount = $payrolls->where('status', Payroll::STATUS_PENDING)->sum('total_amount');
        $approvedAmount = $payrolls->where('status', Payroll::STATUS_APPROVED)->sum('total_amount');
        $paidAmount = $payrolls->where('status', Payroll::STATUS_PAID)->sum('total_amount');

        return [
            'total_sessions' => $totalSessions,
            'completed_sessions' => $completedSessions,
            'substitution_sessions' => $substitutionSessions,
            'regular_sessions' => $totalSessions - $substitutionSessions,
            'total_earned' => $payrolls->sum('total_amount'),
            'pending_amount' => $pendingAmount,
            'approved_amount' => $approvedAmount,
            'paid_amount' => $paidAmount,
            'base_rate_total' => $payrolls->sum('base_rate'),
            'substitution_bonus_total' => $payrolls->sum('substitution_bonus'),
            'tutor_share_percentage' => self::TUTOR_SHARE_PERCENTAGE,
        ];
    }
}
