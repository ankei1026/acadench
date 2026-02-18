<?php

namespace App\Notifications;

use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SmsNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public string $message,
        public ?string $title = null,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Only return SMS channel if API key is configured
        if (! config('services.philsms.api_key')) {
            return [];
        }

        return ['sms'];
    }

    /**
     * Send SMS notification
     */
    public function toSms(object $notifiable): void
    {
        if (! method_exists($notifiable, 'routeNotificationForSms')) {
            return;
        }

        $phoneNumber = $notifiable->routeNotificationForSms();
        if (! $phoneNumber) {
            return;
        }

        $smsService = app(SmsService::class);
        $smsService->send($phoneNumber, $this->message);
    }
}
