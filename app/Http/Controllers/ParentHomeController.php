<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Booking;
use Carbon\Carbon;

class ParentHomeController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get all active bookings for parent's learners
        $activeBookings = Booking::with(['program', 'learner', 'tutor.user'])
            ->where('parent_id', $user->id)
            ->where('booking_status', 'active')
            ->get();

        // Generate individual session events for calendar
        $calendarEvents = [];
        foreach ($activeBookings as $booking) {
            if (!$booking->book_date) continue;

            $startDate = Carbon::parse($booking->book_date);
            $programDays = $this->parseProgramDays($booking->program?->days);

            // Generate events for each session
            for ($i = 0; $i < $booking->session_count; $i++) {
                $sessionDate = $this->calculateSessionDate($startDate, $programDays, $i);
                if ($sessionDate) {
                    $calendarEvents[] = [
                        'id' => $booking->book_id . '_' . ($i + 1),
                        'title' => $booking->program?->name ?? 'Booking Session',
                        'start' => $sessionDate->format('Y-m-d'),
                        'allDay' => true,
                        'extendedProps' => [
                            'booking_id' => $booking->book_id,
                            'session_number' => $i + 1,
                            'total_sessions' => $booking->session_count,
                            'learner' => $booking->learner?->name ?? null,
                            'tutor' => $booking->tutor?->user?->name ?? null,
                            'program' => $booking->program?->name ?? null,
                            'start_time' => $booking->program?->start_time ?
                                Carbon::parse($booking->program->start_time)->format('h:i A') : null,
                            'end_time' => $booking->program?->end_time ?
                                Carbon::parse($booking->program->end_time)->format('h:i A') : null,
                        ],
                    ];
                }
            }
        }

        // Calculate stats
        $stats = [
            'activeBookings' => $activeBookings->count(),
            'totalLearners' => $activeBookings->pluck('learner_id')->unique()->count(),
            'activeTutors' => $activeBookings->pluck('tutor_id')->filter()->unique()->count(),
            'totalSessions' => $activeBookings->sum('session_count'),
            'totalAmount' => $activeBookings->sum('amount') ?? 0,
        ];

        return Inertia::render('Parent/Home', [
            'calendarEvents' => $calendarEvents,
            'stats' => $stats,
        ]);
    }

    /**
     * Parse program days from JSON or comma-separated string
     */
    private function parseProgramDays($days)
    {
        if (!$days) return [];

        if (is_array($days)) return $days;

        if (is_string($days)) {
            // Try to parse JSON
            $parsed = json_decode($days, true);
            if (is_array($parsed)) return $parsed;

            // Try comma-separated
            return array_map('trim', explode(',', $days));
        }

        return [];
    }

    /**
     * Calculate session date based on program days
     */
    private function calculateSessionDate(Carbon $startDate, array $programDays, int $sessionIndex): ?Carbon
    {
        if (empty($programDays)) {
            // If no days specified, assume consecutive days
            return $startDate->copy()->addDays($sessionIndex);
        }

        // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
        $dayMap = [
            'sunday' => 0, 'sun' => 0,
            'monday' => 1, 'mon' => 1,
            'tuesday' => 2, 'tue' => 2,
            'wednesday' => 3, 'wed' => 3,
            'thursday' => 4, 'thu' => 4,
            'friday' => 5, 'fri' => 5,
            'saturday' => 6, 'sat' => 6,
        ];

        $targetDays = [];
        foreach ($programDays as $day) {
            $dayLower = strtolower(trim($day));
            if (isset($dayMap[$dayLower])) {
                $targetDays[] = $dayMap[$dayLower];
            }
        }

        if (empty($targetDays)) return $startDate->copy()->addDays($sessionIndex);

        sort($targetDays);

        $currentDate = $startDate->copy();
        $foundSessions = 0;

        while ($foundSessions <= $sessionIndex) {
            $currentDayOfWeek = $currentDate->dayOfWeek;

            if (in_array($currentDayOfWeek, $targetDays)) {
                if ($foundSessions === $sessionIndex) {
                    return $currentDate;
                }
                $foundSessions++;
            }

            $currentDate->addDay();
        }

        return null;
    }
}
