<?php

namespace App\Channels;

use App\Services\SmsService;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class SmsChannel
{
    protected SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Send the given notification.
     */
    public function send($notifiable, Notification $notification): void
    {
        // Check if the notification has a toSms method
        if (! method_exists($notification, 'toSms')) {
            Log::warning('Notification does not have toSms method', [
                'notification' => get_class($notification)
            ]);
            return;
        }

        // Get the phone number from the notifiable
        $phoneNumber = $notifiable->phone_number ?? $notifiable->phone ?? null;

        if (!$phoneNumber) {
            Log::warning('Notifiable has no phone number', [
                'notifiable' => get_class($notifiable),
                'id' => $notifiable->id ?? null
            ]);
            return;
        }

        // Get the SMS message from the notification
        $message = $notification->toSms($notifiable);

        if (!$message) {
            Log::warning('Notification returned empty SMS message');
            return;
        }

        // Send the SMS
        $success = $this->smsService->send($phoneNumber, $message);

        if (!$success) {
            Log::error('Failed to send SMS notification', [
                'phone' => $phoneNumber,
                'notification' => get_class($notification)
            ]);
        }
    }
}
