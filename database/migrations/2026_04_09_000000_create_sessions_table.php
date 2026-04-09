<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('booking_sessions', function (Blueprint $table) {
            $table->string('session_id')->primary();
            $table->string('book_id');
            $table->date('session_date');
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('book_id')->references('book_id')->on('bookings')->cascadeOnDelete();
        });

        Schema::create('booking_session_tutor', function (Blueprint $table) {
            $table->id();
            $table->string('session_id');
                $table->string('tutor_id');
            $table->timestamps();

            $table->foreign('session_id')->references('session_id')->on('booking_sessions')->cascadeOnDelete();
                $table->foreign('tutor_id')->references('tutor_id')->on('tutors')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_session_tutor');
        Schema::dropIfExists('booking_sessions');
    }
};
