<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingSession extends Model
{
    use HasFactory;

    protected $table = 'booking_sessions';
    protected $primaryKey = 'session_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'session_id',
        'book_id',
        'session_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'session_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_ONGOING = 'ongoing';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_COMPLETED = 'completed';

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'book_id', 'book_id');
    }

    public function tutors(): BelongsToMany
    {
        return $this->belongsToMany(Tutor::class, 'booking_session_tutor', 'session_id', 'tutor_id');
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class, 'session_id', 'session_id');
    }
}
