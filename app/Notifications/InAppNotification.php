<?php

namespace App\Notifications;

use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InAppNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public string $title,
        public string $message,
        public ?string $type = null,
        public bool $sendSms = false,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if ($this->sendSms && config('services.philsms.api_key')) {
            $channels[] = 'sms';
        }

        return $channels;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type ?? 'info',
        ];
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
