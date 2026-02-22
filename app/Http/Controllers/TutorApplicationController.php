<?php

namespace App\Http\Controllers;

use App\Models\TutorApplication;
use App\Models\User;
use App\Notifications\InAppNotification;
use App\Notifications\TutorApplicationStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TutorApplicationController extends Controller
{
    public function index()
    {
        return Inertia::render('TutorApplication');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Personal Information
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'birthdate' => ['required', 'date'],
            'age' => ['required', 'string', 'max:3'],
            'gender' => ['required', 'string', 'in:male,female,prefer not to say'],
            'home_address' => ['required', 'string', 'max:500'],
            'facebook_link' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:20'],
            'mother_name' => ['required', 'string', 'max:255'],
            'father_name' => ['required', 'string', 'max:255'],
            'living_status' => ['required', 'string', 'in:single,married,widowed,separated,in a relationship'],

            // Educational Background
            'high_school' => ['required', 'string', 'max:255'],
            'college_school' => ['required', 'string', 'max:255'],
            'college_course' => ['required', 'string', 'max:255'],
            'is_licensed_teacher' => ['required', 'boolean'],
            'license_date' => ['nullable', 'date', 'required_if:is_licensed_teacher,true'],

            // Teaching Experience
            'employment_status' => ['required', 'string', 'in:employed,unemployed,freelance,business_owner'],
            'current_employer' => [
                'nullable',
                'string',
                'max:255',
                'required_if:employment_status,employed',
                'required_if:employment_status,freelance',
                'required_if:employment_status,business_owner',
            ],
            'working_hours' => [
                'nullable',
                'string',
                'max:100',
                'required_if:employment_status,employed',
                'required_if:employment_status,freelance',
                'required_if:employment_status,business_owner',
            ],
            'tutoring_experience_levels' => ['required', 'array', 'min:1'],
            'tutoring_experience_levels.*' => ['string', 'in:Elementary,High School,College,Adult'],
            'tutoring_experience_duration' => ['required', 'string', 'max:100'],
            'has_school_teaching_experience' => ['required', 'boolean'],
            'school_teaching_experience_duration' => [
                'nullable',
                'string',
                'max:100',
                'required_if:has_school_teaching_experience,true',
            ],
            'previous_clients' => [
                'nullable',
                'string',
                'required_if:has_school_teaching_experience,true',
            ],

            // Preferences and Skills
            'favorite_subject_to_teach' => ['required', 'string', 'max:255'],
            'easiest_subject_to_teach' => ['required', 'string', 'max:255'],
            'most_difficult_subject_to_teach' => ['required', 'string', 'max:255'],
            'easier_school_level_to_teach' => ['required', 'string', 'max:255'],
            'harder_school_level_to_teach' => ['required', 'string', 'max:255'],
            'reasons_love_teaching' => ['required', 'array', 'min:1'],
            'reasons_love_teaching.*' => ['string'],
            'work_preference' => ['required', 'string', 'in:alone,team'],
            'class_size_preference' => ['required', 'string', 'in:one_two,many'],
            'teaching_values' => ['required', 'array', 'min:1'],
            'teaching_values.*' => ['string'],
            'application_reasons' => ['required', 'array', 'min:1'],
            'application_reasons.*' => ['string'],
            'outside_activities' => ['required', 'array', 'min:1'],
            'outside_activities.*' => ['string'],

            // Logistics
            'distance_from_hub_minutes' => ['required', 'integer', 'min:0', 'max:1000'],
            'distance_from_work_minutes' => ['required', 'integer', 'min:0', 'max:1000'],
            'transportation_mode' => ['required', 'string', 'in:motorcycle,public,fetched,walk,car,bike'],

            // Ratings
            'enjoy_playing_with_kids_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'preferred_toys_games' => ['required', 'array', 'min:1'],
            'preferred_toys_games.*' => ['string'],
            'annoyances' => ['required', 'array', 'min:1'],
            'annoyances.*' => ['string'],
            'need_job_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'public_speaking_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'penmanship_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'creativity_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'english_proficiency_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'preferred_teaching_language' => ['required', 'string', 'in:English,Filipino,Both'],

            // Technology and Teaching Methods
            'edtech_opinion' => ['required', 'string', 'in:agree,disagree,unfamiliar'],
            'needs_phone_while_teaching' => ['required', 'boolean'],
            'phone_usage_reason' => ['nullable', 'string', 'required_if:needs_phone_while_teaching,true'],
            'teaching_difficulty_approach' => ['required', 'string', 'min:10', 'max:1000'],
            'discipline_approach' => ['required', 'string', 'min:10', 'max:1000'],
            'approves_late_fine_reward' => ['required', 'boolean'],
            'late_fine_reason' => ['nullable', 'string', 'required_if:approves_late_fine_reward,true'],
            'expected_tenure' => ['required', 'string', 'in:1-3_months,6_months,one_year,permanent'],

            // Commitment
            'preferred_workdays' => ['required', 'array', 'min:1'],
            'preferred_workdays.*' => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'preferred_workdays_frequency' => ['required', 'string', 'in:5x_weekdays,4x_weekdays,3x_weekdays,saturdays_only,sundays_only,both_weekends,unlimited_weekdays,unlimited_all_days'],
            'preferred_schedule' => ['required', 'string', 'in:morning_9am,after_school_5_7pm,whenever_available,any_time,custom'],

            // Work Environment Preferences
            'cleanliness_importance_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'organization_importance_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'shared_environment_comfort_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'teaching_style_preference' => ['required', 'string', 'in:own_way,guided'],
            'ok_with_team_meetings' => ['required', 'boolean'],
            'ok_with_parent_meetings' => ['required', 'boolean'],
            'recording_comfort' => ['required', 'string', 'in:yes,no,unsure'],
            'ok_with_media_usage' => ['required', 'boolean'],

            // Final Review
            'subject' => ['required', 'string', 'max:255'],
            'document_path' => ['required', 'file', 'mimes:pdf', 'max:5120'], // 5MB max
        ]);

        // Handle file upload
        $documentPath = null;
        if ($request->hasFile('document_path') && $request->file('document_path')->isValid()) {
            // Generate a clean filename: Lastname_Firstname_Resume.pdf
            $nameParts = explode(' ', trim($validated['full_name']));
            $lastName = array_pop($nameParts);
            $firstName = implode('_', $nameParts);
            $cleanFilename = $lastName . '_' . $firstName . '_Resume.pdf';

            // Store with custom filename
            $documentPath = $request->file('document_path')->storeAs(
                'tutor-applications',
                $cleanFilename,
                'public'
            );
        }

        // Create application with ALL fields
        $application = TutorApplication::create([
            // Personal Information
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'birthdate' => $validated['birthdate'],
            'age' => $validated['age'],
            'gender' => $validated['gender'],
            'home_address' => $validated['home_address'],
            'facebook_link' => $validated['facebook_link'],
            'contact_number' => $validated['contact_number'],
            'mother_name' => $validated['mother_name'],
            'father_name' => $validated['father_name'],
            'living_status' => $validated['living_status'],

            // Educational Background
            'high_school' => $validated['high_school'],
            'college_school' => $validated['college_school'],
            'college_course' => $validated['college_course'],
            'is_licensed_teacher' => $validated['is_licensed_teacher'],
            'license_date' => $validated['license_date'] ?? null,

            // Teaching Experience
            'employment_status' => $validated['employment_status'],
            'current_employer' => $validated['current_employer'] ?? null,
            'working_hours' => $validated['working_hours'] ?? null,
            'tutoring_experience_levels' => $validated['tutoring_experience_levels'],
            'tutoring_experience_duration' => $validated['tutoring_experience_duration'],
            'has_school_teaching_experience' => $validated['has_school_teaching_experience'],
            'school_teaching_experience_duration' => $validated['school_teaching_experience_duration'] ?? null,
            'previous_clients' => $validated['previous_clients'] ?? null,

            // Preferences and Skills
            'favorite_subject_to_teach' => $validated['favorite_subject_to_teach'],
            'easiest_subject_to_teach' => $validated['easiest_subject_to_teach'],
            'most_difficult_subject_to_teach' => $validated['most_difficult_subject_to_teach'],
            'easier_school_level_to_teach' => $validated['easier_school_level_to_teach'],
            'harder_school_level_to_teach' => $validated['harder_school_level_to_teach'],
            'reasons_love_teaching' => $validated['reasons_love_teaching'],
            'work_preference' => $validated['work_preference'],
            'class_size_preference' => $validated['class_size_preference'],
            'teaching_values' => $validated['teaching_values'],
            'application_reasons' => $validated['application_reasons'],
            'outside_activities' => $validated['outside_activities'],

            // Logistics
            'distance_from_hub_minutes' => $validated['distance_from_hub_minutes'],
            'distance_from_work_minutes' => $validated['distance_from_work_minutes'],
            'transportation_mode' => $validated['transportation_mode'],

            // Ratings
            'enjoy_playing_with_kids_rating' => $validated['enjoy_playing_with_kids_rating'],
            'preferred_toys_games' => $validated['preferred_toys_games'],
            'annoyances' => $validated['annoyances'],
            'need_job_rating' => $validated['need_job_rating'],
            'public_speaking_rating' => $validated['public_speaking_rating'],
            'penmanship_rating' => $validated['penmanship_rating'],
            'creativity_rating' => $validated['creativity_rating'],
            'english_proficiency_rating' => $validated['english_proficiency_rating'],
            'preferred_teaching_language' => $validated['preferred_teaching_language'],

            // Technology and Teaching Methods
            'edtech_opinion' => $validated['edtech_opinion'],
            'needs_phone_while_teaching' => $validated['needs_phone_while_teaching'],
            'phone_usage_reason' => $validated['phone_usage_reason'] ?? null,
            'teaching_difficulty_approach' => $validated['teaching_difficulty_approach'],
            'discipline_approach' => $validated['discipline_approach'],
            'approves_late_fine_reward' => $validated['approves_late_fine_reward'],
            'late_fine_reason' => $validated['late_fine_reason'] ?? null,
            'expected_tenure' => $validated['expected_tenure'],

            // Commitment
            'preferred_workdays' => $validated['preferred_workdays'],
            'preferred_workdays_frequency' => $validated['preferred_workdays_frequency'],
            'preferred_schedule' => $validated['preferred_schedule'],

            // Work Environment Preferences
            'cleanliness_importance_rating' => $validated['cleanliness_importance_rating'],
            'organization_importance_rating' => $validated['organization_importance_rating'],
            'shared_environment_comfort_rating' => $validated['shared_environment_comfort_rating'],
            'teaching_style_preference' => $validated['teaching_style_preference'],
            'ok_with_team_meetings' => $validated['ok_with_team_meetings'],
            'ok_with_parent_meetings' => $validated['ok_with_parent_meetings'],
            'recording_comfort' => $validated['recording_comfort'],
            'ok_with_media_usage' => $validated['ok_with_media_usage'],

            // Final Review
            'subject' => $validated['subject'],
            'document_path' => $documentPath,
            'status' => 'pending',
        ]);

        // Log the application for debugging
        \Log::info('New tutor application submitted', [
            'id' => $application->id,
            'name' => $application->full_name,
            'email' => $application->email,
        ]);

        // Send notification to admin (optional)
        // You can add code here to notify admins about new applications

        return redirect()->back()->with('success', 'Your tutor application has been submitted successfully! We will review it within 2-7 business days.');
    }

    /**
     * Approve a tutor application and send notification
     */
    public function approve(Request $request, TutorApplication $application)
    {
        $this->authorize('update', $application);

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $application->update([
            'status' => 'approved',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Send SMS and in-app notification
        $this->sendApplicationStatusNotification($application, 'approved');

        return redirect()->back()->with('success', 'Tutor application approved! Notification sent.');
    }

    /**
     * Reject a tutor application and send notification
     */
    public function reject(Request $request, TutorApplication $application)
    {
        $this->authorize('update', $application);

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $application->update([
            'status' => 'rejected',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Send SMS and in-app notification
        $this->sendApplicationStatusNotification($application, 'rejected');

        return redirect()->back()->with('success', 'Tutor application rejected! Notification sent.');
    }

    /**
     * Send application status notification via SMS and in-app
     */
    private function sendApplicationStatusNotification(TutorApplication $application, string $status)
    {
        // Create or get a dummy user for queued notifications (SMS and in-app)
        // If the applicant has an associated user account, we use that
        $user = User::where('email', $application->email)->first();

        if ($user) {
            // Send through notification system
            $user->notify(new TutorApplicationStatusNotification($application, $status));
        } else {
            // Send SMS directly if no user account
            $smsService = app(\App\Services\SmsService::class);
            $messageMap = [
                'approved' => "Hi {$application->full_name}, Congratulations! Your tutor application has been approved. You are now part of our tutor network. Welcome aboard!",
                'rejected' => "Hi {$application->full_name}, Thank you for your interest in our platform. Unfortunately, your tutor application was not approved at this time. Feel free to reapply in the future.",
            ];
            $smsService->send($application->phone, $messageMap[$status] ?? 'Your application status has been updated.');
        }
    }
}
