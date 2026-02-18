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
        Schema::create('tutors', function (Blueprint $table) {
            // Custom tutor ID
            $table->string('tutor_id', 10)->primary();

            $table->unsignedBigInteger('user_id');

            // Rest of your columns
            $table->text('subject')->nullable();
            $table->text('nickname')->nullable();
            $table->longText('specializations')->nullable();
            $table->decimal('rate_per_hour', 10, 2)->nullable();
            $table->string('photo')->nullable();
            $table->text('bio')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('inactive');
            $table->string('portfolio_link')->nullable();
            $table->string('mop')->nullable();
            $table->string('number')->nullable();

            $table->timestamps();

            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Add index for better performance
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tutors');
    }
};
