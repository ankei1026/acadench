<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Lecture;
use App\Models\Tutor;
use App\Notifications\InAppNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminBookingController extends Controller
{
    public function index(Request $request)
    {
        $bookingsQuery = Booking::with(['parent', 'learner', 'program', 'tutor.user', 'receipts'])
            ->orderBy('created_at', 'desc')
        ;

        $bookings = $bookingsQuery->get()->map(function ($booking) {
            $bookingData = $booking->toArray();
            $bookingData['total_paid'] = $booking->receipts->sum('amount');
            $bookingData['remaining_balance'] = max(0, $booking->amount - $booking->receipts->sum('amount'));
            $bookingData['receipt_count'] = $booking->receipts->count();
            if ($booking->tutor) {
                $bookingData['tutor'] = [
                    'tutor_id' => $booking->tutor->tutor_id,
                    'name' => $booking->tutor->user?->name ?? null,
                ];
            }
            return $bookingData;
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
                // Set lecture is_active to false when booking is declined
                Lecture::where('book_id', $booking->book_id)->update(['is_active' => false]);

                // Notify parent of booking rejection
                $booking->parent->notify(new InAppNotification(
                    title: 'Booking Declined',
                    message: 'Your booking for ' . $booking->program?->name . ' has been declined. Reason: ' . $request->decline_reason,
                    type: 'warning'
                ));
            } elseif ($request->status === 'approved') {
                // Notify parent of booking approval
                $booking->parent->notify(new InAppNotification(
                    title: 'Booking Approved!',
                    message: 'Your booking for ' . $booking->program?->name . ' has been approved!',
                    type: 'success'
                ));

                // Notify assigned tutor(s) about the lectures
                if ($booking->tutor) {
                    $lectures = Lecture::where('book_id', $booking->book_id)->get();
                    foreach ($lectures as $lecture) {
                        $booking->tutor->user->notify(new InAppNotification(
                            title: 'New Lecture Assignment',
                            message: 'You have been assigned to teach "' . $lecture->name . '" (' . $booking->learner?->name . ')',
                            type: 'info'
                        ));
                    }
                }
            }
        }

        // Handle booking status update if provided
        if ($request->has('booking_status') && $request->booking_status) {
            $booking->booking_status = $request->booking_status;

            // Set lecture is_active to false if booking is completed
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

        return back()->with('success', 'Tutor assigned successfully');
    }
}
