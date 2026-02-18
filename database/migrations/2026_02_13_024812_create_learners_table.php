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
        Schema::create('learners', function (Blueprint $table) {
            $table->comment('Stores learner/student information linked to parent users');

            $table->string('learner_id')->primary();
            $table->string('name');
            $table->string('nickname')->nullable();

            // Change this to match users.id type
            $table->foreignId('parent_id')->constrained('users')->onDelete('cascade');

            $table->string('photo')->nullable();
            $table->date('date_of_birth');

            $table->enum('gender', ['male', 'female', 'other']);

            $table->string('allergies')->nullable();
            $table->string('medical_condition')->nullable();
            $table->string('religion')->nullable();

            $table->enum('school_level', ['pre-school', 'elementary', 'pre-kindergarten', 'kindergarten'])->nullable();
            $table->boolean('is_special_child')->nullable()->comment('Indicates if learner has special needs');

            $table->string('school_name')->nullable();
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('emergency_contact_primary')->nullable();
            $table->string('emergency_contact_secondary')->nullable();

            $table->string('special_request')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learners');
    }
};
