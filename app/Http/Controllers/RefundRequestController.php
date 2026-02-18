<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\RefundRequest;
use App\Models\User;
use App\Notifications\InAppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RefundRequestController extends Controller
{
    /**
     * Show the refund request form with eligible bookings
     */
    public function index()
    {
        $bookings = Booking::with(['program', 'learner', 'tutor.user', 'receipts'])
            ->where('parent_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Booking $booking) {
                $totalPaid = $booking->receipts->sum('amount');
                $remainingBalance = max(0, $booking->amount - $totalPaid);

                return [
                    'book_id' => $booking->book_id,
                    'program' => $booking->program?->name,
                    'learner' => $booking->learner ? [
                        'learner_id' => $booking->learner->learner_id,
                        'name' => $booking->learner->name,
                        'nickname' => $booking->learner->nickname,
                        'photo' => $booking->learner->photo ? asset('storage/' . $booking->learner->photo) : null,
                    ] : null,
                    'tutor' => $booking->tutor?->user?->name ?? $booking->tutor?->tutor_id,
                    'session_count' => $booking->session_count,
                    'book_date' => $booking->book_date?->format('Y-m-d'),
                    'amount' => $booking->amount,
                    'payment_status' => $booking->payment_status,
                    'booking_status' => $booking->booking_status,
                    'total_paid' => $totalPaid,
                    'remaining_balance' => $remainingBalance,
                ];
            });

        return Inertia::render('Parent/RequestRefund/Index', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Store a new refund request
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'book_id' => ['required', 'string', 'exists:bookings,book_id'],
                'reason' => ['required', 'string', 'min:10', 'max:1000'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        }

        // Check if booking exists and belongs to authenticated user
        $booking = Booking::findOrFail($validated['book_id']);

        if ($booking->parent_id !== Auth::id()) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        // Check if booking start date is in the future
        if (Carbon::parse($booking->book_date)->isPast()) {
            return redirect()->back()->with('error', 'Cannot request refund for bookings that have already started.');
        }

        // Check if booking is not completed or cancelled
        if (in_array($booking->booking_status, ['completed', 'cancelled'])) {
            return redirect()->back()->with('error', 'Cannot request refund for ' . $booking->booking_status . ' bookings.');
        }

        // Check if a refund request already exists for this booking
        $existingRequest = RefundRequest::where('book_id', $booking->book_id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return redirect()->back()->with('error', 'A refund request for this booking is already pending.');
        }

        // Calculate the downpayment (remaining balance if not fully paid, otherwise the amount)
        $totalPaid = $booking->receipts->sum('amount');
        $remainingBalance = max(0, $booking->amount - $totalPaid);
        $refundAmount = $remainingBalance > 0 ? $remainingBalance : $booking->amount;

        // Create the refund request
        RefundRequest::create([
            'book_id' => $booking->book_id,
            'reason' => $validated['reason'],
            'amount' => $refundAmount,
            'status' => 'pending',
        ]);

        // Notify admin about the refund request
        $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new InAppNotification(
                title: 'Refund Request Submitted',
                message: 'A refund request for ₱' . number_format($refundAmount) . ' has been submitted for ' . $booking->program?->name,
                type: 'info'
            ));
        }

        return redirect()->route('parent.request-refund')->with('success', 'Refund request submitted successfully. Our team will review it within 24-48 hours.');
    }

    /**
     * Show all refund requests for the parent
     */
    public function myRequests()
    {
        $refundRequests = RefundRequest::with(['booking' => function ($query) {
            $query->with(['program', 'learner']);
        }])
            ->whereHas('booking', function ($query) {
                $query->where('parent_id', Auth::id());
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (RefundRequest $request) {
                $booking = $request->booking;

                return [
                    'refund_request_id' => $request->refund_request_id,
                    'book_id' => $request->book_id,
                    'reason' => $request->reason,
                    'amount' => $request->amount,
                    'status' => $request->status,
                    'admin_notes' => $request->admin_notes,
                    'created_at' => $request->created_at?->format('Y-m-d H:i:s'),
                    'booking' => [
                        'book_id' => $booking->book_id,
                        'program_name' => $booking->program?->name,
                        'learner_name' => $booking->learner?->name ?? $booking->learner?->nickname,
                        'book_date' => $booking->book_date?->format('Y-m-d'),
                    ],
                ];
            });

        return Inertia::render('Parent/RequestRefund/MyRequests', [
            'refundRequests' => $refundRequests,
        ]);
    }
}
