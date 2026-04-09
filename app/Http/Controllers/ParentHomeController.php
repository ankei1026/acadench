<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Booking;
use App\Models\BookingSession;
use Carbon\Carbon;

class ParentHomeController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get all active bookings for parent's learners
        $activeBookings = Booking::with(['program', 'learner'])
            ->where('parent_id', $user->id)
            ->where('booking_status', 'active')
            ->get();

        // Get booking IDs for this parent
        $bookingIds = $activeBookings->pluck('book_id')->toArray();

        // Get actual BookingSession records if they exist
        $sessions = BookingSession::with(['booking.program', 'booking.learner', 'tutors.user'])
            ->whereIn('book_id', $bookingIds)
            ->orderBy('session_date')
            ->get();

        $calendarEvents = [];

        // If sessions exist, use them
        if ($sessions->count() > 0) {
            $sessionsByBooking = $sessions->groupBy('book_id');

            foreach ($sessions as $session) {
                $booking = $session->booking;
                $program = $booking?->program;
                $learner = $booking?->learner;

                // Get tutor names from session
                $tutorNames = $session->tutors->map(function ($tutor) {
                    return $tutor->user->name ?? $tutor->name ?? 'Unknown';
                })->toArray();

                // Calculate session number
                $bookingSessions = $sessionsByBooking->get($session->book_id, collect());
                $sessionNumber = $bookingSessions->search(function ($item) use ($session) {
                    return $item->session_id === $session->session_id;
                }) + 1;

                // Get program times
                $startTime = null;
                $endTime = null;
                if ($program) {
                    if ($program->start_time instanceof Carbon) {
                        $startTime = $program->start_time->format('h:i A');
                    } elseif (is_string($program->start_time)) {
                        $startTime = Carbon::parse($program->start_time)->format('h:i A');
                    }

                    if ($program->end_time instanceof Carbon) {
                        $endTime = $program->end_time->format('h:i A');
                    } elseif (is_string($program->end_time)) {
                        $endTime = Carbon::parse($program->end_time)->format('h:i A');
                    }
                }

                $calendarEvents[] = [
                    'id' => $session->session_id,
                    'title' => $program?->name ?? 'Session',
                    'start' => $session->session_date instanceof Carbon
                        ? $session->session_date->format('Y-m-d')
                        : date('Y-m-d', strtotime($session->session_date)),
                    'allDay' => false,
                    'extendedProps' => [
                        'session_id' => $session->session_id,
                        'booking_id' => $booking->book_id,
                        'session_number' => $sessionNumber,
                        'total_sessions' => $booking->session_count ?? 1,
                        'learner' => $learner?->name ?? $learner?->full_name ?? null,
                        'tutor' => !empty($tutorNames) ? implode(', ', $tutorNames) : 'Not assigned',
                        'tutor_count' => count($tutorNames),
                        'program' => $program?->name ?? null,
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                        'status' => $session->status,
                        'notes' => $session->notes,
                    ],
                ];
            }
        } else {
            // Fallback: Generate events from bookings
            foreach ($activeBookings as $booking) {
                if (!$booking->book_date) continue;

                $startDate = Carbon::parse($booking->book_date);
                $programDays = $this->parseProgramDays($booking->program?->days);

                // Get tutor names from tutor_ids
                $tutorNames = [];
                if ($booking->tutor_ids) {
                    $tutorIds = is_array($booking->tutor_ids) ? $booking->tutor_ids : json_decode($booking->tutor_ids, true);
                    if (is_array($tutorIds)) {
                        $tutorNames = \App\Models\Tutor::whereIn('tutor_id', $tutorIds)
                            ->with('user')
                            ->get()
                            ->map(function ($tutor) {
                                return $tutor->user?->name ?? $tutor->tutor_id;
                            })
                            ->toArray();
                    }
                }

                for ($i = 0; $i < $booking->session_count; $i++) {
                    $sessionDate = $this->calculateSessionDate($startDate, $programDays, $i);
                    if ($sessionDate) {
                        $calendarEvents[] = [
                            'id' => $booking->book_id . '_' . ($i + 1),
                            'title' => $booking->program?->name ?? 'Booking Session',
                            'start' => $sessionDate->format('Y-m-d'),
                            'allDay' => false,
                            'extendedProps' => [
                                'booking_id' => $booking->book_id,
                                'session_number' => $i + 1,
                                'total_sessions' => $booking->session_count,
                                'learner' => $booking->learner?->name ?? null,
                                'tutor' => !empty($tutorNames) ? implode(', ', $tutorNames) : 'Not assigned',
                                'tutor_count' => count($tutorNames),
                                'program' => $booking->program?->name ?? null,
                                'start_time' => $booking->program?->start_time ?
                                    Carbon::parse($booking->program->start_time)->format('h:i A') : null,
                                'end_time' => $booking->program?->end_time ?
                                    Carbon::parse($booking->program->end_time)->format('h:i A') : null,
                                'status' => 'pending',
                                'notes' => null,
                            ],
                        ];
                    }
                }
            }
        }

        // Calculate stats
        $stats = [
            'activeBookings' => $activeBookings->count(),
            'totalLearners' => $activeBookings->pluck('learner_id')->filter()->unique()->count(),
            'activeTutors' => $activeBookings->flatMap(function ($booking) {
                $tutorIds = $booking->tutor_ids;
                if (is_string($tutorIds)) {
                    $tutorIds = json_decode($tutorIds, true) ?? [];
                }
                return is_array($tutorIds) ? $tutorIds : [];
            })->filter()->unique()->count(),
            'totalSessions' => $sessions->count() ?: $activeBookings->sum('session_count'),
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
            $parsed = json_decode($days, true);
            if (is_array($parsed)) return $parsed;

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
            return $startDate->copy()->addDays($sessionIndex);
        }

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

        if ($sessionIndex === 0) {
            while (!in_array($currentDate->dayOfWeek, $targetDays)) {
                $currentDate->addDay();
            }
            return $currentDate;
        }

        while (true) {
            if (in_array($currentDate->dayOfWeek, $targetDays)) {
                if ($foundSessions === $sessionIndex) {
                    return $currentDate;
                }
                $foundSessions++;
            }
            $currentDate->addDay();

            if ($currentDate->diffInYears($startDate) > 5) {
                return null;
            }
        }
    }
}
