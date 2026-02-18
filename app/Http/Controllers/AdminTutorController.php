<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tutor;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTutorController extends Controller
{
    public function index()
    {
        $tutors = Tutor::with('user')
            ->get()
            ->map(function ($tutor) {
                return [
                    'id' => $tutor->id,
                    'tutor_id' => $tutor->tutor_id,
                    'subject' => $tutor->subject,
                    'specializations' => $tutor->specializations,
                    'rate_per_hour' => $tutor->rate_per_hour,
                    'bio' => $tutor->bio,
                    'photo' => $tutor->photo ? asset('storage/' . $tutor->photo) : null,
                    'mop' => $tutor->mop,
                    'number' => $tutor->number,
                    'status' => $tutor->status ?? 'active',
                    'user' => $tutor->user ? [
                        'id' => $tutor->user->id,
                        'name' => $tutor->user->name,
                        'email' => $tutor->user->email,
                    ] : null,
                ];
            });

        return Inertia::render(
            'Admin/Tutor/Index',
            [
                'tutors' => $tutors
            ]
        );
    }

    public function create()
    {
        return Inertia::render('Admin/Tutor/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'subject' => 'required|string'
        ]);

        try {
            // Create User first
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'role' => 'tutor',
            ]);

            // Create Tutor profile
            Tutor::create([
                'user_id' => $user->id,
                'subject' => $validated['subject']
            ]);

            return redirect()->route('admin.tutors')->with('success', 'Tutor created successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create tutor: ' . $e->getMessage());
        }
    }

    public function show($tutor_id)
    {
        $tutor = Tutor::with('user')
            ->where('tutor_id', $tutor_id)
            ->firstOrFail();

        $tutorData = [
            'id' => $tutor->id,
            'tutor_id' => $tutor->tutor_id,
            'subject' => $tutor->subject,
            'specializations' => $tutor->specializations,
            'rate_per_hour' => $tutor->rate_per_hour,
            'bio' => $tutor->bio,
            'photo' => $tutor->photo ? asset('storage/' . $tutor->photo) : null,
            'mop' => $tutor->mop,
            'number' => $tutor->number,
            'status' => $tutor->status ?? 'active',
            'portfolio_link' => $tutor->portfolio_link, // Added this line
            'user' => $tutor->user ? [
                'id' => $tutor->user->id,
                'name' => $tutor->user->name,
                'email' => $tutor->user->email,
            ] : null,
        ];

        return Inertia::render('Admin/Tutor/Show', [
            'tutor' => $tutorData
        ]);
    }

    public function updateStatus($tutor_id)
    {
        try {
            $tutor = Tutor::findOrFail($tutor_id);
            $tutor->status = $tutor->status === 'active' ? 'inactive' : 'active';
            $tutor->save();

            $action = $tutor->status === 'active' ? 'activated' : 'deactivated';
            $userName = $tutor->user ? $tutor->user->name : 'Tutor';

            return back()->with('success', "Tutor {$userName} has been {$action} successfully!");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update tutor status');
        }
    }
}
