<?php

namespace App\Notifications;

use App\Models\TutorApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TutorApplicationStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $applicationId;
    protected $applicantName;
    protected $status;
    protected $applicantPhone;

    /**
     * Create a new notification instance.
     */
    public function __construct(TutorApplication $application, string $status)
    {
        // Store only scalar values, not the entire model
        $this->applicationId = $application->id;
        $this->applicantName = $application->full_name;
        $this->status = $status;
        $this->applicantPhone = $application->phone;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Add SMS if phone number exists
        if (!empty($notifiable->phone_number) || !empty($this->applicantPhone)) {
            $channels[] = 'sms';
        }

        return $channels;
    }

    /**
     * Get the SMS representation of the notification.
     */
    public function toSms(object $notifiable): string
    {
        if ($this->status === 'approved') {
            return "Hi {$this->applicantName}! Your tutor application has been APPROVED! You can now log in to your account. Welcome to Soraya Learning Hub!";
        } else {
            return "Hi {$this->applicantName}, Thank you for your interest in Soraya Learning Hub. Unfortunately, your tutor application was not approved at this time. You may reapply in the future.";
        }
    }

    /**
     * Get the array representation of the notification for database storage.
     */
    public function toArray(object $notifiable): array
    {
        $message = $this->status === 'approved'
            ? 'Your tutor application has been approved!'
            : 'Your tutor application was not approved.';

        $actionText = $this->status === 'approved'
            ? 'Login to your account'
            : 'View Application';

        return [
            'application_id' => $this->applicationId,
            'status' => $this->status,
            'message' => $message,
            'action_text' => $actionText,
            'action_url' => $this->status === 'approved'
                ? '/login'
                : '/tutor-applications/' . $this->applicationId,
            'icon' => $this->status === 'approved' ? 'check-circle' : 'x-circle',
            'color' => $this->status === 'approved' ? 'green' : 'red',
        ];
    }

    /**
     * Determine which queues should be used for each channel.
     */
    public function viaQueues(): array
    {
        return [
            'database' => 'notifications',
            'sms' => 'sms',
        ];
    }
}
