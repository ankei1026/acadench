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
        Schema::create('refund_requests', function (Blueprint $table) {
            $table->string('refund_request_id')->primary();

            $table->string('book_id');
            $table->foreign('book_id')->references('book_id')->on('bookings')->onDelete('cascade');

            $table->longText('reason');
            $table->unsignedBigInteger('amount');

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->longText('admin_notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refund_requests');
    }
};
