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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->string('payroll_id')->unique(); // e.g., PAY_ABC123
            $table->string('tutor_id');
            $table->string('session_id');
            $table->string('booking_id');
            $table->string('prog_id'); // Link to program for price reference
            $table->date('session_date');
            $table->decimal('program_price', 10, 2)->default(0); // Snapshot of program price
            $table->decimal('tutor_share_percentage', 5, 2)->default(100.00); // % tutor gets (default 100%)
            $table->decimal('base_rate', 10, 2)->default(0); // Calculated: program_price * (tutor_share_percentage/100)
            $table->decimal('substitution_bonus', 10, 2)->default(0); // Extra for substitution
            $table->decimal('total_amount', 10, 2); // base_rate + substitution_bonus
            $table->enum('status', ['pending', 'approved', 'paid', 'cancelled'])->default('pending');
            $table->enum('attendance_status', ['present', 'absent', 'late', 'excused'])->nullable();
            $table->boolean('is_substitution')->default(false); // True if this was a substitute session
            $table->string('original_tutor_id')->nullable(); // Who was originally assigned
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('paid_by')->nullable(); // Admin user who approved payment
            $table->timestamps();

            // Foreign keys
            $table->foreign('tutor_id')->references('tutor_id')->on('tutors')->cascadeOnDelete();
            $table->foreign('session_id')->references('session_id')->on('booking_sessions')->cascadeOnDelete();
            $table->foreign('booking_id')->references('book_id')->on('bookings')->cascadeOnDelete();
            $table->foreign('prog_id')->references('prog_id')->on('programs')->cascadeOnDelete();
            $table->foreign('original_tutor_id')->references('tutor_id')->on('tutors')->nullOnDelete();

            // Indexes for faster queries
            $table->index(['tutor_id', 'status']);
            $table->index(['session_date']);
            $table->index(['status', 'session_date']);
            $table->index(['prog_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
