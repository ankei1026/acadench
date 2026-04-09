<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Lecture;
use App\Models\Tutor;
use App\Models\BookingSession;
use App\Notifications\InAppNotification;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminBookingController extends Controller
{
    protected SmsService $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    public function index(Request $request)
    {

        $bookingsQuery = Booking::with(['parent', 'learner', 'program', 'tutors.user', 'receipts'])
            ->orderBy('created_at', 'desc');

        $bookings = $bookingsQuery->get()->each(function ($booking) {
            $booking->total_paid = $booking->receipts->sum('amount');
            $booking->remaining_balance = max(0, $booking->amount - $booking->receipts->sum('amount'));
            $booking->receipt_count = $booking->receipts->count();
            // Add tutors array for multiple tutors
            $booking->tutors = $booking->tutors->map(function ($tutor) {
                return [
                    'tutor_id' => $tutor->tutor_id,
                    'name' => $tutor->user?->name ?? null,
                ];
            })->values()->all();
            // Expose raw tutor_ids field (cast to array if needed)
            $booking->tutor_ids = is_array($booking->tutor_ids) ? $booking->tutor_ids : (json_decode($booking->tutor_ids, true) ?: []);
        });

        // If a single booking_id is requested, prepare a separate `updated_booking` payload so the
        // frontend can request and merge just the changed booking without replacing the whole list.
        $updatedBooking = null;
        if ($request->has('booking_id')) {
            $single = $bookings->firstWhere('book_id', $request->get('booking_id'));
            if ($single) {
                $updatedBooking = $single;
            }
        }

        // Tutors store profile details on the related users table (via user_id).
        // Join users to get display name from users.name.
        $tutors = Tutor::join('users', 'users.id', '=', 'tutors.user_id')
            ->where('tutors.status', 'active')
            ->orderBy('users.name')
            ->get([
                'tutors.tutor_id as tutor_id',
                'users.name as name',
            ]);

        $props = [
            'bookings' => $bookings,
            'available_tutors' => $tutors,
        ];

        if ($updatedBooking) {
            $props['updated_booking'] = $updatedBooking;
        }

        return Inertia::render('Admin/Bookings/Index', $props);
    }

    public function updateStatus(Request $request, string $bookId)
    {
        $request->validate([
            'status' => 'nullable|in:approved,declined',
            'booking_status' => 'nullable|in:processing,active,completed,cancelled',
            'decline_reason' => 'required_if:status,declined|nullable|string',
        ]);

        $booking = Booking::where('book_id', $bookId)->firstOrFail();

        // Only update approval status if provided
        if ($request->has('status') && $request->status) {
            $booking->status = $request->status;

            if ($request->status === 'declined' && $request->decline_reason) {
                $booking->decline_reason = $request->decline_reason;
                Lecture::where('book_id', $booking->book_id)->update(['is_active' => false]);

                $booking->parent->notify(new InAppNotification(
                    title: 'Booking Declined',
                    message: 'Your booking for ' . $booking->program?->name . ' has been declined. Reason: ' . $request->decline_reason,
                    type: 'warning'
                ));
            } elseif ($request->status === 'approved') {
                $booking->parent->notify(new InAppNotification(
                    title: 'Booking Approved!',
                    message: 'Your booking for ' . $booking->program?->name . ' has been approved!',
                    type: 'success'
                ));

                // Send SMS to learner emergency contact
                try {
                    $phone = $booking->learner?->emergency_contact_primary;
                    if (!empty($phone)) {
                        $smsMessage = 'ACADENCH + SORAYA - Booking Approved: Your booking for "' . ($booking->program?->name ?? 'the program') . '" (Booking ID: ' . $booking->book_id . ") has been approved.\nThank you.";
                        $sent = $this->smsService->send($phone, $smsMessage);
                        Log::info('Booking approval SMS', [
                            'book_id' => $booking->book_id,
                            'phone' => $phone,
                            'sent' => $sent,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to send booking approval SMS', [
                        'book_id' => $booking->book_id,
                        'error' => $e->getMessage(),
                    ]);
                }

                // Create booking sessions for each scheduled day if not already exists
                if ($booking->sessions()->count() === 0) {
                    $program = $booking->program;
                    $days = $program->days;
                    if (!is_array($days)) {
                        $decoded = json_decode($days, true);
                        if (is_array($decoded)) {
                            $days = $decoded;
                        } elseif (is_string($days)) {
                            $days = array_map('trim', explode(',', $days));
                        } else {
                            $days = [];
                        }
                    }

                    // Get tutor IDs from booking
                    $tutorIds = $booking->tutor_ids;
                    if (is_string($tutorIds)) {
                        $tutorIds = json_decode($tutorIds, true) ?? [];
                    }

                    $sessionCount = $booking->session_count;
                    $startDate = $booking->book_date instanceof \Carbon\Carbon ? $booking->book_date->copy() : \Carbon\Carbon::parse($booking->book_date);
                    $sessionsCreated = 0;
                    $currentDate = $startDate->copy();
                    $dayNames = array_map('strtolower', $days);

                    while ($sessionsCreated < $sessionCount) {
                        if (in_array(strtolower($currentDate->format('l')), $dayNames)) {
                            $session = new \App\Models\BookingSession([
                                'session_id' => 'SESS_' . strtoupper(\Illuminate\Support\Str::random(6)),
                                'book_id' => $booking->book_id,
                                'session_date' => $currentDate->toDateString(),
                                'status' => \App\Models\BookingSession::STATUS_PENDING,
                            ]);
                            $session->save();

                            // Attach tutors from booking to this session
                            if (!empty($tutorIds) && is_array($tutorIds)) {
                                $session->tutors()->attach($tutorIds);
                            }

                            $sessionsCreated++;
                        }
                        $currentDate->addDay();
                    }
                }

                // Notify assigned tutor(s) about the lectures
                $tutorIds = $booking->tutor_ids;
                if (is_string($tutorIds)) {
                    $tutorIds = json_decode($tutorIds, true) ?? [];
                }

                if (!empty($tutorIds) && is_array($tutorIds)) {
                    $tutors = Tutor::with('user')->whereIn('tutor_id', $tutorIds)->get();
                    $lectures = Lecture::where('book_id', $booking->book_id)->get();

                    foreach ($tutors as $tutor) {
                        foreach ($lectures as $lecture) {
                            $tutor->user->notify(new InAppNotification(
                                title: 'New Lecture Assignment',
                                message: 'You have been assigned to teach "' . $lecture->name . '" (' . $booking->learner?->name . ')',
                                type: 'info'
                            ));
                        }

                        // Send SMS to tutor
                        try {
                            $phone = $tutor->user->routeNotificationForSms();
                            if (!empty($phone)) {
                                $smsMessage = "ACADENCH + SORAYA LEARNING HUB - New Lecture Assignment\nYou have been assigned to teach for booking ID: {$booking->book_id}. Please check your dashboard.";
                                $this->smsService->send($phone, $smsMessage, $tutor->number ?? null);
                                Log::info('Sent tutor assignment SMS', ['book_id' => $booking->book_id, 'tutor' => $tutor->tutor_id, 'phone' => $phone]);
                            }
                        } catch (\Exception $e) {
                            Log::error('Failed to send tutor assignment SMS', ['book_id' => $booking->book_id, 'error' => $e->getMessage()]);
                        }
                    }
                }
            }
        }

        // Handle booking status update if provided
        if ($request->has('booking_status') && $request->booking_status) {
            $booking->booking_status = $request->booking_status;

            if ($request->booking_status === 'completed') {
                Lecture::where('book_id', $booking->book_id)->update(['is_active' => false]);
            }
        }

        $booking->save();

        return back()->with('success', 'Booking status updated successfully');
    }

    public function assignTutor(Request $request, string $bookId)
    {
        $request->validate([
            'tutor_id' => 'required|string|exists:tutors,tutor_id',
        ]);

        $booking = Booking::where('book_id', $bookId)->firstOrFail();
        $oldTutor = $booking->tutor;
        $booking->tutor_id = $request->tutor_id;
        $booking->save();

        $booking = $booking->fresh('tutor');

        // Notify newly assigned tutor about the lectures
        $lectures = Lecture::where('book_id', $booking->book_id)->get();
        foreach ($lectures as $lecture) {
            $booking->tutor->user->notify(new InAppNotification(
                title: 'New Lecture Assignment',
                message: 'You have been assigned to teach "' . $lecture->name . '" (' . $booking->learner?->name . ')',
                type: 'info'
            ));
        }
        // Send SMS to newly assigned tutor
        try {
            $phone = $booking->tutor->user->routeNotificationForSms();
            if (!empty($phone)) {
                $smsMessage = "ACADENCH + SORAYA LEARNING HUB - New Lecture Assignment\nYou have been assigned to teach for booking ID: {$booking->book_id}. Please check your dashboard.";
                $this->smsService->send($phone, $smsMessage, $booking->tutor->number ?? null);
                Log::info('Sent tutor assignment SMS (assignTutor)', ['book_id' => $booking->book_id, 'tutor' => $booking->tutor->tutor_id, 'phone' => $phone]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send tutor assignment SMS (assignTutor)', ['book_id' => $booking->book_id, 'error' => $e->getMessage()]);
        }

        return back()->with('success', 'Tutor assigned successfully');
    }
}
