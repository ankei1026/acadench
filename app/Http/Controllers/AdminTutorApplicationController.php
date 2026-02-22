<?php

namespace App\Http\Controllers;

use App\Models\Tutor;
use App\Models\TutorApplication;
use App\Models\User;
use App\Notifications\TutorApplicationStatusNotification;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AdminTutorApplicationController extends Controller
{
    protected SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    public function index()
    {
        $applications = TutorApplication::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($app) => [
                'id' => $app->id,
                'full_name' => $app->full_name,
                'email' => $app->email,
                'phone' => $app->phone,
                'subject' => $app->subject,
                'document_path' => $app->document_path,
                'status' => $app->status,
                'created_at' => $app->created_at?->format('Y-m-d H:i:s'),
                'formatted_date' => $app->created_at?->diffForHumans(),
            ]);

        return Inertia::render('Admin/TutorApplication/Index', [
            'applications' => $applications,
        ]);
    }

    public function show($id)
    {
        $application = TutorApplication::findOrFail($id);

        return Inertia::render('Admin/TutorApplication/Show', [
            'application' => [
                // Personal Information
                'id' => $application->id,
                'full_name' => $application->full_name,
                'email' => $application->email,
                'phone' => $application->phone,
                'birthdate' => $application->birthdate?->format('Y-m-d'),
                'age' => $application->age,
                'gender' => $application->gender,
                'home_address' => $application->home_address,
                'contact_number' => $application->contact_number,
                'facebook_link' => $application->facebook_link,
                'mother_name' => $application->mother_name,
                'father_name' => $application->father_name,
                'living_status' => $application->living_status,

                // Educational Background
                'high_school' => $application->high_school,
                'college_school' => $application->college_school,
                'college_course' => $application->college_course,
                'is_licensed_teacher' => $application->is_licensed_teacher,
                'license_date' => $application->license_date?->format('Y-m-d'),

                // Teaching Experience
                'employment_status' => $application->employment_status,
                'current_employer' => $application->current_employer,
                'working_hours' => $application->working_hours,
                'tutoring_experience_levels' => $application->tutoring_experience_levels ?? [],
                'tutoring_experience_duration' => $application->tutoring_experience_duration,
                'has_school_teaching_experience' => $application->has_school_teaching_experience,
                'school_teaching_experience_duration' => $application->school_teaching_experience_duration,
                'previous_clients' => $application->previous_clients,

                // Preferences and Skills
                'favorite_subject_to_teach' => $application->favorite_subject_to_teach,
                'easiest_subject_to_teach' => $application->easiest_subject_to_teach,
                'most_difficult_subject_to_teach' => $application->most_difficult_subject_to_teach,
                'easier_school_level_to_teach' => $application->easier_school_level_to_teach,
                'harder_school_level_to_teach' => $application->harder_school_level_to_teach,
                'reasons_love_teaching' => $application->reasons_love_teaching ?? [],
                'work_preference' => $application->work_preference,
                'class_size_preference' => $application->class_size_preference,
                'teaching_values' => $application->teaching_values ?? [],
                'application_reasons' => $application->application_reasons ?? [],
                'outside_activities' => $application->outside_activities ?? [],

                // Logistics
                'distance_from_hub_minutes' => $application->distance_from_hub_minutes ?? 0,
                'distance_from_work_minutes' => $application->distance_from_work_minutes ?? 0,
                'transportation_mode' => $application->transportation_mode,

                // Ratings and Preferences
                'enjoy_playing_with_kids_rating' => $application->enjoy_playing_with_kids_rating ?? 0,
                'preferred_toys_games' => $application->preferred_toys_games ?? [],
                'annoyances' => $application->annoyances ?? [],
                'need_job_rating' => $application->need_job_rating ?? 0,
                'public_speaking_rating' => $application->public_speaking_rating ?? 0,
                'penmanship_rating' => $application->penmanship_rating ?? 0,
                'creativity_rating' => $application->creativity_rating ?? 0,
                'english_proficiency_rating' => $application->english_proficiency_rating ?? 0,
                // Valid values: 'English', 'Filipino', 'Both' (meaning both English and Filipino)
                'preferred_teaching_language' => $application->preferred_teaching_language,

                // Technology and Teaching Methods
                'edtech_opinion' => $application->edtech_opinion,
                'needs_phone_while_teaching' => $application->needs_phone_while_teaching,
                'phone_usage_reason' => $application->phone_usage_reason,
                'teaching_difficulty_approach' => $application->teaching_difficulty_approach,
                'discipline_approach' => $application->discipline_approach,
                'approves_late_fine_reward' => $application->approves_late_fine_reward,
                'late_fine_reason' => $application->late_fine_reason,
                'expected_tenure' => $application->expected_tenure,

                // Commitment
                'preferred_workdays' => $application->preferred_workdays ?? [],
                'preferred_workdays_frequency' => $application->preferred_workdays_frequency,
                'preferred_schedule' => $application->preferred_schedule,

                // Work Environment Preferences
                'cleanliness_importance_rating' => $application->cleanliness_importance_rating ?? 0,
                'organization_importance_rating' => $application->organization_importance_rating ?? 0,
                'shared_environment_comfort_rating' => $application->shared_environment_comfort_rating ?? 0,
                'teaching_style_preference' => $application->teaching_style_preference,
                'ok_with_team_meetings' => $application->ok_with_team_meetings,
                'ok_with_parent_meetings' => $application->ok_with_parent_meetings,
                'recording_comfort' => $application->recording_comfort,
                'ok_with_media_usage' => $application->ok_with_media_usage,

                // Final Review
                'subject' => $application->subject,
                'document_path' => $application->document_path,
                'document_url' => $application->document_path
                    ? asset('storage/' . $application->document_path)
                    : null,
                'status' => $application->status,
                'notes' => $application->notes,
                'created_at' => $application->created_at?->format('Y-m-d H:i:s'),
                'formatted_date' => $application->created_at?->diffForHumans(),
            ],
        ]);
    }

    public function approve($id)
    {
        try {
            $application = TutorApplication::findOrFail($id);

            // Check if already approved
            if ($application->status === 'approved') {
                return back()->with('warning', 'Application is already approved.');
            }

            // Check if user already exists
            $user = User::where('email', $application->email)->first();
            $isNewUser = false;

            if (!$user) {
                // Generate secure random password
                $temporaryPassword = Str::random(12);

                // Create User
                $user = User::create([
                    'name' => $application->full_name,
                    'email' => $application->email,
                    'password' => bcrypt($temporaryPassword),
                    'role' => 'tutor',
                    'email_verified_at' => now(),
                ]);

                $isNewUser = true;

                // Create Tutor profile with ALL application fields
                $tutorData = [
                    'user_id' => $user->id,
                    'subject' => $application->subject ?? 'General',
                    'specializations' => $application->message,
                    'status' => 'active', // Set to active instead of inactive
                    'number' => $application->phone,

                    // Personal Information
                    'full_name' => $application->full_name,
                    'email' => $application->email,
                    'birthdate' => $application->birthdate,
                    'age' => $application->age,
                    'gender' => $application->gender,
                    'home_address' => $application->home_address,
                    'facebook_link' => $application->facebook_link,
                    'mother_name' => $application->mother_name,
                    'father_name' => $application->father_name,
                    'living_status' => $application->living_status,

                    // Educational Background
                    'high_school' => $application->high_school,
                    'college_school' => $application->college_school,
                    'college_course' => $application->college_course,
                    'is_licensed_teacher' => $application->is_licensed_teacher,
                    'license_date' => $application->license_date,

                    // Teaching Experience
                    'employment_status' => $application->employment_status,
                    'current_employer' => $application->current_employer,
                    'working_hours' => $application->working_hours,
                    'tutoring_experience_levels' => $application->tutoring_experience_levels,
                    'tutoring_experience_duration' => $application->tutoring_experience_duration,
                    'has_school_teaching_experience' => $application->has_school_teaching_experience,
                    'school_teaching_experience_duration' => $application->school_teaching_experience_duration,
                    'previous_clients' => $application->previous_clients,

                    // Preferences and Skills
                    'favorite_subject_to_teach' => $application->favorite_subject_to_teach,
                    'easiest_subject_to_teach' => $application->easiest_subject_to_teach,
                    'most_difficult_subject_to_teach' => $application->most_difficult_subject_to_teach,
                    'easier_school_level_to_teach' => $application->easier_school_level_to_teach,
                    'harder_school_level_to_teach' => $application->harder_school_level_to_teach,
                    'reasons_love_teaching' => $application->reasons_love_teaching,
                    'work_preference' => $application->work_preference,
                    'class_size_preference' => $application->class_size_preference,
                    'teaching_values' => $application->teaching_values,
                    'application_reasons' => $application->application_reasons,
                    'outside_activities' => $application->outside_activities,

                    // Logistics
                    'distance_from_hub_minutes' => $application->distance_from_hub_minutes,
                    'distance_from_work_minutes' => $application->distance_from_work_minutes,
                    'transportation_mode' => $application->transportation_mode,

                    // Ratings and Preferences
                    'enjoy_playing_with_kids_rating' => $application->enjoy_playing_with_kids_rating,
                    'preferred_toys_games' => $application->preferred_toys_games,
                    'annoyances' => $application->annoyances,
                    'need_job_rating' => $application->need_job_rating,
                    'public_speaking_rating' => $application->public_speaking_rating,
                    'penmanship_rating' => $application->penmanship_rating,
                    'creativity_rating' => $application->creativity_rating,
                    'english_proficiency_rating' => $application->english_proficiency_rating,
                    'preferred_teaching_language' => $application->preferred_teaching_language,

                    // Technology and Teaching Methods
                    'edtech_opinion' => $application->edtech_opinion,
                    'needs_phone_while_teaching' => $application->needs_phone_while_teaching,
                    'phone_usage_reason' => $application->phone_usage_reason,
                    'teaching_difficulty_approach' => $application->teaching_difficulty_approach,
                    'discipline_approach' => $application->discipline_approach,
                    'approves_late_fine_reward' => $application->approves_late_fine_reward,
                    'late_fine_reason' => $application->late_fine_reason,
                    'expected_tenure' => $application->expected_tenure,

                    // Commitment
                    'preferred_workdays' => $application->preferred_workdays,
                    'preferred_workdays_frequency' => $application->preferred_workdays_frequency,
                    'preferred_schedule' => $application->preferred_schedule,

                    // Work Environment Preferences
                    'cleanliness_importance_rating' => $application->cleanliness_importance_rating,
                    'organization_importance_rating' => $application->organization_importance_rating,
                    'shared_environment_comfort_rating' => $application->shared_environment_comfort_rating,
                    'teaching_style_preference' => $application->teaching_style_preference,
                    'ok_with_team_meetings' => $application->ok_with_team_meetings,
                    'ok_with_parent_meetings' => $application->ok_with_parent_meetings,
                    'recording_comfort' => $application->recording_comfort,
                    'ok_with_media_usage' => $application->ok_with_media_usage,
                ];

                Tutor::create($tutorData);

                // Send welcome SMS with credentials
                $this->sendWelcomeSms($application, $temporaryPassword);
            } else {
                // If user already exists, update their tutor profile with application data
                $tutor = Tutor::where('user_id', $user->id)->first();
                if ($tutor) {
                    $tutor->update([
                        'subject' => $application->subject ?? $tutor->subject,
                        'specializations' => $application->message ?? $tutor->specializations,
                        'number' => $application->phone ?? $tutor->number,
                        'status' => 'active',
                        // Add other fields as needed
                    ]);
                }
            }

            // Update application status
            $application->update(['status' => 'approved']);

            // Send status notification (will go through database and SMS channels)
            $user->notify(new TutorApplicationStatusNotification($application, 'approved'));

            $message = $isNewUser
                ? "Application approved! New tutor account created with all application data. Login credentials sent via SMS."
                : "Application approved! Tutor profile updated with application data.";

            return back()->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Failed to approve application', [
                'application_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to approve application: ' . $e->getMessage());
        }
    }

    public function reject($id)
    {
        try {
            $application = TutorApplication::findOrFail($id);

            // Check if already rejected
            if ($application->status === 'rejected') {
                return back()->with('warning', 'Application is already rejected.');
            }

            $application->update(['status' => 'rejected']);

            // Check if user exists and send notification
            $user = User::where('email', $application->email)->first();

            if ($user) {
                // Send through notification system
                $user->notify(new TutorApplicationStatusNotification($application, 'rejected'));
            } else {
                // Send SMS directly if no user account
                $message = "Hi {$application->full_name}, Thank you for your interest in Soraya Learning Hub. Unfortunately, your tutor application was not approved at this time. Feel free to reapply in the future with additional qualifications.";

                $this->smsService->send($application->phone, $message);
            }

            return back()->with('info', "Application from {$application->full_name} has been rejected. Notification sent.");

        } catch (\Exception $e) {
            Log::error('Failed to reject application', [
                'application_id' => $id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to reject application: ' . $e->getMessage());
        }
    }

    /**
     * Send welcome SMS with login credentials
     */
    private function sendWelcomeSms(TutorApplication $application, string $password): void
    {
        $message = "Welcome to Soraya Learning Hub, {$application->full_name}!\n\n" .
                  "Your tutor application has been approved!\n\n" .
                  "Login credentials:\n" .
                  "Email: {$application->email}\n" .
                  "Password: {$password}\n\n" .
                  "Login here: " . url('/login') . "\n\n" .
                  "Please change your password after logging in.\n\n" .
                  "We're excited to have you on board!";

        $this->smsService->send($application->phone, $message);
    }

    public function downloadDocument($id)
    {
        try {
            $application = TutorApplication::findOrFail($id);

            if (!$application->document_path) {
                return back()->with('error', 'No document found for this application.');
            }

            if (!Storage::disk('public')->exists($application->document_path)) {
                return back()->with('error', 'Document file not found on server.');
            }

            $filename = $application->full_name . '_document_' . $application->id . '.' .
                       pathinfo($application->document_path, PATHINFO_EXTENSION);

            return Storage::disk('public')->download(
                $application->document_path,
                $filename
            );

        } catch (\Exception $e) {
            Log::error('Failed to download document', [
                'application_id' => $id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to download document: ' . $e->getMessage());
        }
    }

    /**
     * Send bulk SMS to all applicants (optional feature)
     */
    public function sendBulkSms(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'status_filter' => 'nullable|in:pending,approved,rejected'
        ]);

        try {
            $query = TutorApplication::query();

            if ($request->status_filter) {
                $query->where('status', $request->status_filter);
            }

            $applications = $query->get();
            $phoneNumbers = $applications->pluck('phone')->filter()->toArray();

            if (empty($phoneNumbers)) {
                return back()->with('error', 'No phone numbers found for the selected filter.');
            }

            $success = $this->smsService->sendBulk($phoneNumbers, $request->message);

            if ($success) {
                return back()->with('success', "SMS sent to " . count($phoneNumbers) . " applicants.");
            } else {
                return back()->with('error', 'Failed to send bulk SMS.');
            }

        } catch (\Exception $e) {
            Log::error('Failed to send bulk SMS', [
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to send bulk SMS: ' . $e->getMessage());
        }
    }
}
