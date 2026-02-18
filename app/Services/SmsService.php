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
     * Send SMS using PhilSMS API v3
     *
     * @param string|array $phoneNumber Single number or array of numbers
     * @param string $message The SMS message content
     * @return bool Whether the SMS was sent successfully
     */
    public function send($phoneNumber, string $message): bool
    {
        try {
            if (!$this->apiKey) {
                Log::error('PhilSMS API key not configured');
                return false;
            }

            // Convert array to comma-separated string if needed
            if (is_array($phoneNumber)) {
                $recipients = implode(',', $phoneNumber);
            } else {
                $recipients = $phoneNumber;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($this->apiUrl . '/sms/send', [  // Fixed endpoint
                'recipient' => $recipients,        // Fixed field name
                'message' => $message,
                'sender_id' => $this->senderId,
                'type' => 'plain',                  // Added required field
            ]);

            if ($response->successful()) {
                Log::info('SMS sent successfully', [
                    'phone' => $recipients,
                    'message_length' => strlen($message),
                    'response' => $response->json(),
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

    /**
     * Create or update a contact in PhilSMS
     *
     * @param string $groupId Contact group ID
     * @param array $contactData Contact information (phone, first_name, last_name)
     * @return array|null Created/updated contact data
     */
    public function createContact(string $groupId, array $contactData): ?array
    {
        try {
            if (!$this->apiKey) {
                Log::error('PhilSMS API key not configured');
                return null;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($this->apiUrl . "/contacts/{$groupId}/store", $contactData);

            if ($response->successful()) {
                Log::info('Contact created successfully', ['group_id' => $groupId]);
                return $response->json()['data'] ?? null;
            }

            $error = $response->json()['message'] ?? 'Unknown error';
            Log::error('Contact creation failed', [
                'group_id' => $groupId,
                'error' => $error,
                'response' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('SMS contact creation exception', [
                'group_id' => $groupId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Delete a contact from PhilSMS
     *
     * @param string $groupId Contact group ID
     * @param string $contactId Contact UID
     * @return bool Whether the contact was deleted successfully
     */
    public function deleteContact(string $groupId, string $contactId): bool
    {
        try {
            if (!$this->apiKey) {
                Log::error('PhilSMS API key not configured');
                return false;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->delete($this->apiUrl . "/contacts/{$groupId}/delete/{$contactId}");

            if ($response->successful()) {
                Log::info('Contact deleted successfully', [
                    'group_id' => $groupId,
                    'contact_id' => $contactId,
                ]);
                return true;
            }

            $error = $response->json()['message'] ?? 'Unknown error';
            Log::error('Contact deletion failed', [
                'error' => $error,
                'response' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('SMS contact deletion exception', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
