<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Lecture extends Model
{
    use HasFactory;

    protected $primaryKey = 'lecture_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'lecture_id',
        'name',
        'platform',
        'platform_link',
        'prog_id',
        'book_id',
        'is_active',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $lecture): void {
            if (! $lecture->lecture_id) {
                $lecture->lecture_id = 'LECT_' . strtoupper(Str::random(5));
            }
        });
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'prog_id', 'prog_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'book_id', 'book_id');
    }
}
