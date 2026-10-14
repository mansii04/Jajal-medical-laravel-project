<?php

namespace Database\Factories;

use App\Models\MedicalCase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MedicalCaseFactory extends Factory
{
    protected $model = MedicalCase::class;

    public function definition(): array
    {
        return [
            'case_number' => 'CASE-' . fake()->unique()->numerify('####'),
            'patient_reference' => 'PAT-' . fake()->numerify('#####'),
            'surgeon_name' => fake()->randomElement([
                'Dr. Robert Miller',
                'Dr. Alicia Thorne',
                'Dr. Sanjay Gupta',
                'Dr. Elena Rostova',
                'Dr. David Kim',
            ]),
            'implant_type' => fake()->randomElement([
                'Custom Titanium Cranial Plate',
                'PEEK Lumbar Interbody Spinal Cage',
                'Bicruciate Knee Spacer',
                'Acetabular Hip Shell',
                'Maxillofacial Orbital Mesh',
            ]),
            'status' => fake()->randomElement(MedicalCase::STATUSES),
            'priority' => fake()->randomElement(MedicalCase::PRIORITIES),
            'surgery_date' => fake()->optional(0.7)->dateTimeBetween('+3 days', '+2 months')?->format('Y-m-d'),
            'created_by' => User::factory(),
        ];
    }
}
