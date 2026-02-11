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
        Schema::create('tutor_applications', function (Blueprint $table) {
            // Personal Information
            $table->id();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->timestamps();
            $table->date('birthdate')->nullable();
            $table->string('age')->nullable();
            $table->enum('gender', ['male', 'female', 'prefer not to say'])->nullable();
            $table->string('home_address')->nullable();
            $table->string('facebook_link')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('father_name')->nullable();
            $table->enum('living_status', ['single', 'married', 'widowed', 'separated', 'in a relationship'])->nullable();


            // Educational Background (Section 2)
            $table->string('high_school')->nullable();
            $table->string('college_school')->nullable();
            $table->string('college_course')->nullable();
            $table->boolean('is_licensed_teacher')->default(false);
            $table->date('license_date')->nullable();

            // Teaching Experience (Section 3)
            $table->enum('employment_status', ['employed', 'unemployed', 'freelance', 'business_owner'])->nullable();
            $table->string('current_employer')->nullable();
            $table->string('working_hours')->nullable();
            $table->json('tutoring_experience_levels')->nullable(); // Stores array of selected grade levels
            $table->string('tutoring_experience_duration')->nullable();
            $table->boolean('has_school_teaching_experience')->default(false);
            $table->string('school_teaching_experience_duration')->nullable();
            $table->text('previous_clients')->nullable();

            // Preferences and Skills (Section 4)
            $table->string('favorite_subject_to_teach')->nullable();
            $table->string('easiest_subject_to_teach')->nullable();
            $table->string('most_difficult_subject_to_teach')->nullable();
            $table->string('easier_school_level_to_teach')->nullable();
            $table->string('harder_school_level_to_teach')->nullable();
            $table->json('reasons_love_teaching')->nullable();
            $table->enum('work_preference', ['alone', 'team'])->nullable();
            $table->enum('class_size_preference', ['one_two', 'many'])->nullable();
            $table->json('teaching_values')->nullable();
            $table->json('application_reasons')->nullable();
            $table->json('outside_activities')->nullable();

            // Logistics
            $table->integer('distance_from_hub_minutes')->nullable();
            $table->integer('distance_from_work_minutes')->nullable();
            $table->enum('transportation_mode', ['motorcycle', 'public', 'fetched', 'walk', 'car', 'bike'])->nullable();

            // Ratings and Preferences
            $table->integer('enjoy_playing_with_kids_rating')->nullable()->min(1)->max(5);
            $table->json('preferred_toys_games')->nullable();
            $table->json('annoyances')->nullable();
            $table->integer('need_job_rating')->nullable()->min(1)->max(5);
            $table->integer('public_speaking_rating')->nullable()->min(1)->max(5);
            $table->integer('penmanship_rating')->nullable()->min(1)->max(5);
            $table->integer('creativity_rating')->nullable()->min(1)->max(5);
            $table->integer('english_proficiency_rating')->nullable()->min(1)->max(5);
            $table->string('preferred_teaching_language')->nullable();

            // Technology and Teaching Methods
            $table->enum('edtech_opinion', ['agree', 'disagree', 'unfamiliar'])->nullable();
            $table->boolean('needs_phone_while_teaching')->default(false);
            $table->text('phone_usage_reason')->nullable();
            $table->text('teaching_difficulty_approach')->nullable();
            $table->text('discipline_approach')->nullable();
            $table->boolean('approves_late_fine_reward')->default(false);
            $table->text('late_fine_reason')->nullable();
            $table->enum('expected_tenure', ['1-3_months', 'permanent', 'one_year', '6_months'])->nullable();

            // Commitment (Section 5)
            $table->json('preferred_workdays')->nullable();
            $table->enum('preferred_workdays_frequency', [
                '5x_weekdays',
                '4x_weekdays',
                '3x_weekdays',
                'saturdays_only',
                'sundays_only',
                'both_weekends',
                'unlimited_weekdays',
                'unlimited_all_days'
            ])->nullable();
            $table->enum('preferred_schedule', [
                'morning_9am',
                'after_school_5_7pm',
                'whenever_available',
                'any_time',
                'custom'
            ])->nullable();

            // Work Environment Preferences
            $table->integer('cleanliness_importance_rating')->nullable()->min(1)->max(5);
            $table->integer('organization_importance_rating')->nullable()->min(1)->max(5);
            $table->integer('shared_environment_comfort_rating')->nullable()->min(1)->max(5);
            $table->enum('teaching_style_preference', ['own_way', 'guided'])->nullable();
            $table->boolean('ok_with_team_meetings')->default(false);
            $table->boolean('ok_with_parent_meetings')->default(false);
            $table->enum('recording_comfort', ['yes', 'no', 'unsure'])->nullable();
            $table->boolean('ok_with_media_usage')->default(false);

            // Application Status and Documents
            $table->string('subject')->nullable();
            $table->string('document_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tutor_applications');
    }
};
