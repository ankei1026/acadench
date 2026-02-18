<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Lecture;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TutorController extends Controller
{
    public function index()
    {
        return Inertia::render('Tutor/Dashboard');
    }

    public function bookings()
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return Inertia::render('Tutor/Bookings/Index', [
                'bookings' => [],
            ]);
        }

        $bookings = Booking::with(['program', 'learner', 'parent'])
            ->where('tutor_id', $tutor->tutor_id)
            ->where('booking_status', 'active')
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

        // Get bookings for this tutor
        $tutorBookingIds = Booking::where('tutor_id', $tutor->tutor_id)
            ->where('booking_status', 'active')
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
