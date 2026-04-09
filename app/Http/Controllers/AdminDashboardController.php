<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Booking;
use App\Models\Tutor;
use App\Models\BookingSession;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Get all active bookings with relationships
        $activeBookings = Booking::with(['program', 'learner'])
            ->where('booking_status', 'active')
            ->get();

        // Pre-load all tutors that might be needed
        $allTutorIds = $activeBookings->flatMap(function ($booking) {
            $tutorIds = $booking->tutor_ids;
            if (is_string($tutorIds)) {
                $tutorIds = json_decode($tutorIds, true) ?? [];
            }
            return is_array($tutorIds) ? $tutorIds : [];
        })->filter()->unique()->values();

        $allTutors = Tutor::with('user')
            ->whereIn('tutor_id', $allTutorIds)
            ->get()
            ->keyBy('tutor_id');

        // Manually attach tutors to each booking
        foreach ($activeBookings as $booking) {
            $tutorIds = $booking->tutor_ids;
            if (is_string($tutorIds)) {
                $tutorIds = json_decode($tutorIds, true) ?? [];
            }

            $bookingTutors = collect();
            if (is_array($tutorIds)) {
                foreach ($tutorIds as $tutorId) {
                    if (isset($allTutors[$tutorId])) {
                        $bookingTutors->push($allTutors[$tutorId]);
                    }
                }
            }
            $booking->setRelation('tutors', $bookingTutors);
        }

        // Get all sessions for active bookings
        $sessions = BookingSession::with(['booking.program', 'booking.learner'])
            ->whereHas('booking', function ($q) {
                $q->where('booking_status', 'active');
            })
            ->orderBy('session_date')
            ->get();

        // Build calendar events with all required data
        $calendarEvents = [];

        // Group sessions by booking for session numbering
        $sessionsByBooking = $sessions->groupBy('book_id');

        foreach ($sessions as $session) {
            $booking = $session->booking;
            $program = $booking?->program;
            $learner = $booking?->learner;

            // First try to get tutors from session pivot, if empty fall back to booking tutors
            $sessionTutors = $session->tutors;

            // If no tutors assigned to session, use the booking's tutors
            if ($sessionTutors->isEmpty() && $booking && $booking->relationLoaded('tutors')) {
                $sessionTutors = $booking->tutors;
            }

            $tutorNames = [];
            $tutorDetails = [];

            foreach ($sessionTutors as $tutor) {
                $tutorName = $tutor->user->name ?? $tutor->name ?? 'Unknown';
                $tutorNames[] = $tutorName;
                $tutorDetails[] = [
                    'id' => $tutor->tutor_id,
                    'name' => $tutorName,
                    'email' => $tutor->user->email ?? $tutor->email ?? null,
                ];
            }

            // Get booking tutor IDs for capacity reference
            $bookingTutorIds = $booking->tutor_ids ?? [];
            if (is_string($bookingTutorIds)) {
                $bookingTutorIds = json_decode($bookingTutorIds, true) ?? [];
            }

            // Format tutor display string
            $tutorDisplay = !empty($tutorNames)
                ? implode(', ', $tutorNames)
                : 'Not assigned';

            // Calculate session number (1-based index within the booking)
            $bookingSessions = $sessionsByBooking->get($session->book_id, collect());
            $sessionNumber = $bookingSessions->search(function ($item) use ($session) {
                return $item->session_id === $session->session_id;
            }) + 1;

            // Get program times safely
            $startTime = null;
            $endTime = null;

            if ($program) {
                if ($program->start_time instanceof Carbon) {
                    $startTime = $program->start_time->format('H:i');
                } elseif (is_string($program->start_time)) {
                    $startTime = $program->start_time;
                }

                if ($program->end_time instanceof Carbon) {
                    $endTime = $program->end_time->format('H:i');
                } elseif (is_string($program->end_time)) {
                    $endTime = $program->end_time;
                }
            }

            $calendarEvents[] = [
                'id' => $session->session_id,
                'title' => $program?->name ?? 'Session',
                'start' => $session->session_date instanceof Carbon
                    ? $session->session_date->format('Y-m-d')
                    : date('Y-m-d', strtotime($session->session_date)),
                'allDay' => false,
                'backgroundColor' => $this->getEventColor(count($tutorNames)),
                'borderColor' => $this->getEventColor(count($tutorNames)),
                'extendedProps' => [
                    'session_id' => $session->session_id,
                    'booking_id' => $booking?->book_id,
                    'learner' => $learner?->name ?? $learner?->full_name ?? 'Not assigned',
                    'tutor' => $tutorDisplay,
                    'tutors' => $tutorDetails,
                    'tutor_count' => count($tutorNames),
                    'booking_tutor_ids' => is_array($bookingTutorIds) ? $bookingTutorIds : [],
                    'booking_tutor_count' => is_array($bookingTutorIds) ? count($bookingTutorIds) : 0,
                    'tutor_capacity' => $program?->tutor_capacity ?? null,
                    'program' => $program?->name ?? 'No program',
                    'program_type' => $program?->prog_type ?? null,
                    'status' => $session->status,
                    'notes' => $session->notes,
                    'session_number' => $sessionNumber,
                    'total_sessions' => $booking?->session_count ?? 1,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'booking_status' => $booking?->booking_status,
                ],
            ];
        }

        // Calculate stats with safety checks
        $uniqueLearners = $activeBookings->pluck('learner_id')->filter()->unique();

        // Count unique tutors from the booking tutor_ids JSON field
        $activeTutors = $activeBookings->flatMap(function ($booking) {
            $tutorIds = $booking->tutor_ids;
            if (is_string($tutorIds)) {
                $tutorIds = json_decode($tutorIds, true) ?? [];
            }
            return is_array($tutorIds) ? $tutorIds : [];
        })->filter()->unique();

        $stats = [
            'totalBookings' => $activeBookings->count(),
            'activeLearners' => $uniqueLearners->count(),
            'activeTutors' => $activeTutors->count(),
            'totalSessions' => $sessions->count(),
            'revenue' => $activeBookings->sum('amount') ?? 0,
            'completedSessions' => $sessions->where('status', BookingSession::STATUS_COMPLETED)->count(),
            'upcomingSessions' => $sessions->filter(function ($session) {
                $sessionDate = $session->session_date instanceof Carbon
                    ? $session->session_date
                    : Carbon::parse($session->session_date);
                return $sessionDate->startOfDay()->gte(now()->startOfDay());
            })->count(),
        ];

        // Get ALL active tutors for substitution dropdown
        $availableTutors = Tutor::with('user')
            ->where('status', 'active')
            ->get()
            ->map(function ($tutor) {
                return [
                    'tutor_id' => $tutor->tutor_id,
                    'name' => $tutor->user->name ?? $tutor->name ?? 'Unknown',
                    'email' => $tutor->user->email ?? $tutor->email ?? null,
                ];
            })
            ->values()
            ->toArray();

        return Inertia::render('Admin/Dashboard', [
            'calendarEvents' => $calendarEvents,
            'stats' => $stats,
            'availableTutors' => $availableTutors,
        ]);
    }

    /**
     * Get event color based on tutor count
     */
    private function getEventColor($tutorCount)
    {
        if ($tutorCount > 2) {
            return '#f59e0b'; // Amber for multiple tutors
        } elseif ($tutorCount === 2) {
            return '#f97316'; // Orange for two tutors
        }
        return '#ef4444'; // Red for single tutor
    }
}
