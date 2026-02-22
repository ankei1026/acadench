<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            // Personal Information
            $table->string('full_name')->nullable()->after('user_id');
            $table->string('email')->nullable()->after('full_name');
            $table->date('birthdate')->nullable()->after('number');
            $table->string('age')->nullable()->after('birthdate');
            $table->enum('gender', ['male', 'female', 'prefer not to say'])->nullable()->after('age');
            $table->string('home_address')->nullable()->after('gender');
            $table->string('facebook_link')->nullable()->after('home_address');
            $table->string('contact_number')->nullable()->after('facebook_link');
            $table->string('mother_name')->nullable()->after('contact_number');
            $table->string('father_name')->nullable()->after('mother_name');
            $table->enum('living_status', ['single', 'married', 'widowed', 'separated', 'in a relationship'])->nullable()->after('father_name');

            // Educational Background
            $table->string('high_school')->nullable()->after('living_status');
            $table->string('college_school')->nullable()->after('high_school');
            $table->string('college_course')->nullable()->after('college_school');
            $table->boolean('is_licensed_teacher')->default(false)->after('college_course');
            $table->date('license_date')->nullable()->after('is_licensed_teacher');

            // Teaching Experience
            $table->enum('employment_status', ['employed', 'unemployed', 'freelance', 'business_owner'])->nullable()->after('license_date');
            $table->string('current_employer')->nullable()->after('employment_status');
            $table->string('working_hours')->nullable()->after('current_employer');
            $table->json('tutoring_experience_levels')->nullable()->after('working_hours');
            $table->string('tutoring_experience_duration')->nullable()->after('tutoring_experience_levels');
            $table->boolean('has_school_teaching_experience')->default(false)->after('tutoring_experience_duration');
            $table->string('school_teaching_experience_duration')->nullable()->after('has_school_teaching_experience');
            $table->text('previous_clients')->nullable()->after('school_teaching_experience_duration');

            // Preferences and Skills
            $table->string('favorite_subject_to_teach')->nullable()->after('previous_clients');
            $table->string('easiest_subject_to_teach')->nullable()->after('favorite_subject_to_teach');
            $table->string('most_difficult_subject_to_teach')->nullable()->after('easiest_subject_to_teach');
            $table->string('easier_school_level_to_teach')->nullable()->after('most_difficult_subject_to_teach');
            $table->string('harder_school_level_to_teach')->nullable()->after('easier_school_level_to_teach');
            $table->json('reasons_love_teaching')->nullable()->after('harder_school_level_to_teach');
            $table->enum('work_preference', ['alone', 'team'])->nullable()->after('reasons_love_teaching');
            $table->enum('class_size_preference', ['one_two', 'many'])->nullable()->after('work_preference');
            $table->json('teaching_values')->nullable()->after('class_size_preference');
            $table->json('application_reasons')->nullable()->after('teaching_values');
            $table->json('outside_activities')->nullable()->after('application_reasons');

            // Logistics
            $table->integer('distance_from_hub_minutes')->nullable()->after('outside_activities');
            $table->integer('distance_from_work_minutes')->nullable()->after('distance_from_hub_minutes');
            $table->enum('transportation_mode', ['motorcycle', 'public', 'fetched', 'walk', 'car', 'bike'])->nullable()->after('distance_from_work_minutes');

            // Ratings and Preferences
            $table->integer('enjoy_playing_with_kids_rating')->nullable()->after('transportation_mode');
            $table->json('preferred_toys_games')->nullable()->after('enjoy_playing_with_kids_rating');
            $table->json('annoyances')->nullable()->after('preferred_toys_games');
            $table->integer('need_job_rating')->nullable()->after('annoyances');
            $table->integer('public_speaking_rating')->nullable()->after('need_job_rating');
            $table->integer('penmanship_rating')->nullable()->after('public_speaking_rating');
            $table->integer('creativity_rating')->nullable()->after('penmanship_rating');
            $table->integer('english_proficiency_rating')->nullable()->after('creativity_rating');
            $table->string('preferred_teaching_language')->nullable()->after('english_proficiency_rating');

            // Technology and Teaching Methods
            $table->enum('edtech_opinion', ['agree', 'disagree', 'unfamiliar'])->nullable()->after('preferred_teaching_language');
            $table->boolean('needs_phone_while_teaching')->default(false)->after('edtech_opinion');
            $table->text('phone_usage_reason')->nullable()->after('needs_phone_while_teaching');
            $table->text('teaching_difficulty_approach')->nullable()->after('phone_usage_reason');
            $table->text('discipline_approach')->nullable()->after('teaching_difficulty_approach');
            $table->boolean('approves_late_fine_reward')->default(false)->after('discipline_approach');
            $table->text('late_fine_reason')->nullable()->after('approves_late_fine_reward');
            $table->enum('expected_tenure', ['1-3_months', 'permanent', 'one_year', '6_months'])->nullable()->after('late_fine_reason');

            // Commitment
            $table->json('preferred_workdays')->nullable()->after('expected_tenure');
            $table->enum('preferred_workdays_frequency', [
                '5x_weekdays',
                '4x_weekdays',
                '3x_weekdays',
                'saturdays_only',
                'sundays_only',
                'both_weekends',
                'unlimited_weekdays',
                'unlimited_all_days'
            ])->nullable()->after('preferred_workdays');
            $table->enum('preferred_schedule', [
                'morning_9am',
                'after_school_5_7pm',
                'whenever_available',
                'any_time',
                'custom'
            ])->nullable()->after('preferred_workdays_frequency');

            // Work Environment Preferences
            $table->integer('cleanliness_importance_rating')->nullable()->after('preferred_schedule');
            $table->integer('organization_importance_rating')->nullable()->after('cleanliness_importance_rating');
            $table->integer('shared_environment_comfort_rating')->nullable()->after('organization_importance_rating');
            $table->enum('teaching_style_preference', ['own_way', 'guided'])->nullable()->after('shared_environment_comfort_rating');
            $table->boolean('ok_with_team_meetings')->default(false)->after('teaching_style_preference');
            $table->boolean('ok_with_parent_meetings')->default(false)->after('ok_with_team_meetings');
            $table->enum('recording_comfort', ['yes', 'no', 'unsure'])->nullable()->after('ok_with_parent_meetings');
            $table->boolean('ok_with_media_usage')->default(false)->after('recording_comfort');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            // Drop all added columns
            $table->dropColumn([
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
                'high_school',
                'college_school',
                'college_course',
                'is_licensed_teacher',
                'license_date',
                'employment_status',
                'current_employer',
                'working_hours',
                'tutoring_experience_levels',
                'tutoring_experience_duration',
                'has_school_teaching_experience',
                'school_teaching_experience_duration',
                'previous_clients',
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
                'distance_from_hub_minutes',
                'distance_from_work_minutes',
                'transportation_mode',
                'enjoy_playing_with_kids_rating',
                'preferred_toys_games',
                'annoyances',
                'need_job_rating',
                'public_speaking_rating',
                'penmanship_rating',
                'creativity_rating',
                'english_proficiency_rating',
                'preferred_teaching_language',
                'edtech_opinion',
                'needs_phone_while_teaching',
                'phone_usage_reason',
                'teaching_difficulty_approach',
                'discipline_approach',
                'approves_late_fine_reward',
                'late_fine_reason',
                'expected_tenure',
                'preferred_workdays',
                'preferred_workdays_frequency',
                'preferred_schedule',
                'cleanliness_importance_rating',
                'organization_importance_rating',
                'shared_environment_comfort_rating',
                'teaching_style_preference',
                'ok_with_team_meetings',
                'ok_with_parent_meetings',
                'recording_comfort',
                'ok_with_media_usage',
            ]);
        });
    }
};
