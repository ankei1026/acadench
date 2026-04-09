<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingSession;
use App\Models\Lecture;
use App\Models\Tutor;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TutorController extends Controller
{

    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }
    public function index()
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return Inertia::render('Tutor/Dashboard', [
                'calendarEvents' => [],
                'stats' => [
                    'activeBookings' => 0,
                    'totalLectures' => 0,
                    'totalStudents' => 0,
                    'totalSessions' => 0,
                ],
                'tutor_id' => '',
            ]);
        }

        // Get bookings where tutor is in tutor_ids JSON (overall booking assignment)
        $bookingsFromJson = Booking::with(['program', 'learner'])
            ->where('booking_status', 'active')
            ->whereJsonContains('tutor_ids', $tutor->tutor_id)
            ->get();

        // Get session IDs where tutor is specifically assigned (substituted)
        $substitutedSessionIds = DB::table('booking_session_tutor')
            ->where('tutor_id', $tutor->tutor_id)
            ->pluck('session_id')
            ->toArray();

        // Get sessions from substituted assignments
        $substitutedSessions = BookingSession::with(['booking.program', 'booking.learner', 'tutors'])
            ->whereIn('session_id', $substitutedSessionIds)
            ->whereHas('booking', function ($query) {
                $query->where('booking_status', 'active');
            })
            ->get();

        // Get ALL sessions from bookings where tutor is in tutor_ids
        // BUT exclude sessions that have specific tutor assignments (to avoid duplicates)
        $bookingIdsFromJson = $bookingsFromJson->pluck('book_id')->toArray();

        $regularSessions = BookingSession::with(['booking.program', 'booking.learner', 'tutors'])
            ->whereIn('book_id', $bookingIdsFromJson)
            ->whereNotIn('session_id', $substitutedSessionIds) // Don't include sessions that already have specific assignments
            ->whereHas('booking', function ($query) {
                $query->where('booking_status', 'active');
            })
            ->orderBy('session_date')
            ->get();

        // Merge both collections
        $allSessions = $regularSessions->merge($substitutedSessions)->sortBy('session_date');

        // For stats, get all unique bookings
        $allBookingIds = array_merge($bookingIdsFromJson, $substitutedSessions->pluck('book_id')->unique()->toArray());
        $allBookings = Booking::with(['program', 'learner'])
            ->whereIn('book_id', $allBookingIds)
            ->where('booking_status', 'active')
            ->get();

        // Build calendar events
        $calendarEvents = [];

        // Group sessions by booking for session numbering
        $sessionsByBooking = [];
        foreach ($allSessions as $session) {
            $bookId = $session->book_id;
            if (!isset($sessionsByBooking[$bookId])) {
                // Get ALL sessions for this booking to calculate correct session number
                $allBookingSessions = BookingSession::where('book_id', $bookId)
                    ->orderBy('session_date')
                    ->get();
                $sessionsByBooking[$bookId] = $allBookingSessions;
            }
        }

        foreach ($allSessions as $session) {
            $booking = $session->booking;
            $program = $booking?->program;
            $learner = $booking?->learner;

            // Calculate session number (1-based index within the booking)
            $bookingSessions = $sessionsByBooking[$session->book_id] ?? collect();
            $sessionNumber = $bookingSessions->search(function ($item) use ($session) {
                return $item->session_id === $session->session_id;
            }) + 1;

            // Get program times safely
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

            // Get lectures for this booking
            $bookingLectures = Lecture::where('book_id', $booking->book_id)->get();
            $lectureIds = $bookingLectures->pluck('lecture_id')->toArray();

            // Get all tutors for this session
            $sessionTutors = $session->tutors->map(function ($t) {
                return $t->user->name ?? $t->name ?? 'Unknown';
            })->implode(', ');

            // Check if this tutor is specifically assigned to this session (substituted)
            $isSubstituted = in_array($session->session_id, $substitutedSessionIds);

            $calendarEvents[] = [
                'id' => $session->session_id,
                'title' => $program?->name ?? 'Session',
                'start' => $session->session_date instanceof Carbon
                    ? $session->session_date->format('Y-m-d')
                    : date('Y-m-d', strtotime($session->session_date)),
                'allDay' => false,
                'backgroundColor' => $isSubstituted ? '#8b5cf6' : '#f97316', // Purple for substituted, Orange for regular
                'borderColor' => $isSubstituted ? '#8b5cf6' : '#f97316',
                'extendedProps' => [
                    'session_id' => $session->session_id,
                    'booking_id' => $booking->book_id,
                    'session_number' => $sessionNumber,
                    'total_sessions' => $booking->session_count ?? 1,
                    'lecture_ids' => $lectureIds,
                    'lecture_count' => count($lectureIds),
                    'learner' => $learner?->name ?? $learner?->full_name ?? null,
                    'tutor' => $sessionTutors ?: 'Not assigned',
                    'program' => $program?->name ?? null,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'status' => $session->status,
                    'notes' => $session->notes,
                    'is_substituted' => $isSubstituted, // Flag to indicate this is a substituted session
                ],
            ];
        }

        // If no sessions exist yet, fall back to generating from bookings
        if (count($calendarEvents) === 0 && $allBookings->count() > 0) {
            foreach ($allBookings as $booking) {
                if (!$booking->book_date) continue;

                $startDate = Carbon::parse($booking->book_date);
                $programDays = $this->parseProgramDays($booking->program?->days);

                for ($i = 0; $i < $booking->session_count; $i++) {
                    $sessionDate = $this->calculateSessionDate($startDate, $programDays, $i);

                    if ($sessionDate) {
                        $bookingLectures = Lecture::where('book_id', $booking->book_id)->get();
                        $lectureIds = $bookingLectures->pluck('lecture_id')->toArray();

                        $startTime = $booking->program?->start_time
                            ? Carbon::parse($booking->program->start_time)->format('h:i A')
                            : null;
                        $endTime = $booking->program?->end_time
                            ? Carbon::parse($booking->program->end_time)->format('h:i A')
                            : null;

                        $calendarEvents[] = [
                            'id' => $booking->book_id . '_session_' . ($i + 1),
                            'title' => $booking->program?->name ?? 'Session',
                            'start' => $sessionDate->format('Y-m-d'),
                            'allDay' => false,
                            'extendedProps' => [
                                'booking_id' => $booking->book_id,
                                'session_number' => $i + 1,
                                'total_sessions' => $booking->session_count,
                                'lecture_ids' => $lectureIds,
                                'lecture_count' => count($lectureIds),
                                'learner' => $booking->learner?->name ?? null,
                                'tutor' => 'Assigned',
                                'program' => $booking->program?->name ?? null,
                                'start_time' => $startTime,
                                'end_time' => $endTime,
                                'status' => 'pending',
                                'notes' => null,
                                'is_substituted' => false,
                            ],
                        ];
                    }
                }
            }
        }

        // Get all lectures for this tutor
        $allTutorBookingIds = Booking::whereJsonContains('tutor_ids', $tutor->tutor_id)
            ->pluck('book_id');

        $sessionBookingIds = DB::table('booking_sessions')
            ->join('booking_session_tutor', 'booking_sessions.session_id', '=', 'booking_session_tutor.session_id')
            ->where('booking_session_tutor.tutor_id', $tutor->tutor_id)
            ->pluck('booking_sessions.book_id');

        $allBookingIdsForLectures = $allTutorBookingIds->merge($sessionBookingIds)->unique();

        $lectures = Lecture::whereIn('book_id', $allBookingIdsForLectures)->get();

        // Calculate stats
        $uniqueLearners = $allBookings->pluck('learner_id')->filter()->unique();

        $stats = [
            'activeBookings' => $allBookings->count(),
            'totalLectures' => $lectures->count(),
            'totalStudents' => $uniqueLearners->count(),
            'totalSessions' => $allSessions->count(),
        ];

        return Inertia::render('Tutor/Dashboard', [
            'calendarEvents' => $calendarEvents,
            'stats' => $stats,
            'tutor_id' => $tutor->tutor_id,
        ]);
    }

    public function updateSessionStatus(Request $request)
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return back()->withErrors(['error' => 'Tutor not found.']);
        }

        $validated = $request->validate([
            'session_id' => 'required|string|exists:booking_sessions,session_id',
            'status' => 'required|in:pending,ongoing,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $session = BookingSession::with('booking')->findOrFail($request->session_id);

        // Verify this session belongs to a booking assigned to this tutor
        $booking = $session->booking;
        $bookingTutorIds = $booking->tutor_ids ?? [];
        if (is_string($bookingTutorIds)) {
            $bookingTutorIds = json_decode($bookingTutorIds, true) ?? [];
        }

        $isAuthorized = in_array($tutor->tutor_id, $bookingTutorIds)
            || $session->tutors->contains('tutor_id', $tutor->tutor_id);

        if (!$isAuthorized) {
            return back()->withErrors(['error' => 'Unauthorized to update this session.']);
        }

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
                Log::info('Payroll generated for completed session (tutor)', [
                    'session_id' => $session->session_id,
                    'tutor_id' => $tutor->tutor_id,
                    'payroll_count' => count($payrolls),
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to generate payroll for session (tutor)', [
                    'session_id' => $session->session_id,
                    'tutor_id' => $tutor->tutor_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Tutor updated session status', [
            'tutor_id' => $tutor->tutor_id,
            'session_id' => $session->session_id,
            'old_status' => $oldStatus,
            'new_status' => $request->status,
        ]);

        return back()->with('success', 'Session status updated successfully');
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
            'sunday' => 0,
            'sun' => 0,
            'monday' => 1,
            'mon' => 1,
            'tuesday' => 2,
            'tue' => 2,
            'wednesday' => 3,
            'wed' => 3,
            'thursday' => 4,
            'thu' => 4,
            'friday' => 5,
            'fri' => 5,
            'saturday' => 6,
            'sat' => 6,
        ];

        $targetDays = [];
        foreach ($programDays as $day) {
            $dayLower = strtolower(trim($day));
            if (isset($dayMap[$dayLower])) {
                $targetDays[] = $dayMap[$dayLower];
            }
        }

        if (empty($targetDays)) {
            return $startDate->copy()->addDays($sessionIndex);
        }

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

    public function bookings()
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return Inertia::render('Tutor/Bookings/Index', [
                'bookings' => [],
                'tutor_id' => '',
            ]);
        }

        $bookings = Booking::with(['program', 'learner', 'parent'])
            ->where('tutor_id', $tutor->tutor_id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Booking $booking) {
                return [
                    'book_id' => $booking->book_id,
                    'book_date' => $booking->book_date?->format('Y-m-d'),
                    'session_count' => $booking->session_count,
                    'status' => $booking->status,
                    'booking_status' => $booking->booking_status,
                    'payment_status' => $booking->payment_status,
                    'amount' => $booking->amount,
                    'notes' => $booking->notes,
                    'program' => $booking->program ? [
                        'prog_id' => $booking->program->prog_id,
                        'name' => $booking->program->name,
                        'prog_type' => $booking->program->prog_type,
                        'start_time' => $booking->program->start_time?->format('H:i'),
                        'end_time' => $booking->program->end_time?->format('H:i'),
                        'days' => $booking->program->days,
                    ] : null,
                    'learner' => $booking->learner ? [
                        'learner_id' => $booking->learner->learner_id,
                        'name' => $booking->learner->name,
                        'nickname' => $booking->learner->nickname,
                        'photo' => $booking->learner->photo
                            ? asset('storage/' . $booking->learner->photo)
                            : null,
                    ] : null,
                    'parent' => $booking->parent ? [
                        'name' => $booking->parent->name,
                        'email' => $booking->parent->email,
                    ] : null,
                ];
            });

        return Inertia::render('Tutor/Bookings/Index', [
            'bookings' => $bookings,
            'tutor_id' => $tutor->tutor_id,
        ]);
    }

    public function lectures()
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return Inertia::render('Tutor/Lectures/Index', [
                'lectures' => [],
            ]);
        }

        // Get bookings where tutor is in tutor_ids JSON field OR assigned via pivot table
        $bookingIdsFromJson = Booking::whereJsonContains('tutor_ids', $tutor->tutor_id)
            ->pluck('book_id');

        $bookingIdsFromSessions = DB::table('booking_sessions')
            ->join('booking_session_tutor', 'booking_sessions.session_id', '=', 'booking_session_tutor.session_id')
            ->where('booking_session_tutor.tutor_id', $tutor->tutor_id)
            ->pluck('booking_sessions.book_id');

        $tutorBookingIds = $bookingIdsFromJson->merge($bookingIdsFromSessions)->unique();

        $lectures = Lecture::with(['program', 'booking.learner', 'booking.parent'])
            ->whereIn('book_id', $tutorBookingIds)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Lecture $lecture) {
                return [
                    'lecture_id' => $lecture->lecture_id,
                    'name' => $lecture->name,
                    'platform' => $lecture->platform,
                    'platform_link' => $lecture->platform_link,
                    'created_at' => $lecture->created_at?->format('Y-m-d H:i:s'),
                    'program' => $lecture->program ? [
                        'prog_id' => $lecture->program->prog_id,
                        'name' => $lecture->program->name,
                        'start_time' => $lecture->program->start_time?->format('H:i'),
                        'end_time' => $lecture->program->end_time?->format('H:i'),
                        'days' => $lecture->program->days,
                    ] : null,
                    'booking' => $lecture->booking ? [
                        'book_id' => $lecture->booking->book_id,
                        'book_date' => $lecture->booking->book_date?->format('Y-m-d'),
                        'session_count' => $lecture->booking->session_count,
                        'notes' => $lecture->booking->notes,
                        'learner' => $lecture->booking->learner ? [
                            'learner_id' => $lecture->booking->learner->learner_id,
                            'name' => $lecture->booking->learner->name,
                            'nickname' => $lecture->booking->learner->nickname,
                            'photo' => $lecture->booking->learner->photo
                                ? asset('storage/' . $lecture->booking->learner->photo)
                                : null,
                        ] : null,
                        'parent' => $lecture->booking->parent ? [
                            'name' => $lecture->booking->parent->name,
                        ] : null,
                    ] : null,
                ];
            });

        return Inertia::render('Tutor/Lectures/Index', [
            'lectures' => $lectures,
            'tutor_id' => $tutor->tutor_id,
        ]);
    }



    public function updateLecture(Request $request, $lectureId)
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return redirect()->back()->withErrors(['error' => 'Tutor not found.']);
        }

        // Find lecture and verify it belongs to this tutor
        $lecture = Lecture::findOrFail($lectureId);
        $booking = $lecture->booking;

        if (!$booking || $booking->tutor_id !== $tutor->tutor_id) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized to edit this lecture.']);
        }

        $validated = $request->validate([
            'platform' => ['required', 'string', 'max:255'],
            'platform_link' => ['required', 'url', 'max:500'],
        ]);

        $lecture->update($validated);

        return redirect()->back()->with('success', 'Lecture updated successfully.');
    }

    public function profile()
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return Inertia::render('Tutor/Profile/Index', [
                'tutor' => null,
            ]);
        }

        return Inertia::render('Tutor/Profile/Index', [
            'tutor' => [
                'tutor_id' => $tutor->tutor_id,
                'user_id' => $tutor->user_id,
                'name' => $tutor->user?->name,
                'email' => $tutor->user?->email,
                'specializations' => $tutor->specializations,
                'subject' => $tutor->subject,
                'photo' => $tutor->photo ? asset('storage/' . $tutor->photo) : null,
                'portfolio_link' => $tutor->portfolio_link,
                'bio' => $tutor->bio,
                'status' => $tutor->status,
                'number' => $tutor->number,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return redirect()->back()->withErrors(['error' => 'Tutor profile not found.']);
        }

        $validated = $request->validate([
            'specializations' => ['nullable', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'portfolio_link' => ['nullable', 'url', 'max:500'],
            'bio' => ['nullable', 'string'],
            'number' => ['nullable', 'string', 'max:20'],
            'photo' => ['nullable', 'image', 'max:2048'], // 2MB max
        ]);

        // Update text fields
        $tutor->specializations = $request->specializations;
        $tutor->subject = $request->subject;
        $tutor->portfolio_link = $request->portfolio_link;
        $tutor->bio = $request->bio;
        $tutor->number = $request->number;

        // Handle photo upload
        if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
            // Delete old photo if exists
            if ($tutor->photo) {
                $oldPath = 'public/' . $tutor->photo;
                if (Storage::exists($oldPath)) {
                    Storage::delete($oldPath);
                }
            }

            // Store new photo
            $path = $request->file('photo')->store('tutors', 'public');
            $tutor->photo = $path;
        }

        $tutor->save();

        // Return updated tutor data
        return redirect()->back()->with('success', 'Profile updated successfully.');
    }
}
