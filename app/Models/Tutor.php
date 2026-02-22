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
        'subject',
        'photo',
        'portfolio_link',
        'bio',
        'status',
        'number',

        // Personal Information
        'full_name',
        'email',
        'birthdate',
        'age',
        'gender',
        'home_address',
        'facebook_link',
        'contact_number',
        'mother_name',
        'father_name',
        'living_status',

        // Educational Background
        'high_school',
        'college_school',
        'college_course',
        'is_licensed_teacher',
        'license_date',

        // Teaching Experience
        'employment_status',
        'current_employer',
        'working_hours',
        'tutoring_experience_levels',
        'tutoring_experience_duration',
        'has_school_teaching_experience',
        'school_teaching_experience_duration',
        'previous_clients',

        // Preferences and Skills
        'favorite_subject_to_teach',
        'easiest_subject_to_teach',
        'most_difficult_subject_to_teach',
        'easier_school_level_to_teach',
        'harder_school_level_to_teach',
        'reasons_love_teaching',
        'work_preference',
        'class_size_preference',
        'teaching_values',
        'application_reasons',
        'outside_activities',

        // Logistics
        'distance_from_hub_minutes',
        'distance_from_work_minutes',
        'transportation_mode',

        // Ratings and Preferences
        'enjoy_playing_with_kids_rating',
        'preferred_toys_games',
        'annoyances',
        'need_job_rating',
        'public_speaking_rating',
        'penmanship_rating',
        'creativity_rating',
        'english_proficiency_rating',
        'preferred_teaching_language',

        // Technology and Teaching Methods
        'edtech_opinion',
        'needs_phone_while_teaching',
        'phone_usage_reason',
        'teaching_difficulty_approach',
        'discipline_approach',
        'approves_late_fine_reward',
        'late_fine_reason',
        'expected_tenure',

        // Commitment
        'preferred_workdays',
        'preferred_workdays_frequency',
        'preferred_schedule',

        // Work Environment Preferences
        'cleanliness_importance_rating',
        'organization_importance_rating',
        'shared_environment_comfort_rating',
        'teaching_style_preference',
        'ok_with_team_meetings',
        'ok_with_parent_meetings',
        'recording_comfort',
        'ok_with_media_usage',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // Dates
        'birthdate' => 'date',
        'license_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',

        // Booleans
        'is_licensed_teacher' => 'boolean',
        'has_school_teaching_experience' => 'boolean',
        'needs_phone_while_teaching' => 'boolean',
        'approves_late_fine_reward' => 'boolean',
        'ok_with_team_meetings' => 'boolean',
        'ok_with_parent_meetings' => 'boolean',
        'ok_with_media_usage' => 'boolean',

        // JSON fields
        'tutoring_experience_levels' => 'array',
        'reasons_love_teaching' => 'array',
        'teaching_values' => 'array',
        'application_reasons' => 'array',
        'outside_activities' => 'array',
        'preferred_toys_games' => 'array',
        'annoyances' => 'array',
        'preferred_workdays' => 'array',

        // Integers
        'distance_from_hub_minutes' => 'integer',
        'distance_from_work_minutes' => 'integer',
        'enjoy_playing_with_kids_rating' => 'integer',
        'need_job_rating' => 'integer',
        'public_speaking_rating' => 'integer',
        'penmanship_rating' => 'integer',
        'creativity_rating' => 'integer',
        'english_proficiency_rating' => 'integer',
        'cleanliness_importance_rating' => 'integer',
        'organization_importance_rating' => 'integer',
        'shared_environment_comfort_rating' => 'integer',
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
