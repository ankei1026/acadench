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
        // First, remove the old payment_method enum column
        Schema::table('receipts', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });

        // Then add the foreign key to payment_types
        Schema::table('receipts', function (Blueprint $table) {
            $table->foreignId('payment_type_id')
                ->nullable()
                ->constrained('payment_types')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->dropForeign(['payment_type_id']);
            $table->dropColumn('payment_type_id');
        });

        Schema::table('receipts', function (Blueprint $table) {
            $table->enum('payment_method', ['cash', 'bank_transfer', 'gcash']);
        });
    }
};
