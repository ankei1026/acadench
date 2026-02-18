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
        Schema::create('payment_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Gcash, Bank Transfer, Cash
            $table->string('account_number')->nullable(); // e.g., GCash number, Bank account number
            $table->string('account_name')->nullable(); // e.g., Account holder name
            $table->text('instructions')->nullable(); // Optional payment instructions
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default payment types
        DB::table('payment_types')->insert([
            ['name' => 'Cash', 'account_number' => null, 'account_name' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Gcash', 'account_number' => null, 'account_name' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Bank Transfer', 'account_number' => null, 'account_name' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_types');
    }
};
