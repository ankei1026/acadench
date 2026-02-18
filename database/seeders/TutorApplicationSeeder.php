<?php

namespace Database\Seeders;

use App\Models\TutorApplication;
use Illuminate\Database\Seeder;

class TutorApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TutorApplication::create([
            'full_name' => 'Clara Applicant',
            'email' => 'clara@example.com',
            'phone' => '09602377530',
            'birthdate' => '1995-06-15',
            'age' => 30,
            'gender' => 'female',
            'home_address' => '123 Sample St, City',
            'subject' => 'Mathematics',
            'tutoring_experience_levels' => ['elementary', 'highschool'],
            'tutoring_experience_duration' => '3 years',
            'favorite_subject_to_teach' => 'Algebra',
            'preferred_workdays' => ['Monday', 'Wednesday', 'Friday'],
            'status' => 'pending',
            'notes' => 'Strong background in math education.'
        ]);

        // TutorApplication::create([
        //     'full_name' => 'Daniel Applicant',
        //     'email' => 'daniel@example.com',
        //     'phone' => '09602377530',
        //     'birthdate' => '1990-02-01',
        //     'age' => 36,
        //     'gender' => 'male',
        //     'home_address' => '456 Example Ave, City',
        //     'subject' => 'English',
        //     'tutoring_experience_levels' => ['preschool', 'elementary'],
        //     'tutoring_experience_duration' => '5 years',
        //     'favorite_subject_to_teach' => 'Reading',
        //     'preferred_workdays' => ['Tuesday', 'Thursday'],
        //     'status' => 'pending',
        //     'notes' => 'Previously taught at local learning center.'
        // ]);

        TutorApplication::create([
            'full_name' => 'Ralf Louie Ranario',
            'email' => 'ralflouie@acadench.com',
            'phone' => '639061508667',
            'birthdate' => '1995-06-15',
            'age' => 30,
            'gender' => 'female',
            'home_address' => '123 Sample St, City',
            'subject' => 'Mathematics',
            'tutoring_experience_levels' => ['elementary', 'highschool'],
            'tutoring_experience_duration' => '3 years',
            'favorite_subject_to_teach' => 'Algebra',
            'preferred_workdays' => ['Monday', 'Wednesday', 'Friday'],
            'status' => 'pending',
            'notes' => 'Strong background in math education.'
        ]);

        TutorApplication::create([
            'full_name' => 'Angel Keith Diaz',
            'email' => 'angelkeithdiaz1@acadench.com',
            'phone' => '639093238896',
            'birthdate' => '1990-02-01',
            'age' => 36,
            'gender' => 'male',
            'home_address' => '456 Example Ave, City',
            'subject' => 'English',
            'tutoring_experience_levels' => ['preschool', 'elementary'],
            'tutoring_experience_duration' => '5 years',
            'favorite_subject_to_teach' => 'Reading',
            'preferred_workdays' => ['Tuesday', 'Thursday'],
            'status' => 'pending',
            'notes' => 'Previously taught at local learning center.'
        ]);
    }
}
