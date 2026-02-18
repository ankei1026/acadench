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
                'id' => $application->id,
                'full_name' => $application->full_name,
                'email' => $application->email,
                'phone' => $application->phone,
                'subject' => $application->subject,
                'message' => $application->message,
                'document_path' => $application->document_path,
                'document_url' => $application->document_path
                    ? asset('storage/' . $application->document_path)
                    : null,
                'status' => $application->status,
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
                $temporaryPassword = Str::random(12); // Better than hardcoded password

                // Create User
                $user = User::create([
                    'name' => $application->full_name,
                    'email' => $application->email,
                    'phone_number' => $application->phone, // Store phone number
                    'password' => bcrypt($temporaryPassword),
                    'role' => 'tutor',
                    'email_verified_at' => now(),
                ]);

                $isNewUser = true;

                // Create Tutor profile
                Tutor::create([
                    'user_id' => $user->id,
                    'subject' => $application->subject ?? 'General',
                    'specializations' => $application->message, // Store their message as initial bio
                    'status' => 'inactive',
                    'number' => $application->phone,
                ]);

                // Send welcome SMS with credentials
                $this->sendWelcomeSms($application, $temporaryPassword);
            }

            // Update application status
            $application->update(['status' => 'approved']);

            // Send status notification (will go through database and SMS channels)
            $user->notify(new TutorApplicationStatusNotification($application, 'approved'));

            $message = $isNewUser
                ? "Application approved! New tutor account created. Login credentials sent via SMS."
                : "Application approved! Tutor already had an account.";

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
