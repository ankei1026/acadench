<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

abstract class BaseSmsNotification extends Notification
{
    use Queueable;

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database']; // Always send to database

        // Add SMS if the notifiable has a phone number
        if (!empty($notifiable->phone_number) || !empty($notifiable->phone)) {
            $channels[] = 'sms';
        }

        return $channels;
    }

    /**
     * Get the SMS representation of the notification.
     */
    abstract public function toSms(object $notifiable): string;

    /**
     * Get the array representation of the notification.
     */
    abstract public function toArray(object $notifiable): array;
}
