<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class RefundRequest extends Model
{
    use HasFactory;

    protected $primaryKey = 'refund_request_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'refund_request_id',
        'book_id',
        'reason',
        'amount',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'amount' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $refund): void {
            if (! $refund->refund_request_id) {
                $refund->refund_request_id = 'REF_' . Str::upper(Str::random(5));
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'refund_request_id';
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'book_id', 'book_id');
    }
}
