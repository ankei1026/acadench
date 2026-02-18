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
        Schema::create('bookings', function (Blueprint $table) {
            $table->string('book_id')->primary();

            $table->unsignedBigInteger('parent_id');
            $table->foreign('parent_id')->references('id')->on('users')->onDelete('cascade');

            $table->string('learner_id');
            $table->foreign('learner_id')->references('learner_id')->on('learners')->onDelete('cascade');

            $table->string('prog_id');
            $table->foreign('prog_id')->references('prog_id')->on('programs')->onDelete('cascade');

            $table->string('tutor_id', 10)->nullable();
            $table->foreign('tutor_id')->references('tutor_id')->on('tutors')->nullOnDelete();

            $table->date('book_date');
            $table->unsignedSmallInteger('session_count');
            $table->enum('status', ['pending', 'approved', 'declined'])->default('pending');
            $table->longText('decline_reason')->nullable();

            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->enum('booking_status', ['processing', 'active', 'completed', 'cancelled'])->default('processing');

            $table->longText('notes')->nullable();

            $table->unsignedBigInteger('amount');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
