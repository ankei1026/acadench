<?php

namespace App\Http\Controllers;

use App\Models\Learner;
use App\Models\Booking;
use App\Models\PaymentType;
use App\Models\Program;
use App\Models\Receipt;
use App\Models\Tutor;
use App\Models\Lecture;
use App\Models\User;
use App\Notifications\InAppNotification;
use Illuminate\Support\Str;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ParentBookProgramController extends Controller
{
    protected PricingService $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    public function index()
    {
        $programs = Program::orderBy('created_at', 'desc')
            ->get()
            ->map(function (Program $program) {
                // Get dynamic pricing for each program
                $priceData = $this->pricingService->calculatePrice(
                    $program->prog_id,
                    $program->session_count,
                    $program->setting ?? 'online'
                );

                return [
                    'prog_id' => $program->prog_id,
                    'name' => $program->name,
                    'prog_type' => $program->prog_type,
                    'description' => $program->description,
                    'days' => $program->days,
                    'start_time' => $program->start_time?->format('H:i:s'),
                    'end_time' => $program->end_time?->format('H:i:s'),
                    'price' => $program->price,
                    'session_count' => $program->session_count,
                    'setting' => $program->setting,
                    'dynamic_pricing' => $priceData ? [
                        'final_price' => $priceData['final_price'],
                        'price_per_session' => $priceData['price_per_session'],
                        'session_discount' => $priceData['session_discount'] ?? 0,
                        'total_discount' => $priceData['total_discount'],
                        'has_discount' => $priceData['total_discount'] > 0,
                        'formatted_total' => $this->pricingService->formatPrice($priceData['final_price']),
                        'formatted_per_session' => $this->pricingService->formatPrice($priceData['price_per_session']),
                        'discount_tier' => $priceData['discount_tier'] ?? null,
                        'min_sessions_required' => $priceData['min_sessions_required'] ?? $program->session_count,
                    ] : null,
                ];
            });

        $learners = Learner::where('parent_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Learner $learner) {
                return [
                    'learner_id' => $learner->learner_id,
                    'display_name' => $learner->display_name,
                    'photo' => $learner->photo ? asset('storage/' . $learner->photo) : null,
                ];
            });

        $tutors = Tutor::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Tutor $tutor) {
                return [
                    'tutor_id' => $tutor->tutor_id,
                    'name' => $tutor->user?->name ?? $tutor->tutor_id,
                    'subject' => $tutor->subject,
                    'photo' => $tutor->photo ? asset('storage/' . $tutor->photo) : null,
                ];
            });

        // Check if pricing API is healthy
        $apiHealthy = $this->pricingService->isApiHealthy();

        return Inertia::render('Parent/BookProgram/Index', [
            'programs' => $programs,
            'learners' => $learners,
            'tutors' => $tutors,
            'pricing_api_healthy' => $apiHealthy,
            'using_dynamic_pricing' => $apiHealthy,
        ]);
    }

    public function booking(Program $program)
    {
        $learners = Learner::where('parent_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Learner $learner) {
                return [
                    'learner_id' => $learner->learner_id,
                    'display_name' => $learner->display_name,
                    'photo' => $learner->photo ? asset('storage/' . $learner->photo) : null,
                ];
            });

        $tutors = Tutor::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Tutor $tutor) {
                return [
                    'tutor_id' => $tutor->tutor_id,
                    'name' => $tutor->user?->name ?? $tutor->tutor_id,
                    'subject' => $tutor->subject,
                    'photo' => $tutor->photo ? asset('storage/' . $tutor->photo) : null,
                ];
            });

        // Get dynamic pricing for default session count
        $defaultPriceData = $this->pricingService->calculatePrice(
            $program->prog_id,
            $program->session_count,
            $program->setting ?? 'online'
        );

        // Get pricing options for different session counts
        $pricingOptions = [];
        $sessionOptions = [1, 4, 8, 12, 16, 20];
        foreach ($sessionOptions as $sessions) {
            if ($sessions >= $program->session_count) {
                $priceData = $this->pricingService->calculatePrice(
                    $program->prog_id,
                    $sessions,
                    $program->setting ?? 'online'
                );

                if ($priceData) {
                    $pricingOptions[] = [
                        'sessions' => $sessions,
                        'total' => $priceData['final_price'],
                        'per_session' => $priceData['price_per_session'],
                        'discount' => $priceData['total_discount'],
                        'formatted_total' => $this->pricingService->formatPrice($priceData['final_price']),
                        'formatted_per_session' => $this->pricingService->formatPrice($priceData['price_per_session']),
                        'savings' => $sessions > $program->session_count
                            ? $this->pricingService->formatPrice(
                                ($program->price * $sessions) - $priceData['final_price']
                            )
                            : null,
                    ];
                }
            }
        }

        $programData = [
            'prog_id' => $program->prog_id,
            'name' => $program->name,
            'prog_type' => $program->prog_type,
            'description' => $program->description,
            'days' => $program->days,
            'start_time' => $program->start_time?->format('H:i:s'),
            'end_time' => $program->end_time?->format('H:i:s'),
            'price' => $program->price,
            'session_count' => $program->session_count,
            'setting' => $program->setting,
            'dynamic_pricing' => $defaultPriceData ? [
                'base_price' => $defaultPriceData['base_price'],
                'final_price' => $defaultPriceData['final_price'],
                'price_per_session' => $defaultPriceData['price_per_session'],
                'session_discount' => $defaultPriceData['session_discount'],
                'setting_discount' => $defaultPriceData['setting_discount'],
                'time_discount' => $defaultPriceData['time_discount'] ?? 0,
                'day_discount' => $defaultPriceData['day_discount'] ?? 0,
                'total_discount' => $defaultPriceData['total_discount'],
                'formatted_total' => $this->pricingService->formatPrice($defaultPriceData['final_price']),
                'formatted_per_session' => $this->pricingService->formatPrice($defaultPriceData['price_per_session']),
                'breakdown' => $this->pricingService->getPriceBreakdownText($defaultPriceData),
                'discount_tier' => $defaultPriceData['discount_tier'] ?? null,
                'min_sessions_required' => $defaultPriceData['min_sessions_required'] ?? $program->session_count,
            ] : null,
        ];

        $apiHealthy = $this->pricingService->isApiHealthy();

        // Get active payment types for downpayment
        $paymentTypes = PaymentType::where('is_active', true)
            ->get()
            ->map(function (PaymentType $pt) {
                return [
                    'id' => $pt->id,
                    'name' => $pt->name,
                    'account_number' => $pt->account_number,
                    'account_name' => $pt->account_name,
                    'instructions' => $pt->instructions,
                    'payment_method' => match (strtolower($pt->name)) {
                        'cash' => 'cash',
                        'gcash' => 'gcash',
                        'bank transfer', 'bank' => 'bank_transfer',
                        default => 'cash',
                    },
                ];
            });

        return Inertia::render('Parent/BookProgram/Booking', [
            'program' => $programData,
            'learners' => $learners,
            'tutors' => $tutors,
            'pricing_options' => $pricingOptions,
            'pricing_api_healthy' => $apiHealthy,
            'using_dynamic_pricing' => $apiHealthy,
            'payment_types' => $paymentTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'prog_id' => ['required', 'string', Rule::exists('programs', 'prog_id')],
            'learner_id' => ['required', 'string', Rule::exists('learners', 'learner_id')],
            'book_date' => ['required', 'date'],
            'session_count' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
            'request_tutor' => ['boolean'],
            'tutor_id' => ['nullable', 'string', Rule::exists('tutors', 'tutor_id')],
            'amount' => ['required', 'numeric', 'min:0'],
            // Downpayment fields (required)
            'downpayment_amount' => ['required', 'numeric', 'min:500'],
            'payment_type_id' => ['required', 'exists:payment_types,id'],
            'receipt_image' => ['nullable', 'image', 'max:5120'],
        ]);

        $program = Program::where('prog_id', $validated['prog_id'])->firstOrFail();
        $learner = Learner::where('learner_id', $validated['learner_id'])
            ->where('parent_id', Auth::id())
            ->firstOrFail();

        // Validate the amount against dynamic pricing
        $priceData = $this->pricingService->calculatePrice(
            $program->prog_id,
            $validated['session_count'],
            $program->setting ?? 'online',
            $validated['book_date'],
            $program->start_time?->format('H:i')
        );

        if ($priceData) {
            $calculatedAmount = $priceData['final_price'];
            $submittedAmount = (float) $validated['amount'];

            // Allow small floating point differences
            if (abs($calculatedAmount - $submittedAmount) > 0.01) {
                return redirect()->back()->withErrors([
                    'amount' => 'The booking amount does not match our calculated price. Please refresh and try again.'
                ])->withInput();
            }
        }

        // Validate downpayment doesn't exceed total amount
        $downpaymentAmount = (float) $validated['downpayment_amount'];
        $totalAmount = (float) $validated['amount'];
        if ($downpaymentAmount > $totalAmount) {
            return redirect()->back()->withErrors([
                'downpayment_amount' => 'Downpayment cannot exceed the total booking amount.'
            ])->withInput();
        }

        $tutorId = null;
        if (! empty($validated['request_tutor']) && ! empty($validated['tutor_id'])) {
            $tutorId = $validated['tutor_id'];
        }

        // Determine payment status based on downpayment
        $isFullyPaid = $downpaymentAmount >= $totalAmount;
        $paymentType = $isFullyPaid ? 'full_payment' : 'down_payment';

        $booking = Booking::create([
            'parent_id' => Auth::id(),
            'learner_id' => $learner->learner_id,
            'prog_id' => $program->prog_id,
            'tutor_id' => $tutorId,
            'book_date' => $validated['book_date'],
            'session_count' => $validated['session_count'],
            'notes' => $validated['notes'] ?? null,
            'amount' => (int) round($totalAmount),
            'status' => 'pending',
            'booking_status' => 'processing',
            'payment_status' => $isFullyPaid ? 'paid' : 'partial',
        ]);

        // Handle receipt image upload
        $receiptImage = null;
        if ($request->hasFile('receipt_image')) {
            $receiptImage = $request->file('receipt_image')->store('receipts', 'public');
        }

        // Create the downpayment receipt with receipt_date
        $remainingBalance = max(0, $totalAmount - $downpaymentAmount);
        Receipt::create([
            'book_id' => $booking->book_id,
            'amount' => $downpaymentAmount,
            'payment_type_id' => $validated['payment_type_id'],
            'payment_type' => $paymentType,
            'total_booking_amount' => $totalAmount,
            'remaining_balance' => $remainingBalance,
            'receipt_image' => $receiptImage,
            'receipt_date' => now(), // FIX: Added receipt_date
        ]);

        // Generate receipt_id if needed (if your model doesn't auto-generate it)
        // If your Receipt model has a boot method that generates receipt_id, you don't need this
        // But if not, you might want to add:
        // $receipt->receipt_id = 'RCP_' . strtoupper(Str::random(5));

        // Create lecture for all bookings (both online and hub)
        $this->createLectureForBooking($booking, true);

        // Notify admin about the new booking
        $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new InAppNotification(
                title: 'New Booking Submitted',
                message: Auth::user()->name . ' has submitted a booking for ' . $program->name . ' (₱' . number_format($totalAmount) . ')',
                type: 'info'
            ));
        }

        // Log the pricing calculation for reference
        if ($priceData) {
            Log::info('Booking created with downpayment', [
                'booking_id' => $booking->book_id,
                'total_amount' => $totalAmount,
                'downpayment' => $downpaymentAmount,
                'remaining' => $remainingBalance,
                'pricing_data' => $priceData,
                'api_used' => $this->pricingService->isApiHealthy(),
            ]);
        }

        return redirect('/parent/book-program/bookings')
            ->with('success', 'Booking submitted with downpayment of ₱' . number_format($downpaymentAmount) . '. Awaiting admin approval.');
    }

    public function bookings()
    {
        $bookings = Booking::with(['program', 'learner', 'tutor.user', 'receipts'])
            ->where('parent_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Booking $booking) {
                // Get current pricing for comparison
                $currentPriceData = null;
                if ($booking->program) {
                    $currentPriceData = $this->pricingService->calculatePrice(
                        $booking->program->prog_id,
                        $booking->session_count,
                        $booking->program->setting ?? 'online',
                        $booking->book_date?->format('Y-m-d'),
                        $booking->program->start_time?->format('H:i')
                    );
                }

                // Calculate payment info for installments
                $totalPaid = $booking->receipts->sum('amount');
                $receiptCount = $booking->receipts->count();
                $isFirstPayment = $receiptCount === 0;
                $remainingBalance = max(0, $booking->amount - $totalPaid);

                // Get the last receipt for installment info
                $lastReceipt = $booking->receipts()->orderBy('created_at', 'desc')->first();
                $currentInstallment = $lastReceipt ? ($lastReceipt->payment_installment ?? null) : null;
                $remainingInstallments = $currentInstallment ? max(0, $currentInstallment - $receiptCount) : null;

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
                    'book_date' => $booking->book_date?->format('Y-m-d'),
                    'session_count' => $booking->session_count,
                    'amount' => $booking->amount,
                    'formatted_amount' => $this->pricingService->formatPrice($booking->amount),
                    'status' => $booking->status,
                    'decline_reason' => $booking->decline_reason,
                    'booking_status' => $booking->booking_status,
                    'payment_status' => $booking->payment_status,
                    'total_paid' => $totalPaid,
                    'receipt_count' => $receiptCount,
                    'is_first_payment' => $isFirstPayment,
                    'remaining_balance' => $remainingBalance,
                    'current_installment' => $currentInstallment,
                    'remaining_installments' => $remainingInstallments,
                    'discount_info' => $currentPriceData ? [
                        'total_discount' => $currentPriceData['total_discount'],
                        'discount_tier' => $currentPriceData['discount_tier'] ?? null,
                        'breakdown' => $this->pricingService->getPriceBreakdownText($currentPriceData),
                        'original_amount' => $currentPriceData['base_price'] * $booking->session_count,
                    ] : null,
                    'current_value' => $currentPriceData ? [
                        'amount' => $currentPriceData['final_price'],
                        'formatted' => $this->pricingService->formatPrice($currentPriceData['final_price']),
                        'discount' => $currentPriceData['total_discount'],
                    ] : null,
                ];
            });

        // Get active payment types
        $paymentTypes = PaymentType::where('is_active', true)
            ->get()
            ->map(function (PaymentType $pt) {
                return [
                    'id' => $pt->id,
                    'name' => $pt->name,
                    'account_number' => $pt->account_number,
                    'account_name' => $pt->account_name,
                    'instructions' => $pt->instructions,
                    // Map payment type name to payment method type for frontend
                    'payment_method' => match (strtolower($pt->name)) {
                        'cash' => 'cash',
                        'gcash' => 'gcash',
                        'bank transfer', 'bank' => 'bank_transfer',
                        default => 'cash',
                    },
                ];
            });

        return Inertia::render('Parent/BookProgram/Show', [
            'bookings' => $bookings,
            'payment_types' => $paymentTypes,
        ]);
    }

    /**
     * API endpoint to get dynamic pricing for a program
     */
    public function getPricing(Request $request)
    {
        $validated = $request->validate([
            'prog_id' => ['required', 'string', Rule::exists('programs', 'prog_id')],
            'session_count' => ['required', 'integer', 'min:1'],
            'book_date' => ['nullable', 'date'],
        ]);

        $program = Program::where('prog_id', $validated['prog_id'])->firstOrFail();

        $priceData = $this->pricingService->calculatePrice(
            $program->prog_id,
            $validated['session_count'],
            $program->setting ?? 'online',
            $validated['book_date'] ?? null,
            $program->start_time?->format('H:i')
        );

        // Debug log
        Log::info('Pricing API Response', [
            'priceData' => $priceData
        ]);

        if (!$priceData) {
            return response()->json([
                'error' => 'Unable to calculate pricing'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $priceData,
            'formatted' => [
                'total' => $this->pricingService->formatPrice($priceData['final_price']),
                'per_session' => $this->pricingService->formatPrice($priceData['price_per_session']),
                'breakdown' => $this->pricingService->getPriceBreakdownText($priceData),
            ],
            'api_healthy' => $this->pricingService->isApiHealthy(),
        ]);
    }

    public function cancel(Booking $booking)
    {
        if ($booking->parent_id !== Auth::id()) {
            abort(403);
        }

        if ($booking->booking_status !== 'processing') {
            return redirect()->back()->withErrors(['error' => 'Only processing bookings can be cancelled.']);
        }

        $booking->update([
            'booking_status' => 'cancelled',
        ]);

        // Update lecture is_active to false when booking is cancelled
        Lecture::where('book_id', $booking->book_id)->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Booking cancelled successfully.');
    }

    public function storeReceipt(Request $request, Booking $booking)
    {
        if ($booking->parent_id !== Auth::id()) {
            abort(403);
        }

        if ($booking->status !== 'approved') {
            return redirect()->back()->withErrors(['error' => 'Only approved bookings can be paid.']);
        }

        if ($booking->payment_status === 'paid') {
            return redirect()->back()->withErrors(['error' => 'This booking is already fully paid.']);
        }

        $validated = $request->validate([
            'receipt_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:500'],
            'payment_type_id' => ['required', 'exists:payment_types,id'],
            'payment_type' => ['required', Rule::in(['down_payment', 'full_payment', 'partial', 'final_payment'])],
            'total_booking_amount' => ['nullable', 'numeric', 'min:0'],
            'remaining_balance' => ['nullable', 'numeric', 'min:0'],
            'receipt_image' => ['nullable', 'image', 'max:5120'],
        ]);

        // Calculate total paid so far
        $totalPaid = $booking->receipts()->sum('amount');
        $receiptCount = $booking->receipts()->count();
        $isFirstPayment = $receiptCount === 0;

        // Validate minimum amount for down payment / partial
        if (in_array($validated['payment_type'], ['down_payment', 'partial'])) {
            // Minimum down payment is 500
            if ((float)$validated['amount'] < 500) {
                return redirect()->back()->withErrors(['amount' => 'Minimum payment amount is ₱500.']);
            }

            // Validate installment if provided
            if (!empty($validated['payment_installment'])) {
                $remainingAfterPayment = (float)$booking->amount - (float)$validated['amount'] - $totalPaid;
                if ($remainingAfterPayment < 0) {
                    return redirect()->back()->withErrors(['amount' => 'Payment amount exceeds remaining balance.']);
                }
            }
        }

        // For full payment, validate the amount
        if ($validated['payment_type'] === 'full_payment') {
            $remainingBalance = (float)$booking->amount - $totalPaid;
            if (abs((float)$validated['amount'] - $remainingBalance) > 1) {
                return redirect()->back()->withErrors(['amount' => 'Full payment amount must match the remaining balance.']);
            }
        }

        // For final payment, validate
        if ($validated['payment_type'] === 'final_payment') {
            $remainingBalance = (float)$booking->amount - $totalPaid;
            if ((float)$validated['amount'] !== $remainingBalance) {
                return redirect()->back()->withErrors(['amount' => 'Final payment must equal the remaining balance.']);
            }
        }

        $receiptImage = null;
        if ($request->hasFile('receipt_image')) {
            $receiptImage = $request->file('receipt_image')->store('receipts', 'public');
        }

        $totalBookingAmount = !empty($validated['total_booking_amount'])
            ? (float)$validated['total_booking_amount']
            : (float)$booking->amount;

        $remainingBalance = $totalBookingAmount - ((float)$validated['amount'] + $totalPaid);

        Receipt::create([
            'book_id' => $booking->book_id,
            'receipt_date' => $validated['receipt_date'],
            'amount' => (float)$validated['amount'],
            'payment_type_id' => $validated['payment_type_id'],
            'payment_type' => $validated['payment_type'],
            'total_booking_amount' => $totalBookingAmount,
            'remaining_balance' => max(0, $remainingBalance),
            'receipt_image' => $receiptImage,
        ]);

        // Check if fully paid after this payment
        $newTotalPaid = $totalPaid + (float)$validated['amount'];
        if ($newTotalPaid >= (float)$booking->amount) {
            $booking->update([
                'payment_status' => 'paid',
                'booking_status' => 'active',
            ]);
        }

        // Notify admin about the remaining balance payment
        $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new InAppNotification(
                title: 'Remaining Balance Payment Received',
                message: 'Payment of ₱' . number_format($validated['amount']) . ' received for ' . $booking->program?->name,
                type: 'success'
            ));
        }

        return redirect()->back()->with('success', 'Payment submitted successfully.');
    }

    /**
     * Create a lecture for a booking (both online and hub)
     */
    private function createLectureForBooking(Booking $booking, bool $isActive = true): void
    {
        // Check if program exists
        if (!$booking->program) {
            return;
        }

        // Check if lecture already exists for this booking
        if (Lecture::where('book_id', $booking->book_id)->exists()) {
            return;
        }

        $platform = null;
        $platformLink = null;

        // Generate platform link based on program setting
        if ($booking->program->setting === 'online') {
            $platform = 'Google Meet';
            $platformLink = 'https://meet.google.com/' . strtolower(Str::random(3)) . '-' . Str::random(4);
        } else if ($booking->program->setting === 'hub') {
            $platform = 'Physical Hub';
            $platformLink = null; // Hub-based, no online link needed
        }

        // Create the lecture
        Lecture::create([
            'name' => $booking->program->name,
            'platform' => $platform,
            'platform_link' => $platformLink,
            'prog_id' => $booking->prog_id,
            'book_id' => $booking->book_id,
            'is_active' => $isActive,
        ]);
    }
}
