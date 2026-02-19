<?php

namespace App\Http\Controllers;

use App\Models\Lecture;
use App\Models\Booking;
use App\Models\Program;
use App\Models\Tutor;
use App\Notifications\InAppNotification;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminLecturesController extends Controller
{
    protected SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    public function index()
    {
        $lectures = Lecture::with(['program', 'booking.learner', 'booking.parent', 'booking.tutor.user'])
            ->where('is_active', true)
            ->whereHas('booking', function ($query) {
                // Include lectures for bookings that are either processing or active
                $query->whereIn('booking_status', ['processing', 'active']);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Lecture $lecture) {
                return [
                    'lecture_id' => $lecture->lecture_id,
                    'name' => $lecture->name,
                    'platform' => $lecture->platform,
                    'platform_link' => $lecture->platform_link,
                    'created_at' => $lecture->created_at?->format('Y-m-d H:i:s'),
                    'program' => $lecture->program ? [
                        'prog_id' => $lecture->program->prog_id,
                        'name' => $lecture->program->name,
                        'prog_type' => $lecture->program->prog_type,
                        'setting' => $lecture->program->setting ?? null,
                        'start_time' => $lecture->program->start_time?->format('H:i'),
                        'end_time' => $lecture->program->end_time?->format('H:i'),
                        'days' => $lecture->program->days,
                    ] : null,
                    'booking' => $lecture->booking ? [
                        'book_id' => $lecture->booking->book_id,
                        'book_date' => $lecture->booking->book_date?->format('Y-m-d'),
                        'session_count' => $lecture->booking->session_count,
                        'notes' => $lecture->booking->notes,
                        'learner' => $lecture->booking->learner ? [
                            'learner_id' => $lecture->booking->learner->learner_id,
                            'name' => $lecture->booking->learner->name,
                            'nickname' => $lecture->booking->learner->nickname,
                            'photo' => $lecture->booking->learner->photo
                                ? asset('storage/' . $lecture->booking->learner->photo)
                                : null,
                        ] : null,
                        'parent' => $lecture->booking->parent ? [
                            'name' => $lecture->booking->parent->name,
                        ] : null,
                        'tutor' => $lecture->booking->tutor ? [
                            'tutor_id' => $lecture->booking->tutor->tutor_id,
                            'name' => $lecture->booking->tutor->user?->name ?? null,
                        ] : null,
                    ] : null,
                ];
            });

        // Get available bookings without lectures for the create form
        $availableBookings = Booking::with(['program', 'learner', 'parent'])
            ->where('status', 'approved')
            ->where('payment_status', 'paid')
            ->where('booking_status', 'active')
            ->whereDoesntHave('lectures')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function (Booking $booking) {
                return [
                    'book_id' => $booking->book_id,
                    'setting' => $booking->program?->setting ?? 'online',
                    'program_name' => $booking->program?->name ?? 'N/A',
                    'learner_name' => $booking->learner?->name ?? 'N/A',
                    'parent_name' => $booking->parent?->name ?? 'N/A',
                    'book_date' => $booking->book_date?->format('Y-m-d'),
                    'session_count' => $booking->session_count,
                    'notes' => $booking->notes,
                ];
            });

        // Get available tutors for assignment
        $tutors = Tutor::with('user')
            ->where('status', 'active')
            ->get()
            ->map(function (Tutor $tutor) {
                return [
                    'tutor_id' => $tutor->tutor_id,
                    'name' => $tutor->user?->name ?? 'Unknown',
                    'number' => $tutor->number,
                ];
            });

        return Inertia::render('Admin/Lectures/Index', [
            'lectures' => $lectures,
            'available_bookings' => $availableBookings,
            'available_tutors' => $tutors,
        ]);
    }

    /**
     * Send SMS notification to tutor
     */
    private function sendTutorSms($tutor, $lectureName, $bookingId)
    {
        try {
            if (!$tutor || !$tutor->user) {
                Log::warning('Tutor or user not found for SMS', ['tutor' => $tutor]);
                return;
            }

            $phoneNumbers = [];
            $user = $tutor->user;

            // Get phone from user
            $userPhone = $user->routeNotificationForSms();
            if (!empty($userPhone)) {
                $phoneNumbers[] = $userPhone;
            }

            // Get phone from tutor's direct number
            if (!empty($tutor->number)) {
                $phoneNumbers[] = $tutor->number;
            }

            if (empty($phoneNumbers)) {
                Log::warning('No phone numbers found for tutor', [
                    'tutor_id' => $tutor->tutor_id,
                    'user_id' => $user->id
                ]);
                return;
            }

            $smsMessage = "ACADENCH + SORAYA LEARNING HUB - New Lecture Assignment\n" .
                         "You have been assigned to teach \"{$lectureName}\" (Booking ID: {$bookingId}).\n" .
                         "Please check your dashboard.";

            // Send to all collected numbers
            $this->smsService->send($phoneNumbers, $smsMessage);

            Log::info('Tutor SMS sent successfully', [
                'tutor_id' => $tutor->tutor_id,
                'numbers' => $phoneNumbers
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send tutor SMS', [
                'tutor_id' => $tutor->tutor_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function store(Request $request)
    {
        // First, get the booking to check program type
        $booking = Booking::with('program')->where('book_id', $request->book_id)->first();
        if (!$booking) {
            return redirect()->back()->withErrors(['error' => 'Booking not found.']);
        }

        $rules = [
            'book_id' => ['required', Rule::exists('bookings', 'book_id')],
            'name' => ['required', 'string', 'max:255'],
            'tutor_id' => ['nullable', Rule::exists('tutors', 'tutor_id')],
        ];

        // Only require platform and platform_link if it's not a hub/onsite program
        $isHub = false;
        if ($booking->program?->setting) {
            $progSetting = strtolower($booking->program->setting);
            $isHub = str_contains($progSetting, 'hub') || str_contains($progSetting, 'onsite');
        }

        if (! $isHub) {
            $rules['platform'] = ['required', 'string', 'max:100'];
            $rules['platform_link'] = ['required', 'url', 'max:500'];
        } else {
            $rules['platform'] = ['nullable', 'string', 'max:100'];
            $rules['platform_link'] = ['nullable', 'url', 'max:500'];
        }

        $validated = $request->validate($rules);

        // Check if lecture already exists for this booking
        if (Lecture::where('book_id', $validated['book_id'])->exists()) {
            return redirect()->back()->withErrors(['error' => 'A lecture already exists for this booking.']);
        }

        // Update booking with tutor if provided
        if (!empty($validated['tutor_id'])) {
            $booking->update(['tutor_id' => $validated['tutor_id']]);

            // Notify tutor (in-app + SMS)
            try {
                $tutor = Tutor::where('tutor_id', $validated['tutor_id'])->with('user')->first();
                $user = $tutor?->user ?? null;

                if ($user) {
                    // In-app notification
                    $user->notify(new InAppNotification(
                        title: 'New Lecture Assigned',
                        message: 'You have been assigned to teach "' . $validated['name'] . '" (Booking: ' . $booking->book_id . ').',
                        type: 'info'
                    ));

                    // SMS notification using helper method
                    $this->sendTutorSms($tutor, $validated['name'], $booking->book_id);
                }
            } catch (\Exception $e) {
                Log::error('Failed to notify tutor on lecture create', [
                    'tutor_id' => $validated['tutor_id'],
                    'error' => $e->getMessage()
                ]);
            }
        }

        Lecture::create([
            'name' => $validated['name'],
            'platform' => $validated['platform'] ?? null,
            'platform_link' => $validated['platform_link'] ?? null,
            'prog_id' => $booking->prog_id,
            'book_id' => $validated['book_id'],
        ]);

        Log::info('Lecture created by admin', [
            'lecture_name' => $validated['name'],
            'book_id' => $validated['book_id'],
        ]);

        return redirect()->back()->with('success', 'Lecture created successfully.');
    }

    public function update(Request $request, Lecture $lecture)
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'tutor_id' => ['nullable', Rule::exists('tutors', 'tutor_id')],
        ];

        // Only require platform and platform_link if it's not a hub/onsite program
        $isHub = false;
        if ($lecture->program?->setting) {
            $progSetting = strtolower($lecture->program->setting);
            $isHub = str_contains($progSetting, 'hub') || str_contains($progSetting, 'onsite');
        }

        if (! $isHub) {
            $rules['platform'] = ['required', 'string', 'max:100'];
            $rules['platform_link'] = ['required', 'url', 'max:500'];
        } else {
            $rules['platform'] = ['nullable', 'string', 'max:100'];
            $rules['platform_link'] = ['nullable', 'url', 'max:500'];
        }

        $validated = $request->validate($rules);

        // Update tutor if provided
        if (isset($validated['tutor_id'])) {
            if ($lecture->booking) {
                $lecture->booking->update(['tutor_id' => $validated['tutor_id']]);

                // Notify tutor (in-app + SMS) when changed via lecture update
                try {
                    $tutor = Tutor::where('tutor_id', $validated['tutor_id'])->with('user')->first();
                    $user = $tutor?->user ?? null;

                    if ($user) {
                        $user->notify(new InAppNotification(
                            title: 'Lecture Assignment Updated',
                            message: 'You have been assigned to teach "' . $lecture->name . '" (Booking: ' . $lecture->book_id . ').',
                            type: 'info'
                        ));

                        // SMS notification using helper method
                        $this->sendTutorSms($tutor, $lecture->name, $lecture->book_id);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to notify tutor on lecture update', [
                        'tutor_id' => $validated['tutor_id'],
                        'error' => $e->getMessage()
                    ]);
                }
            }
            unset($validated['tutor_id']);
        }

        $lecture->update($validated);

        Log::info('Lecture updated by admin', [
            'lecture_id' => $lecture->lecture_id,
        ]);

        return redirect()->back()->with('success', 'Lecture updated successfully.');
    }

    public function destroy(Lecture $lecture)
    {
        $lectureName = $lecture->name;
        $lecture->delete();

        Log::info('Lecture deleted by admin', [
            'lecture_name' => $lectureName,
        ]);

        return redirect()->back()->with('success', 'Lecture deleted successfully.');
    }
}
