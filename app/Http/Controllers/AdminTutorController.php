<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTutorController extends Controller
{
    public function index()
    {
        $tutors = Tutor::with('user')
            ->get()
            ->map(function ($tutor) {
                return [
                    'id' => $tutor->id,
                    'tutor_id' => $tutor->tutor_id,
                    'subject' => $tutor->subject,
                    'specializations' => $tutor->specializations,
                    'rate_per_hour' => $tutor->rate_per_hour,
                    'bio' => $tutor->bio,
                    'photo' => $tutor->photo ? asset('storage/' . $tutor->photo) : null,
                    'mop' => $tutor->mop,
                    'number' => $tutor->number,
                    'status' => $tutor->status ?? 'active',
                    'user' => $tutor->user ? [
                        'id' => $tutor->user->id,
                        'name' => $tutor->user->name,
                        'email' => $tutor->user->email,
                    ] : null,
                ];
            });

        return Inertia::render(
            'Admin/Tutor/Index',
            [
                'tutors' => $tutors
            ]
        );
    }

    public function create()
    {
        return Inertia::render('Admin/Tutor/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'subject' => 'required|string'
        ]);

        try {
            // Create User first
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'role' => 'tutor',
            ]);

            // Create Tutor profile
            Tutor::create([
                'user_id' => $user->id,
                'subject' => $validated['subject']
            ]);

            return redirect()->route('admin.tutors')->with('success', 'Tutor created successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create tutor: ' . $e->getMessage());
        }
    }

    public function show($tutor_id)
    {
        $tutor = Tutor::with('user')
            ->where('tutor_id', $tutor_id)
            ->firstOrFail();

        $tutorData = [
            'id' => $tutor->id,
            'tutor_id' => $tutor->tutor_id,
            'subject' => $tutor->subject,
            'specializations' => $tutor->specializations,
            'rate_per_hour' => $tutor->rate_per_hour,
            'bio' => $tutor->bio,
            'photo' => $tutor->photo ? asset('storage/' . $tutor->photo) : null,
            'mop' => $tutor->mop,
            'number' => $tutor->number,
            'status' => $tutor->status ?? 'active',
            'portfolio_link' => $tutor->portfolio_link,

            // Personal Information
            'full_name' => $tutor->full_name,
            'email' => $tutor->email,
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
            'tutoring_experience_levels' => $tutor->tutoring_experience_levels ?? [],
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
            'reasons_love_teaching' => $tutor->reasons_love_teaching ?? [],
            'work_preference' => $tutor->work_preference,
            'class_size_preference' => $tutor->class_size_preference,
            'teaching_values' => $tutor->teaching_values ?? [],
            'application_reasons' => $tutor->application_reasons ?? [],
            'outside_activities' => $tutor->outside_activities ?? [],

            // Logistics
            'distance_from_hub_minutes' => $tutor->distance_from_hub_minutes ?? 0,
            'distance_from_work_minutes' => $tutor->distance_from_work_minutes ?? 0,
            'transportation_mode' => $tutor->transportation_mode,

            // Ratings and Preferences
            'enjoy_playing_with_kids_rating' => $tutor->enjoy_playing_with_kids_rating ?? 0,
            'preferred_toys_games' => $tutor->preferred_toys_games ?? [],
            'annoyances' => $tutor->annoyances ?? [],
            'need_job_rating' => $tutor->need_job_rating ?? 0,
            'public_speaking_rating' => $tutor->public_speaking_rating ?? 0,
            'penmanship_rating' => $tutor->penmanship_rating ?? 0,
            'creativity_rating' => $tutor->creativity_rating ?? 0,
            'english_proficiency_rating' => $tutor->english_proficiency_rating ?? 0,
            'preferred_teaching_language' => $tutor->preferred_teaching_language,

            // Technology and Teaching Methods
            'edtech_opinion' => $tutor->edtech_opinion,
            'needs_phone_while_teaching' => $tutor->needs_phone_while_teaching,
            'phone_usage_reason' => $tutor->phone_usage_reason,
            'teaching_difficulty_approach' => $tutor->teaching_difficulty_approach,
            'discipline_approach' => $tutor->discipline_approach,
            'approves_late_fine_reward' => $tutor->approves_late_fine_reward,
            'late_fine_reason' => $tutor->late_fine_reason,
            'expected_tenure' => $tutor->expected_tenure,

            // Commitment
            'preferred_workdays' => $tutor->preferred_workdays ?? [],
            'preferred_workdays_frequency' => $tutor->preferred_workdays_frequency,
            'preferred_schedule' => $tutor->preferred_schedule,

            // Work Environment Preferences
            'cleanliness_importance_rating' => $tutor->cleanliness_importance_rating ?? 0,
            'organization_importance_rating' => $tutor->organization_importance_rating ?? 0,
            'shared_environment_comfort_rating' => $tutor->shared_environment_comfort_rating ?? 0,
            'teaching_style_preference' => $tutor->teaching_style_preference,
            'ok_with_team_meetings' => $tutor->ok_with_team_meetings,
            'ok_with_parent_meetings' => $tutor->ok_with_parent_meetings,
            'recording_comfort' => $tutor->recording_comfort,
            'ok_with_media_usage' => $tutor->ok_with_media_usage,

            'user' => $tutor->user ? [
                'id' => $tutor->user->id,
                'name' => $tutor->user->name,
                'email' => $tutor->user->email,
            ] : null,
        ];

        return Inertia::render('Admin/Tutor/Show', [
            'tutor' => $tutorData
        ]);
    }

    public function updateStatus($tutor_id)
    {
        try {
            $tutor = Tutor::findOrFail($tutor_id);
            $tutor->status = $tutor->status === 'active' ? 'inactive' : 'active';
            $tutor->save();

            $action = $tutor->status === 'active' ? 'activated' : 'deactivated';
            $userName = $tutor->user ? $tutor->user->name : 'Tutor';

            return back()->with('success', "Tutor {$userName} has been {$action} successfully!");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update tutor status');
        }
    }
}
