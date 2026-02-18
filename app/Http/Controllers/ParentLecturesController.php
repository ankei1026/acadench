<?php

namespace App\Http\Controllers;

use App\Models\Lecture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentLecturesController extends Controller
{
    public function index()
    {
        $lectures = Lecture::with(['program', 'booking.learner', 'booking.tutor.user'])
            ->where('is_active', true)
            ->whereHas('booking', function ($query) {
                // Return lectures for this parent's bookings that are processing or active
                $query->where('parent_id', Auth::id())
                      ->whereIn('booking_status', ['processing', 'active']);
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
                        'name' => $lecture->program->name,
                        'prog_type' => $lecture->program->prog_type,
                        'session_count' => $lecture->program->session_count,
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
                        'tutor' => $lecture->booking->tutor ? [
                            'tutor_id' => $lecture->booking->tutor->tutor_id,
                            'name' => $lecture->booking->tutor->user?->name ?? null,
                        ] : null,
                    ] : null,
                ];
            });

        return Inertia::render('Parent/Lectures/Index', [
            'lectures' => $lectures,
        ]);
    }
}
