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

        $role = Auth::user()->role;

        switch ($role) {
            case 'admin':
                return redirect()->intended('/admin/dashboard')->with(['success' => 'Log in successful']);
            case 'tutor':
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
