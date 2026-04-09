<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\Tutor;
use App\Services\PayrollService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TutorPayrollController extends Controller
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function index(Request $request)
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return Inertia::render('Tutor/Payroll/Index', [
                'payrolls' => [],
                'summary' => [],
                'filters' => [],
            ]);
        }

        $year = $request->get('year');
        $month = $request->get('month');

        // Build query
        $query = Payroll::with(['session.booking.program', 'session.booking.learner'])
            ->where('tutor_id', $tutor->tutor_id)
            ->orderBy('session_date', 'desc');

        // Apply filters to the query
        if ($year) {
            $query->whereYear('session_date', $year);
        }

        if ($month && $month !== 'all') {
            $query->whereMonth('session_date', $month);
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

        // Get overall summary (all time)
        $summary = $this->payrollService->getTutorEarningsSummary($tutor->tutor_id);

        return Inertia::render('Tutor/Payroll/Index', [
            'payrolls' => $payrolls,
            'summary' => $summary,
            'filters' => [
                'year' => $year,
                'month' => $month,
            ],
            'tutor_id' => $tutor->tutor_id,
        ]);
    }
    public function show(string $payrollId)
    {
        $tutor = Tutor::where('user_id', Auth::id())->first();

        if (!$tutor) {
            return redirect()->back()->withErrors(['error' => 'Tutor not found.']);
        }

        $payroll = Payroll::with(['session.booking.program', 'session.booking.learner', 'session.tutors.user'])
            ->where('payroll_id', $payrollId)
            ->where('tutor_id', $tutor->tutor_id)
            ->firstOrFail();

        return Inertia::render('Tutor/Payroll/Show', [
            'payroll' => [
                'payroll_id' => $payroll->payroll_id,
                'session_id' => $payroll->session_id,
                'session_date' => $payroll->session_date->format('Y-m-d'),
                'session_time' => $payroll->session->booking->program->start_time ?? null,
                'program_name' => $payroll->session->booking->program->name ?? 'N/A',
                'learner_name' => $payroll->session->booking->learner->name ?? 'N/A',
                'program_price' => $payroll->program_price,
                'tutor_share_percentage' => $payroll->tutor_share_percentage,
                'base_rate' => $payroll->base_rate,
                'substitution_bonus' => $payroll->substitution_bonus,
                'total_amount' => $payroll->total_amount,
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
}
