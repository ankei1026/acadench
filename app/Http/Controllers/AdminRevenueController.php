<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\PaymentType;
use App\Models\Receipt;
use App\Models\RefundRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRevenueController extends Controller
{
    public function index()
    {
        $paymentTypes = PaymentType::orderBy('created_at', 'desc')->get();

        // Get all paid receipts
        $receipts = Receipt::with(['booking', 'paymentType'])->get();

        // Calculate revenue stats
        $totalPaid = $receipts->sum('amount');

        // Deduct approved refunds from revenue
        $approvedRefunds = RefundRequest::where('status', 'approved')->sum('amount');
        $netRevenue = $totalPaid - $approvedRefunds;

        $totalReceipts = $receipts->count();

        // Get all approved/completed bookings for potential revenue
        $bookings = Booking::whereIn('status', ['approved', 'completed'])->get();
        // Use the booking `amount` as the total booking amount
        $potentialRevenue = $bookings->sum('amount');

        // Deduct approved refunds from potential revenue
        $potentialRevenueAfterRefunds = $potentialRevenue - $approvedRefunds;

        $totalBookings = $bookings->count();

        // Calculate completed payments (bookings that are fully paid)
        $fullyPaidBookings = 0;
        foreach ($bookings as $booking) {
            $bookingReceipts = Receipt::where('book_id', $booking->book_id)->get();
            $totalPaidForBooking = $bookingReceipts->sum('amount');
            if ($totalPaidForBooking >= $booking->amount) {
                $fullyPaidBookings++;
            }
        }

        // Get recent receipts with all needed fields
        $recentReceipts = Receipt::with(['booking', 'paymentType'])
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function ($receipt) {
                return [
                    'receipt_id' => $receipt->receipt_id,
                    'book_id' => $receipt->book_id,
                    'amount' => $receipt->amount,
                    'payment_type' => $receipt->payment_type,
                    'paymentType' => $receipt->paymentType ? [
                        'name' => $receipt->paymentType->name,
                    ] : null,
                    'receipt_image' => $receipt->receipt_image ? asset('storage/' . $receipt->receipt_image) : null,
                    'created_at' => $receipt->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        // Get payment type names for filter options
        $paymentTypeOptions = $paymentTypes->pluck('name')->toArray();

        return Inertia::render('Admin/Revenue/Index', [
            'paymentTypes' => $paymentTypes,
            'stats' => [
                'totalPaid' => $totalPaid,
                'netRevenue' => $netRevenue,
                'approvedRefunds' => $approvedRefunds,
                'potentialRevenue' => $potentialRevenue,
                'potentialRevenueAfterRefunds' => $potentialRevenueAfterRefunds,
                'totalReceipts' => $totalReceipts,
                'totalBookings' => $totalBookings,
                'fullyPaidBookings' => $fullyPaidBookings,
            ],
            'recentReceipts' => $recentReceipts,
            'paymentTypeOptions' => $paymentTypeOptions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:255'],
            'account_name' => ['nullable', 'string', 'max:255'],
            'instructions' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        PaymentType::create($validated);

        return redirect()->back()->with('success', 'Payment type created successfully.');
    }

    public function update(Request $request, PaymentType $paymentType)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:255'],
            'account_name' => ['nullable', 'string', 'max:255'],
            'instructions' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $paymentType->update($validated);

        return redirect()->back()->with('success', 'Payment type updated successfully.');
    }

    public function destroy(PaymentType $paymentType)
    {
        $paymentType->delete();

        return redirect()->back()->with('success', 'Payment type deleted successfully.');
    }

    public function paymentSetup()
    {
        $paymentTypes = PaymentType::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Revenue/PaymentSetup', [
            'paymentTypes' => $paymentTypes,
        ]);
    }
}
