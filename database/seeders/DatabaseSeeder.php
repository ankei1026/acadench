<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tutor;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@acadench.com',
            'role' => 'admin',
            'password' => Hash::make('12341234'),
            'email_verified_at' => now(),
        ]);

        // // Create some parent users
        // $parent1 = User::create([
        //     'name' => 'Jane Parent',
        //     'email' => 'jane.parent@acadench.com',
        //     'role' => 'parent',
        //     'password' => Hash::make('password'),
        //     'email_verified_at' => now(),
        // ]);

        // $parent2 = User::create([
        //     'name' => 'John Parent',
        //     'email' => 'john.parent@acadench.com',
        //     'role' => 'parent',
        //     'password' => Hash::make('password'),
        //     'email_verified_at' => now(),
        // ]);

        // // Create tutor users and their Tutor profiles
        // $tutorUser1 = User::create([
        //     'name' => 'Alice Tutor',
        //     'email' => 'alice.tutor@acadench.com',
        //     'role' => 'tutor',
        //     'password' => Hash::make('password'),
        //     'email_verified_at' => now(),
        // ]);

        // Tutor::create([
        //     'user_id' => $tutorUser1->id,
        //     'subject' => 'Mathematics',
        //     'nickname' => 'Ally',
        //     'specializations' => 'Algebra, Geometry, Calculus',
        //     'rate_per_hour' => 25.00,
        //     'photo' => null,
        //     'bio' => 'Experienced math tutor.',
        //     'status' => 'active',
        //     'portfolio_link' => null,
        //     'mop' => 'Cash',
        //     'number' => '09171234567',
        // ]);

        // $tutorUser2 = User::create([
        //     'name' => 'Bob Tutor',
        //     'email' => 'bob.tutor@acadench.com',
        //     'role' => 'tutor',
        //     'password' => Hash::make('password'),
        //     'email_verified_at' => now(),
        // ]);

        // Tutor::create([
        //     'user_id' => $tutorUser2->id,
        //     'subject' => 'English',
        //     'nickname' => 'Bobby',
        //     'specializations' => 'Grammar, Writing, Reading',
        //     'rate_per_hour' => 20.00,
        //     'photo' => null,
        //     'bio' => 'Passionate English tutor.',
        //     'status' => 'active',
        //     'portfolio_link' => null,
        //     'mop' => 'GCash',
        //     'number' => '09179876543',
        // ]);

        // Call TutorApplication seeder
        $this->call(TutorApplicationSeeder::class);
    }
}
