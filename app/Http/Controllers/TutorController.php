<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Lecture;
use App\Models\Tutor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TutorController extends Controller
{
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
            ]);
        }

        // Get tutor's active bookings
        $bookings = Booking::with(['program', 'learner', 'tutor'])
            ->where('tutor_id', $tutor->tutor_id)
            ->where('booking_status', 'active')
            ->get();

        // Build calendar events - ONE EVENT PER SESSION (only on specified days)
        $calendarEvents = [];

        foreach ($bookings as $booking) {
            if (!$booking->book_date) continue;

            $startDate = Carbon::parse($booking->book_date);
            $programDays = $this->parseProgramDays($booking->program?->days);

            // Generate individual events for EACH session
            for ($i = 0; $i < $booking->session_count; $i++) {
                $sessionDate = $this->calculateSessionDate($startDate, $programDays, $i);

                if ($sessionDate) {
                    // Get lectures for this booking (if any)
                    $bookingLectures = Lecture::where('book_id', $booking->book_id)->get();
                    $lectureIds = $bookingLectures->pluck('lecture_id')->toArray();

                    $calendarEvents[] = [
                        'id' => $booking->book_id . '_session_' . ($i + 1),
                        'title' => $booking->program?->name ?? 'Session',
                        'start' => $sessionDate->format('Y-m-d'),
                        'allDay' => true,
                        'extendedProps' => [
                            'booking_id' => $booking->book_id,
                            'session_number' => $i + 1,
                            'total_sessions' => $booking->session_count,
                            'lecture_ids' => $lectureIds,
                            'lecture_count' => count($lectureIds),
                            'learner' => $booking->learner?->name ?? null,
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

        // Get tutor's lectures (from all bookings, not just active)
        $allTutorBookingIds = Booking::where('tutor_id', $tutor->tutor_id)->pluck('book_id');
        $lectures = Lecture::with(['booking.program', 'booking.learner'])
            ->whereIn('book_id', $allTutorBookingIds)
            ->get();

        // Calculate stats
        $stats = [
            'activeBookings' => $bookings->count(),
            'totalLectures' => $lectures->count(),
            'totalStudents' => $bookings->pluck('learner_id')->unique()->count(),
            'totalSessions' => $bookings->sum('session_count'),
        ];

        // Log for debugging
        \Log::info('Tutor Dashboard Data:', [
            'tutor_id' => $tutor->tutor_id,
            'bookings_count' => $bookings->count(),
            'calendar_events_count' => count($calendarEvents),
            'first_booking' => $bookings->first()?->toArray(),
            'sample_days' => array_slice($programDays ?? [], 0, 5),
        ]);

        return Inertia::render('Tutor/Dashboard', [
            'calendarEvents' => $calendarEvents,
            'stats' => $stats,
            'tutor_id' => $tutor->tutor_id,
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
     * Returns the date for a specific session index, counting only the specified days
     */
    private function calculateSessionDate(Carbon $startDate, array $programDays, int $sessionIndex): ?Carbon
    {
        // If no days specified, use consecutive days
        if (empty($programDays)) {
            return $startDate->copy()->addDays($sessionIndex);
        }

        // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
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

        // Convert program days to day numbers
        $targetDays = [];
        foreach ($programDays as $day) {
            $dayLower = strtolower(trim($day));
            if (isset($dayMap[$dayLower])) {
                $targetDays[] = $dayMap[$dayLower];
            }
        }

        // If no valid days found, fall back to consecutive days
        if (empty($targetDays)) {
            return $startDate->copy()->addDays($sessionIndex);
        }

        // Sort days for consistent processing
        sort($targetDays);

        $currentDate = $startDate->copy();
        $foundSessions = 0;

        // If sessionIndex is 0, check if start date is a valid day
        if ($sessionIndex === 0) {
            // If start date is not a valid day, find the next valid day
            while (!in_array($currentDate->dayOfWeek, $targetDays)) {
                $currentDate->addDay();
            }
            return $currentDate;
        }

        // Count through sessions until we reach the desired index
        while (true) {
            // Check if current day is one of our target days
            if (in_array($currentDate->dayOfWeek, $targetDays)) {
                if ($foundSessions === $sessionIndex) {
                    return $currentDate;
                }
                $foundSessions++;
            }

            $currentDate->addDay();

            // Safety check to prevent infinite loop
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

        // Get bookings for this tutor (all statuses)
        $tutorBookingIds = Booking::where('tutor_id', $tutor->tutor_id)
            ->pluck('book_id');

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
