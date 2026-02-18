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
        Schema::create('programs', function (Blueprint $table) {
            $table->string('prog_id', 8)->primary();
            $table->string('name', 100);
            $table->string('description', 255)->nullable();
            $table->string('prog_type');
            $table->json('days');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('price', 10, 2);
            $table->unsignedSmallInteger('session_count');
            $table->enum('setting', ['hub', 'online']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
