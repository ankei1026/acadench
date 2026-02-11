<?php

namespace App\Http\Controllers;

use App\Models\TutorApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTutorApplicationController extends Controller
{
    public function index()
    {
        $applications = TutorApplication::all()
            ->map(fn($app) => [
                'id' => $app->id,
                'full_name' => $app->full_name,
                'email' => $app->email,
                'subject' => $app->subject,
                'document_path' => $app->document_path,
                'status' => $app->status,
                'created_at' => $app->created_at,
            ])
            ->toArray();


        return Inertia::render('Admin/TutorApplication/Index', [
            'applications' => $applications,
        ]);
    }
}
