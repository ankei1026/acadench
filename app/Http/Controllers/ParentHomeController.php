<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ParentHomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Parent/Home');
    }
}
