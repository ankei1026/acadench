<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify payment_status enum to include 'partial'
        DB::statement("ALTER TABLE bookings MODIFY COLUMN payment_status ENUM('pending', 'partial', 'paid', 'failed') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE bookings MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending'");
    }
};
