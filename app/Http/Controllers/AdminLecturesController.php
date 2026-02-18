<?php

namespace App\Http\Controllers;

use App\Models\Lecture;
use App\Models\Booking;
use App\Models\Program;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminLecturesController extends Controller
{
    public function index()
    {
        $lectures = Lecture::with(['program', 'booking.learner', 'booking.parent', 'booking.tutor.user'])
            ->where('is_active', true)
            ->whereHas('booking', function ($query) {
                // Include lectures for bookings that are either processing or active
                $query->whereIn('booking_status', ['processing', 'active']);
            })
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
                        'prog_type' => $lecture->program->prog_type,
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
                        'tutor' => $lecture->booking->tutor ? [
                            'tutor_id' => $lecture->booking->tutor->tutor_id,
                            'name' => $lecture->booking->tutor->user?->name ?? null,
                        ] : null,
                    ] : null,
                ];
            });

        // Get available bookings without lectures for the create form
        $availableBookings = Booking::with(['program', 'learner', 'parent'])
            ->where('status', 'approved')
            ->where('payment_status', 'paid')
            ->where('booking_status', 'active')
            ->whereDoesntHave('lectures')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function (Booking $booking) {
                return [
                    'book_id' => $booking->book_id,
                    'prog_type' => $booking->program?->prog_type ?? 'online',
                    'program_name' => $booking->program?->name ?? 'N/A',
                    'learner_name' => $booking->learner?->name ?? 'N/A',
                    'parent_name' => $booking->parent?->name ?? 'N/A',
                    'book_date' => $booking->book_date?->format('Y-m-d'),
                    'session_count' => $booking->session_count,
                    'notes' => $booking->notes,
                ];
            });

        // Get available tutors for assignment
        $tutors = Tutor::with('user')
            ->where('status', 'active')
            ->get()
            ->map(function (Tutor $tutor) {
                return [
                    'tutor_id' => $tutor->tutor_id,
                    'name' => $tutor->user?->name ?? 'Unknown',
                ];
            });

        return Inertia::render('Admin/Lectures/Index', [
            'lectures' => $lectures,
            'available_bookings' => $availableBookings,
            'available_tutors' => $tutors,
        ]);
    }

    public function store(Request $request)
    {
        // First, get the booking to check program type
        $booking = Booking::with('program')->where('book_id', $request->book_id)->first();
        if (!$booking) {
            return redirect()->back()->withErrors(['error' => 'Booking not found.']);
        }

        $rules = [
            'book_id' => ['required', Rule::exists('bookings', 'book_id')],
            'name' => ['required', 'string', 'max:255'],
            'tutor_id' => ['nullable', Rule::exists('tutors', 'tutor_id')],
        ];

        // Only require platform and platform_link if it's not a hub program
        if ($booking->program?->prog_type !== 'hub') {
            $rules['platform'] = ['required', 'string', 'max:100'];
            $rules['platform_link'] = ['required', 'url', 'max:500'];
        } else {
            $rules['platform'] = ['nullable', 'string', 'max:100'];
            $rules['platform_link'] = ['nullable', 'url', 'max:500'];
        }

        $validated = $request->validate($rules);

        // Check if lecture already exists for this booking
        if (Lecture::where('book_id', $validated['book_id'])->exists()) {
            return redirect()->back()->withErrors(['error' => 'A lecture already exists for this booking.']);
        }

        // Update booking with tutor if provided
        if (!empty($validated['tutor_id'])) {
            $booking->update(['tutor_id' => $validated['tutor_id']]);
        }

        Lecture::create([
            'name' => $validated['name'],
            'platform' => $validated['platform'] ?? null,
            'platform_link' => $validated['platform_link'] ?? null,
            'prog_id' => $booking->prog_id,
            'book_id' => $validated['book_id'],
        ]);

        Log::info('Lecture created by admin', [
            'lecture_name' => $validated['name'],
            'book_id' => $validated['book_id'],
        ]);

        return redirect()->back()->with('success', 'Lecture created successfully.');
    }

    public function update(Request $request, Lecture $lecture)
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'tutor_id' => ['nullable', Rule::exists('tutors', 'tutor_id')],
        ];

        // Only require platform and platform_link if it's not a hub program
        if ($lecture->program?->prog_type !== 'hub') {
            $rules['platform'] = ['required', 'string', 'max:100'];
            $rules['platform_link'] = ['required', 'url', 'max:500'];
        } else {
            $rules['platform'] = ['nullable', 'string', 'max:100'];
            $rules['platform_link'] = ['nullable', 'url', 'max:500'];
        }

        $validated = $request->validate($rules);

        // Update tutor if provided
        if (isset($validated['tutor_id'])) {
            if ($lecture->booking) {
                $lecture->booking->update(['tutor_id' => $validated['tutor_id']]);
            }
            unset($validated['tutor_id']);
        }

        $lecture->update($validated);

        Log::info('Lecture updated by admin', [
            'lecture_id' => $lecture->lecture_id,
        ]);

        return redirect()->back()->with('success', 'Lecture updated successfully.');
    }

    public function destroy(Lecture $lecture)
    {
        $lectureName = $lecture->name;
        $lecture->delete();

        Log::info('Lecture deleted by admin', [
            'lecture_name' => $lectureName,
        ]);

        return redirect()->back()->with('success', 'Lecture deleted successfully.');
    }
}
