<?php

namespace App\Http\Controllers;

use App\Models\Tutor;
use App\Models\TutorApplication;
use Inertia\Inertia;

class ParentTutorController extends Controller
{
    public function index()
    {
        $tutors = Tutor::with('user')
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Tutor $tutor) {
                return [
                    'tutor_id' => $tutor->tutor_id,
                    'name' => $tutor->user?->name ?? 'Unknown',
                    'email' => $tutor->user?->email ?? null,
                    'subject' => $tutor->subject,
                    'bio' => $tutor->bio,
                    'photo' => $tutor->photo ? asset('storage/' . $tutor->photo) : null,
                    'rate_per_hour' => $tutor->rate_per_hour,
                    'specializations' => is_array($tutor->specializations) ? $tutor->specializations : (is_string($tutor->specializations) ? json_decode($tutor->specializations, true) : []),
                    'portfolio_link' => $tutor->portfolio_link,
                    'number' => $tutor->number,
                ];
            });

        return Inertia::render('Parent/Tutors/Index', [
            'tutors' => $tutors,
        ]);
    }

    public function show($tutor_id)
    {
        $tutor = Tutor::with('user')
            ->where('tutor_id', $tutor_id)
            ->where('status', 'active')
            ->firstOrFail();

        $tutorEmail = $tutor->user?->email;
        $application = null;

        // Fetch tutor application if email matches
        if ($tutorEmail) {
            $application = TutorApplication::where('email', $tutorEmail)
                ->where('status', 'approved')
                ->first();
        }

        $tutorData = [
            'tutor_id' => $tutor->tutor_id,
            'name' => $tutor->user?->name ?? 'Unknown',
            'email' => $tutorEmail,
            'subject' => $tutor->subject,
            'bio' => $tutor->bio,
            'photo' => $tutor->photo ? asset('storage/' . $tutor->photo) : null,
            'rate_per_hour' => $tutor->rate_per_hour,
            'specializations' => is_array($tutor->specializations) ? $tutor->specializations : (is_string($tutor->specializations) ? json_decode($tutor->specializations, true) : []),
            'portfolio_link' => $tutor->portfolio_link,
            'number' => $tutor->number,
        ];

        // Add application data if available
        if ($application) {
            $tutorData['application'] = [
                'full_name' => $application->full_name,
                'age' => $application->age,
                'gender' => $application->gender,
                'experience_levels' => is_array($application->tutoring_experience_levels) ? $application->tutoring_experience_levels : [],
                'experience_duration' => $application->tutoring_experience_duration,
                'employment_status' => $application->employment_status,
                'favorite_subject' => $application->favorite_subject_to_teach,
                'work_preference' => $application->work_preference,
                'class_size_preference' => $application->class_size_preference,
                'is_licensed_teacher' => $application->is_licensed_teacher,
                'has_school_experience' => $application->has_school_teaching_experience,
                'public_speaking_rating' => $application->public_speaking_rating,
                'creativity_rating' => $application->creativity_rating,
                'english_proficiency_rating' => $application->english_proficiency_rating,
                'enjoy_kids_rating' => $application->enjoy_playing_with_kids_rating,
            ];
        }

        return Inertia::render('Parent/Tutors/Show', [
            'tutor' => $tutorData,
        ]);
    }
}
