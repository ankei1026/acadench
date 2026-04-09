<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_tutor', function (Blueprint $table) {
            $table->string('book_id');
            $table->string('tutor_id');
            $table->primary(['book_id', 'tutor_id']);

            $table->foreign('book_id')->references('book_id')->on('bookings')->onDelete('cascade');
            $table->foreign('tutor_id')->references('tutor_id')->on('tutors')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_tutor');
    }
};
