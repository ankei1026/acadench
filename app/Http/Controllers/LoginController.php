<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class LoginController extends Controller
{
    public function index()
    {
        return Inertia::render('Authentication/Login');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'email|required',
            'password' => 'string|required'
        ]);

        if (!Auth::attempt($validated)) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ]);
        }

        $user = Auth::user();
        $role = $user->role;

        switch ($role) {
            case 'admin':
                return redirect()->intended('/admin/dashboard')->with(['success' => 'Log in successful']);
            case 'tutor':
                // Check tutor status
                $tutor = $user->tutor;
                if ($tutor && $tutor->status !== 'active') {
                    Auth::logout();
                    return redirect()->route('home')->withErrors([
                        'tutor' => "Your account is deactivate, you can't login as a Tutor"
                    ]);
                }
                return redirect()->intended('/tutor/dashboard')->with(['success' => 'Log in successful']);
            case 'parent':
                return redirect()->intended('/parent/home')->with(['success' => 'Log in successful']);
        }
    }

    public function destroy()
    {
        Auth::logout();

        return redirect()->route('home')->with(['success' => 'Log out successful']);
    }
}
