<?php

namespace App\Http\Controllers;

use App\Models\Learner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLearnersController extends Controller
{
    public function index()
    {
        $learners = Learner::with('parent')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Learners/Index', [
            'learners' => $learners,
        ]);
    }
}
