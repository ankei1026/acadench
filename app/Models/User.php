<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'parent_id');
    }

    public function tutor(): HasOne
    {
        return $this->hasOne(Tutor::class, 'user_id');
    }

    /**
     * Route notifications for SMS channel.
     *
     * @return string|null
     */
    public function routeNotificationForSms(): ?string
    {
        // First check if user has a phone field
        if ($this->getAttribute('phone')) {
            return $this->getAttribute('phone');
        }

        // Check if user is a tutor and has phone number through tutor relationship
        if ($this->tutor) {
            return $this->tutor->phone ?? null;
        }

        return null;
    }
}
