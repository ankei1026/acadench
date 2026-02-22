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

        // Base tutor data
        $tutorData = [
            // Basic Info
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

            // Personal Information
            'full_name' => $tutor->full_name,
            'birthdate' => $tutor->birthdate?->format('Y-m-d'),
            'age' => $tutor->age,
            'gender' => $tutor->gender,
            'home_address' => $tutor->home_address,
            'facebook_link' => $tutor->facebook_link,
            'contact_number' => $tutor->contact_number,
            'mother_name' => $tutor->mother_name,
            'father_name' => $tutor->father_name,
            'living_status' => $tutor->living_status,

            // Educational Background
            'high_school' => $tutor->high_school,
            'college_school' => $tutor->college_school,
            'college_course' => $tutor->college_course,
            'is_licensed_teacher' => $tutor->is_licensed_teacher,
            'license_date' => $tutor->license_date?->format('Y-m-d'),

            // Teaching Experience
            'employment_status' => $tutor->employment_status,
            'current_employer' => $tutor->current_employer,
            'working_hours' => $tutor->working_hours,
            'tutoring_experience_levels' => is_array($tutor->tutoring_experience_levels) ? $tutor->tutoring_experience_levels : [],
            'tutoring_experience_duration' => $tutor->tutoring_experience_duration,
            'has_school_teaching_experience' => $tutor->has_school_teaching_experience,
            'school_teaching_experience_duration' => $tutor->school_teaching_experience_duration,
            'previous_clients' => $tutor->previous_clients,

            // Preferences and Skills
            'favorite_subject_to_teach' => $tutor->favorite_subject_to_teach,
            'easiest_subject_to_teach' => $tutor->easiest_subject_to_teach,
            'most_difficult_subject_to_teach' => $tutor->most_difficult_subject_to_teach,
            'easier_school_level_to_teach' => $tutor->easier_school_level_to_teach,
            'harder_school_level_to_teach' => $tutor->harder_school_level_to_teach,
            'reasons_love_teaching' => is_array($tutor->reasons_love_teaching) ? $tutor->reasons_love_teaching : [],
            'work_preference' => $tutor->work_preference,
            'class_size_preference' => $tutor->class_size_preference,
            'teaching_values' => is_array($tutor->teaching_values) ? $tutor->teaching_values : [],
            'application_reasons' => is_array($tutor->application_reasons) ? $tutor->application_reasons : [],
            'outside_activities' => is_array($tutor->outside_activities) ? $tutor->outside_activities : [],

            // Logistics
            'distance_from_hub_minutes' => $tutor->distance_from_hub_minutes,
            'distance_from_work_minutes' => $tutor->distance_from_work_minutes,
            'transportation_mode' => $tutor->transportation_mode,

            // Ratings
            'enjoy_playing_with_kids_rating' => $tutor->enjoy_playing_with_kids_rating,
            'preferred_toys_games' => is_array($tutor->preferred_toys_games) ? $tutor->preferred_toys_games : [],
            'annoyances' => is_array($tutor->annoyances) ? $tutor->annoyances : [],
            'need_job_rating' => $tutor->need_job_rating,
            'public_speaking_rating' => $tutor->public_speaking_rating,
            'penmanship_rating' => $tutor->penmanship_rating,
            'creativity_rating' => $tutor->creativity_rating,
            'english_proficiency_rating' => $tutor->english_proficiency_rating,
            'preferred_teaching_language' => $tutor->preferred_teaching_language,

            // Technology and Methods
            'edtech_opinion' => $tutor->edtech_opinion,
            'needs_phone_while_teaching' => $tutor->needs_phone_while_teaching,
            'phone_usage_reason' => $tutor->phone_usage_reason,
            'teaching_difficulty_approach' => $tutor->teaching_difficulty_approach,
            'discipline_approach' => $tutor->discipline_approach,
            'approves_late_fine_reward' => $tutor->approves_late_fine_reward,
            'late_fine_reason' => $tutor->late_fine_reason,
            'expected_tenure' => $tutor->expected_tenure,

            // Commitment
            'preferred_workdays' => is_array($tutor->preferred_workdays) ? $tutor->preferred_workdays : [],
            'preferred_workdays_frequency' => $tutor->preferred_workdays_frequency,
            'preferred_schedule' => $tutor->preferred_schedule,

            // Work Environment
            'cleanliness_importance_rating' => $tutor->cleanliness_importance_rating,
            'organization_importance_rating' => $tutor->organization_importance_rating,
            'shared_environment_comfort_rating' => $tutor->shared_environment_comfort_rating,
            'teaching_style_preference' => $tutor->teaching_style_preference,
            'ok_with_team_meetings' => $tutor->ok_with_team_meetings,
            'ok_with_parent_meetings' => $tutor->ok_with_parent_meetings,
            'recording_comfort' => $tutor->recording_comfort,
            'ok_with_media_usage' => $tutor->ok_with_media_usage,
        ];

        // Try to get additional application data if email exists
        if ($tutorEmail) {
            $application = TutorApplication::where('email', $tutorEmail)
                ->where('status', 'approved')
                ->first();

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
                    'high_school' => $application->high_school,
                    'college_school' => $application->college_school,
                    'college_course' => $application->college_course,
                    'reasons_love_teaching' => is_array($application->reasons_love_teaching) ? $application->reasons_love_teaching : [],
                    'teaching_values' => is_array($application->teaching_values) ? $application->teaching_values : [],
                    'preferred_workdays' => is_array($application->preferred_workdays) ? $application->preferred_workdays : [],
                    'transportation_mode' => $application->transportation_mode,
                    'distance_from_hub_minutes' => $application->distance_from_hub_minutes,
                ];
            }
        }

        return Inertia::render('Parent/Tutors/Show', [
            'tutor' => $tutorData,
        ]);
    }
}
