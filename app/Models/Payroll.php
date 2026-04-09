<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Payroll extends Model
{
    use HasFactory;

    protected $table = 'payrolls';

    protected $fillable = [
        'payroll_id',
        'tutor_id',
        'session_id',
        'booking_id',
        'prog_id',
        'session_date',
        'program_price',
        'tutor_share_percentage',
        'base_rate',
        'substitution_bonus',
        'total_amount',
        'status',
        'attendance_status',
        'is_substitution',
        'original_tutor_id',
        'notes',
        'paid_at',
        'paid_by',
    ];

    protected $casts = [
        'session_date' => 'date',
        'program_price' => 'decimal:2',
        'tutor_share_percentage' => 'decimal:2',
        'base_rate' => 'decimal:2',
        'substitution_bonus' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'is_substitution' => 'boolean',
        'paid_at' => 'datetime',
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_PAID = 'paid';
    public const STATUS_CANCELLED = 'cancelled';

    // Attendance constants
    public const ATTENDANCE_PRESENT = 'present';
    public const ATTENDANCE_ABSENT = 'absent';
    public const ATTENDANCE_LATE = 'late';
    public const ATTENDANCE_EXCUSED = 'excused';

    protected static function booted(): void
    {
        static::creating(function (self $payroll): void {
            if (!$payroll->payroll_id) {
                $payroll->payroll_id = 'PAY_' . Str::upper(Str::random(8));
            }

            // Get program price if not set
            if (!$payroll->program_price && $payroll->prog_id) {
                $program = Program::find($payroll->prog_id);
                if ($program) {
                    $payroll->program_price = $program->price ?? 0;
                }
            }

            // Calculate base rate
            $payroll->base_rate = $payroll->program_price * ($payroll->tutor_share_percentage / 100);

            // Calculate total amount
            $payroll->total_amount = $payroll->base_rate + $payroll->substitution_bonus;
        });

        static::updating(function (self $payroll): void {
            // Recalculate when relevant fields change
            if ($payroll->isDirty(['program_price', 'tutor_share_percentage', 'substitution_bonus'])) {
                $payroll->base_rate = $payroll->program_price * ($payroll->tutor_share_percentage / 100);
                $payroll->total_amount = $payroll->base_rate + $payroll->substitution_bonus;
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'payroll_id';
    }

    /**
     * Get the tutor for this payroll entry.
     */
    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class, 'tutor_id', 'tutor_id');
    }

    /**
     * Get the session for this payroll entry.
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(BookingSession::class, 'session_id', 'session_id');
    }

    /**
     * Get the booking for this payroll entry.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id', 'book_id');
    }

    /**
     * Get the program for this payroll entry.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'prog_id', 'prog_id');
    }

    /**
     * Get the original tutor (if this is a substitution).
     */
    public function originalTutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class, 'original_tutor_id', 'tutor_id');
    }

    /**
     * Scope for pending payroll.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for approved payroll.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope for paid payroll.
     */
    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    /**
     * Scope for a specific tutor.
     */
    public function scopeForTutor($query, string $tutorId)
    {
        return $query->where('tutor_id', $tutorId);
    }

    /**
     * Scope for date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('session_date', [$startDate, $endDate]);
    }

    /**
     * Scope for substitutions only.
     */
    public function scopeSubstitutions($query)
    {
        return $query->where('is_substitution', true);
    }

    /**
     * Mark as paid.
     */
    public function markAsPaid(string $paidBy = null): void
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'paid_at' => now(),
            'paid_by' => $paidBy,
        ]);
    }

    /**
     * Mark as approved.
     */
    public function markAsApproved(): void
    {
        $this->update(['status' => self::STATUS_APPROVED]);
    }

    /**
     * Calculate total earnings for a tutor.
     */
    public static function getTutorEarnings(string $tutorId, $startDate = null, $endDate = null): array
    {
        $query = self::forTutor($tutorId);

        if ($startDate && $endDate) {
            $query->betweenDates($startDate, $endDate);
        }

        $records = $query->get();

        return [
            'total_earned' => $records->sum('total_amount'),
            'pending' => $records->where('status', self::STATUS_PENDING)->sum('total_amount'),
            'approved' => $records->where('status', self::STATUS_APPROVED)->sum('total_amount'),
            'paid' => $records->where('status', self::STATUS_PAID)->sum('total_amount'),
            'total_sessions' => $records->count(),
            'substitution_sessions' => $records->where('is_substitution', true)->count(),
            'substitution_bonus_total' => $records->sum('substitution_bonus'),
        ];
    }
}
