<?php

namespace App\Http\Controllers;

use App\Models\RefundRequest;
use App\Notifications\InAppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminRefundRequestController extends Controller
{
    /**
     * Show all refund requests to admin
     */
    public function index()
    {
        $refundRequests = RefundRequest::with(['booking' => function ($query) {
            $query->with(['learner', 'program', 'parent']);
        }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (RefundRequest $request) {
                $booking = $request->booking;
                $totalPaid = $booking->receipts->sum('amount');

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
                        'learner_name' => $booking->learner?->name,
                        'parent_name' => $booking->parent?->name,
                        'parent_email' => $booking->parent?->email,
                        'book_date' => $booking->book_date?->format('Y-m-d'),
                        'total_amount' => $booking->amount,
                        'total_paid' => $totalPaid,
                    ],
                ];
            });

        // Get statistics
        $stats = [
            'total_requests' => RefundRequest::count(),
            'pending_requests' => RefundRequest::where('status', 'pending')->count(),
            'approved_requests' => RefundRequest::where('status', 'approved')->count(),
            'rejected_requests' => RefundRequest::where('status', 'rejected')->count(),
            'total_refunded' => RefundRequest::where('status', 'approved')->sum('amount'),
        ];

        return Inertia::render('Admin/RefundRequests/Index', [
            'refundRequests' => $refundRequests,
            'stats' => $stats,
        ]);
    }

    /**
     * Show single refund request details
     */
    public function show(RefundRequest $refundRequest)
    {
        $booking = $refundRequest->booking()->with(['learner', 'program', 'parent', 'receipts'])->first();
        $totalPaid = $booking->receipts->sum('amount');

        return Inertia::render('Admin/RefundRequests/Show', [
            'refundRequest' => [
                'refund_request_id' => $refundRequest->refund_request_id,
                'book_id' => $refundRequest->book_id,
                'reason' => $refundRequest->reason,
                'amount' => $refundRequest->amount,
                'status' => $refundRequest->status,
                'admin_notes' => $refundRequest->admin_notes,
                'created_at' => $refundRequest->created_at?->format('Y-m-d H:i:s'),
            ],
            'booking' => [
                'book_id' => $booking->book_id,
                'program_name' => $booking->program?->name,
                'learner_name' => $booking->learner?->name,
                'learner_id' => $booking->learner?->learner_id,
                'parent_name' => $booking->parent?->name,
                'parent_email' => $booking->parent?->email,
                'book_date' => $booking->book_date?->format('Y-m-d'),
                'session_count' => $booking->session_count,
                'total_amount' => $booking->amount,
                'total_paid' => $totalPaid,
                'remaining_balance' => max(0, $booking->amount - $totalPaid),
            ],
            'receipts' => $booking->receipts->map(function ($receipt) {
                return [
                    'receipt_id' => $receipt->receipt_id,
                    'amount' => $receipt->amount,
                    'payment_type' => $receipt->payment_type,
                    'receipt_date' => $receipt->receipt_date?->format('Y-m-d'),
                    'created_at' => $receipt->created_at?->format('Y-m-d H:i:s'),
                ];
            }),
        ]);
    }

    /**
     * Approve a refund request
     */
    public function approve(Request $request, RefundRequest $refundRequest)
    {
        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($refundRequest, $validated) {
            // Update refund request status
            $refundRequest->update([
                'status' => 'approved',
                'admin_notes' => $validated['admin_notes'] ?? null,
            ]);

            // Notify parent about the refund approval
            $refundRequest->booking->parent->notify(new InAppNotification(
                title: 'Refund Request Approved',
                message: 'Your refund request for ₱' . number_format($refundRequest->amount) . ' has been approved. The amount will be processed shortly.',
                type: 'success'
            ));

            // TODO: Update booking status to reflect refund
            // TODO: Create refund transaction record
        });

        return redirect()->back()->with('success', 'Refund request approved successfully.');
    }

    /**
     * Reject a refund request
     */
    public function reject(Request $request, RefundRequest $refundRequest)
    {
        $validated = $request->validate([
            'admin_notes' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        $refundRequest->update([
            'status' => 'rejected',
            'admin_notes' => $validated['admin_notes'],
        ]);

        // Notify parent about the refund rejection
        $refundRequest->booking->parent->notify(new InAppNotification(
            title: 'Refund Request Rejected',
            message: 'Your refund request has been rejected. Reason: ' . $validated['admin_notes'],
            type: 'error'
        ));

        return redirect()->back()->with('success', 'Refund request rejected.');
    }
}
