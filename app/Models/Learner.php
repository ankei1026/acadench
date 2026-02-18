<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Learner extends Model
{
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'learner_id';

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
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'learner_id';
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'learner_id',
        'name',
        'nickname',
        'parent_id',
        'photo',
        'date_of_birth',
        'gender',
        'allergies',
        'medical_condition',
        'religion',
        'school_level',
        'is_special_child',
        'school_name',
        'father_name',
        'mother_name',
        'guardian_name',
        'emergency_contact_primary',
        'emergency_contact_secondary',
        'special_request',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
        'is_special_child' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        // Add any sensitive fields here
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Generate learner_id if not provided
        static::creating(function ($learner) {
            if (empty($learner->learner_id)) {
                $learner->learner_id = self::generateLearnerId();
            }
        });
    }

    /**
     * Generate a unique learner ID with format LRNR_{random string 5}
     *
     * @return string
     */
    public static function generateLearnerId(): string
    {
        do {
            // Generate random 5-character string (uppercase letters and numbers)
            $randomString = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 5));
            $learnerId = 'LRNR_' . $randomString;
        } while (self::where('learner_id', $learnerId)->exists());

        return $learnerId;
    }

    /**
     * Get the parent (user) that owns the learner.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id', 'id');
    }

    /**
     * Get the learner's age.
     */
    public function getAgeAttribute(): ?int
    {
        if ($this->date_of_birth) {
            return $this->date_of_birth->age;
        }

        return null;
    }

    /**
     * Get the full name with nickname if available.
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->nickname) {
            return "{$this->name} ({$this->nickname})";
        }

        return $this->name;
    }

    /**
     * Scope a query to only include special needs learners.
     */
    public function scopeSpecialNeeds($query)
    {
        return $query->where('is_special_child', true);
    }

    /**
     * Scope a query to filter by school level.
     */
    public function scopeBySchoolLevel($query, string $level)
    {
        return $query->where('school_level', $level);
    }

    /**
     * Get the available school levels.
     */
    public static function getSchoolLevels(): array
    {
        return [
            'pre-school' => 'Pre-School',
            'elementary' => 'Elementary',
            'pre-kindergarten' => 'Pre-Kindergarten',
            'kindergarten' => 'Kindergarten',

        ];
    }

    /**
     * Get the available gender options.
     */
    public static function getGenderOptions(): array
    {
        return [
            'male' => 'Male',
            'female' => 'Female',
            'other' => 'Other',
        ];
    }
}
