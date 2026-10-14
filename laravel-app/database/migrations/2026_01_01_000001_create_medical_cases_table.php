<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_number', 50)->unique();
            $table->string('patient_reference', 50);
            $table->string('surgeon_name', 100);
            $table->string('implant_type', 150);
            $table->enum('status', [
                'Draft',
                'Planning',
                'In Review',
                'Approved',
                'Completed',
                'Cancelled'
            ])->default('Planning');
            $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium');
            $table->date('surgery_date')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('status');
            $table->index('priority');
            $table->index('surgeon_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_cases');
    }
};
