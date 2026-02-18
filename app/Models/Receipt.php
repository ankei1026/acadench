<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Receipt extends Model
{
    /** @use HasFactory<\Database\Factories\ReceiptFactory> */
    use HasFactory;

    protected $primaryKey = 'receipt_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'receipt_id',
        'book_id',
        'receipt_date',
        'amount',
        'payment_type_id',
        'payment_type',
        'total_booking_amount',
        'remaining_balance',
        'receipt_image',
    ];

    protected $casts = [
        'receipt_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $receipt): void {
            if (! $receipt->receipt_id) {
                $receipt->receipt_id = 'RCP_' . Str::upper(Str::random(5));
            }
        });
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'book_id', 'book_id');
    }

    public function paymentType(): BelongsTo
    {
        return $this->belongsTo(PaymentType::class);
    }
}
