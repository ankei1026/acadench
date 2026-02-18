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
        Schema::create('lectures', function (Blueprint $table) {
            $table->string('lecture_id')->primary();

            $table->string('name'); // Lecture name (from program)
            $table->string('platform')->nullable();
            $table->string('platform_link')->nullable(); // Meeting link

            $table->string('prog_id');
            $table->foreign('prog_id')->references('prog_id')->on('programs')->onDelete('cascade');

            $table->string('book_id');
            $table->foreign('book_id')->references('book_id')->on('bookings')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lectures');
    }
};
