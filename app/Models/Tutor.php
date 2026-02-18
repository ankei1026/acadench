<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Tutor extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'tutor_id';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tutor_id',
        'user_id',
        'specializations',
        'rate_per_hour',
        'subject',
        'photo',
        'portfolio_link',
        'bio',
        'status',
        'mop',
        'number',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->tutor_id)) {
                $model->tutor_id = self::generateTutorId();
            }
        });
    }

    /**
     * Generate a unique tutor ID.
     *
     * @return string
     */
    public static function generateTutorId(): string
    {
        do {
            // Generate 5 random alphanumeric characters (uppercase)
            $random = Str::upper(Str::random(5));
            $tutorId = 'TUT_' . $random;
        } while (self::where('tutor_id', $tutorId)->exists());

        return $tutorId;
    }

    /**
     * Get the user that owns the tutor profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'tutor_id', 'tutor_id');
    }
}
