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
        Schema::create('receipts', function (Blueprint $table) {
            $table->string('receipt_id')->primary();

            $table->string('book_id');
            $table->foreign('book_id')->references('book_id')->on('bookings')->onDelete('cascade');

            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'bank_transfer', 'gcash']);

            $table->enum('payment_type', ['down_payment', 'full_payment', 'partial', 'final_payment']);
            $table->decimal('total_booking_amount', 10, 2)->nullable();
            $table->decimal('remaining_balance', 10, 2)->nullable();
            $table->integer('payment_installment')->nullable();

            $table->string('receipt_image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
