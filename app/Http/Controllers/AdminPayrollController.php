<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\Tutor;
use App\Services\PayrollService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPayrollController extends Controller
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function index(Request $request)
    {
        $selectedTutorId = $request->get('tutor_id');
        $year = $request->get('year');
        $month = $request->get('month');
        $status = $request->get('status');

        // Get all active tutors for dropdown
        $tutors = Tutor::with('user')
            ->where('status', 'active')
            ->get()
            ->map(function ($tutor) {
                return [
                    'tutor_id' => $tutor->tutor_id,
                    'name' => $tutor->user->name ?? 'Unknown',
                ];
            });

        $payrolls = collect();
        $summary = [
            'total_sessions' => 0,
            'total_earned' => 0,
            'substitution_sessions' => 0,
            'tutor_share_percentage' => 43,
            'pending_amount' => 0,
            'approved_amount' => 0,
            'paid_amount' => 0,
        ];
        $selectedTutor = null;

        if ($selectedTutorId) {
            $selectedTutor = Tutor::with('user')
                ->where('tutor_id', $selectedTutorId)
                ->first();

            if ($selectedTutor) {
                $selectedTutor = [
                    'tutor_id' => $selectedTutor->tutor_id,
                    'name' => $selectedTutor->user->name ?? 'Unknown',
                ];

                // Build query
                $query = Payroll::with(['session.booking.program', 'session.booking.learner'])
                    ->where('tutor_id', $selectedTutorId)
                    ->orderBy('session_date', 'desc');

                if ($year) {
                    $query->whereYear('session_date', $year);
                }

                if ($month && $month !== 'all') {
                    $query->whereMonth('session_date', $month);
                }

                if ($status && $status !== 'all') {
                    $query->where('status', $status);
                }

                $payrolls = $query->get()->map(function (Payroll $payroll) {
                    return [
                        'payroll_id' => $payroll->payroll_id,
                        'session_id' => $payroll->session_id,
                        'session_date' => $payroll->session_date->format('Y-m-d'),
                        'program_name' => $payroll->session->booking->program->name ?? 'N/A',
                        'learner_name' => $payroll->session->booking->learner->name ?? 'N/A',
                        'program_price' => (float) $payroll->program_price,
                        'tutor_share_percentage' => (float) $payroll->tutor_share_percentage,
                        'base_rate' => (float) $payroll->base_rate,
                        'substitution_bonus' => (float) $payroll->substitution_bonus,
                        'total_amount' => (float) $payroll->total_amount,
                        'status' => $payroll->status,
                        'is_substitution' => $payroll->is_substitution,
                        'attendance_status' => $payroll->attendance_status,
                        'notes' => $payroll->notes,
                        'paid_at' => $payroll->paid_at?->format('Y-m-d H:i:s'),
                        'created_at' => $payroll->created_at->format('Y-m-d H:i:s'),
                    ];
                });

                $summary = $this->payrollService->getTutorEarningsSummary($selectedTutorId);
            }
        }

        return Inertia::render('Admin/Revenue/Payroll', [
            'tutors' => $tutors,
            'selectedTutor' => $selectedTutor,
            'payrolls' => $payrolls,
            'summary' => $summary,
            'filters' => [
                'tutor_id' => $selectedTutorId,
                'year' => $year,
                'month' => $month,
                'status' => $status ?? 'all',
            ],
        ]);
    }

    public function show(string $payrollId)
    {
        $payroll = Payroll::with([
            'session.booking.program',
            'session.booking.learner',
            'session.tutors.user',
            'tutor.user',
            'originalTutor.user'
        ])->where('payroll_id', $payrollId)->firstOrFail();

        return Inertia::render('Admin/Payroll/Show', [
            'payroll' => [
                'payroll_id' => $payroll->payroll_id,
                'session_id' => $payroll->session_id,
                'session_date' => $payroll->session_date->format('Y-m-d'),
                'session_time' => $payroll->session->booking->program->start_time ?? null,
                'program_name' => $payroll->session->booking->program->name ?? 'N/A',
                'learner_name' => $payroll->session->booking->learner->name ?? 'N/A',
                'tutor_name' => $payroll->tutor->user->name ?? 'N/A',
                'program_price' => (float) $payroll->program_price,
                'tutor_share_percentage' => (float) $payroll->tutor_share_percentage,
                'base_rate' => (float) $payroll->base_rate,
                'substitution_bonus' => (float) $payroll->substitution_bonus,
                'total_amount' => (float) $payroll->total_amount,
                'status' => $payroll->status,
                'is_substitution' => $payroll->is_substitution,
                'original_tutor' => $payroll->originalTutor?->user?->name,
                'attendance_status' => $payroll->attendance_status,
                'notes' => $payroll->notes,
                'paid_at' => $payroll->paid_at?->format('Y-m-d H:i:s'),
                'created_at' => $payroll->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function updateStatus(Request $request, string $payrollId)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,paid,cancelled',
            'notes' => 'nullable|string',
        ]);

        $payroll = Payroll::where('payroll_id', $payrollId)->firstOrFail();
        $payroll->status = $request->status;

        if ($request->has('notes')) {
            $payroll->notes = $request->notes;
        }

        if ($request->status === Payroll::STATUS_PAID) {
            $payroll->paid_at = now();
            $payroll->paid_by = auth()->user()->name ?? 'Admin';
        }

        $payroll->save();

        return back()->with('success', 'Payroll status updated successfully');
    }

    public function approve(string $payrollId)
    {
        $payroll = Payroll::where('payroll_id', $payrollId)->firstOrFail();
        $payroll->markAsApproved();

        return back()->with('success', 'Payroll approved successfully');
    }

    public function markAsPaid(string $payrollId)
    {
        $payroll = Payroll::where('payroll_id', $payrollId)->firstOrFail();
        $payroll->markAsPaid(auth()->user()->name ?? 'Admin');

        return back()->with('success', 'Payroll marked as paid');
    }
}
