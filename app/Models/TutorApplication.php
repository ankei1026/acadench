<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TutorApplication extends Model
{
    /** @use HasFactory<\Database\Factories\TutorApplicationFactory> */
    use HasFactory;

    protected $fillable = [
        // Personal Information
        'full_name',
        'email',
        'phone',
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

        // Application Status and Documents
        'subject',
        'document_path',
        'status',
        'notes',
    ];

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

        // Enums
        'gender' => 'string',
        'living_status' => 'string',
        'employment_status' => 'string',
        'work_preference' => 'string',
        'class_size_preference' => 'string',
        'transportation_mode' => 'string',
        'edtech_opinion' => 'string',
        'expected_tenure' => 'string',
        'preferred_workdays_frequency' => 'string',
        'preferred_schedule' => 'string',
        'teaching_style_preference' => 'string',
        'recording_comfort' => 'string',
        'preferred_teaching_language' => 'string',
        'status' => 'string',
    ];

    // Optional: Add accessors/mutators for better data handling
    public function getTutoringExperienceLevelsAttribute($value)
    {
        return $value ? json_decode($value, true) : [];
    }

    public function setTutoringExperienceLevelsAttribute($value)
    {
        $this->attributes['tutoring_experience_levels'] = json_encode($value);
    }

    // Optional: Scope for filtering
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeLicensed($query)
    {
        return $query->where('is_licensed_teacher', true);
    }
}
