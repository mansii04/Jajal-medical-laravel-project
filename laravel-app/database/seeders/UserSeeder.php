<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seeded Admin Account
        User::firstOrCreate(
            ['email' => 'admin@jajalmedical.com'],
            [
                'name' => 'Dr. Sarah Connor (Admin)',
                'password' => Hash::make('admin123'),
                'role' => User::ROLE_ADMIN,
            ]
        );

        // 2. Seeded Viewer Account
        User::firstOrCreate(
            ['email' => 'viewer@jajalmedical.com'],
            [
                'name' => 'Mark Taylor (Viewer)',
                'password' => Hash::make('viewer123'),
                'role' => User::ROLE_VIEWER,
            ]
        );
    }
}
