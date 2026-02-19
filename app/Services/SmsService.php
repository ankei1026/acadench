<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected string $apiUrl;
    protected string $apiKey;
    protected string $senderId;

    public function __construct()
    {
        $this->apiUrl = config('services.philsms.url', 'https://dashboard.philsms.com/api/v3');
        $this->apiKey = config('services.philsms.api_key');
        $this->senderId = config('services.philsms.sender_id', 'PhilSMS');
    }

    /**
     * Format Philippine phone number to international format
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Remove any non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If it starts with 0, replace with 63
        if (str_starts_with($phone, '0')) {
            $phone = '63' . substr($phone, 1);
        }

        // If it doesn't start with 63, add it
        if (!str_starts_with($phone, '63')) {
            $phone = '63' . $phone;
        }

        return $phone;
    }

    /**
     * Send SMS using PhilSMS API v3
     *
     * @param string|array $phoneNumber Single number or array of numbers
     * @param string $message The SMS message content
     * @param string|array|null $additionalNumbers Additional numbers to send to
     * @return bool Whether the SMS was sent successfully
     */
    public function send($phoneNumber, string $message, $additionalNumbers = null): bool
    {
        try {
            if (!$this->apiKey) {
                Log::error('PhilSMS API key not configured');
                return false;
            }

            // Collect all numbers
            $allNumbers = [];

            // Add primary number(s)
            if (is_array($phoneNumber)) {
                $allNumbers = array_merge($allNumbers, $phoneNumber);
            } else {
                $allNumbers[] = $phoneNumber;
            }

            // Add additional numbers
            if ($additionalNumbers) {
                if (is_array($additionalNumbers)) {
                    $allNumbers = array_merge($allNumbers, $additionalNumbers);
                } else {
                    $allNumbers[] = $additionalNumbers;
                }
            }

            // Format all phone numbers
            $formattedNumbers = array_map([$this, 'formatPhoneNumber'], array_filter($allNumbers));

            if (empty($formattedNumbers)) {
                Log::error('No valid phone numbers provided');
                return false;
            }

            $recipients = implode(',', array_unique($formattedNumbers));

            Log::info('Sending SMS to formatted numbers', [
                'original' => $allNumbers,
                'formatted' => $recipients
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($this->apiUrl . '/sms/send', [
                'recipient' => $recipients,
                'message' => $message,
                'sender_id' => $this->senderId,
                'type' => 'plain',
            ]);

            if ($response->successful()) {
                Log::info('SMS sent successfully', [
                    'phone' => $recipients,
                    'message_length' => strlen($message),
                ]);
                return true;
            }

            $error = $response->json()['message'] ?? 'Unknown error';
            Log::error('SMS sending failed', [
                'phone' => $recipients,
                'error' => $error,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('SMS service exception', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send SMS to multiple numbers (alias for send method)
     */
    public function sendBulk(array $numbers, string $message): bool
    {
        return $this->send($numbers, $message);
    }
}
