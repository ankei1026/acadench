<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Booking extends Model
{
    /** @use HasFactory<\Database\Factories\BookingFactory> */
    use HasFactory;

    protected $primaryKey = 'book_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'book_id',
        'parent_id',
        'learner_id',
        'prog_id',
        'tutor_id',
        'book_date',
        'session_count',
        'status',
        'decline_reason',
        'payment_status',
        'booking_status',
        'notes',
        'amount',
    ];

    protected $casts = [
        'book_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $booking): void {
            if (! $booking->book_id) {
                $booking->book_id = 'BK_' . Str::upper(Str::random(5));
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'book_id';
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function learner(): BelongsTo
    {
        return $this->belongsTo(Learner::class, 'learner_id');
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'prog_id', 'prog_id');
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class, 'tutor_id', 'tutor_id');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class, 'book_id', 'book_id');
    }

    public function lectures(): HasMany
    {
        return $this->hasMany(Lecture::class, 'book_id', 'book_id');
    }

    public function refundRequests(): HasMany
    {
        return $this->hasMany(RefundRequest::class, 'book_id', 'book_id');
    }
}
