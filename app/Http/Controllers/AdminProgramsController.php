<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AdminProgramsController extends Controller
{
    /**
     * Display a listing of all programs.
     */
    public function index()
    {
        // Get all programs (you can add pagination later)
        $programs = Program::all();

        return Inertia::render('Admin/Programs/Index', [
            'programs' => $programs,
        ]);
    }

    /**
     * Show the form for creating a new program.
     */
    public function create()
    {
        return Inertia::render('Admin/Programs/Create');
    }

    /**
     * Store a newly created program in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'prog_type' => 'required|string',
            'days' => 'required|array|min:1',
            'description' => 'nullable|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'price' => 'required|numeric|min:0',
            'session_count' => 'required|integer|min:1',
        ]);

        // Convert days array to JSON
        $validated['days'] = json_encode($validated['days']);

        // Create the program
        Program::create($validated);

        // Redirect with success message
        return redirect()->back()->with('success', 'Program created successfully!');
    }

    /**
     * Display the specified program.
     */
    public function show(Program $program)
    {
        return Inertia::render('Admin/Programs/Show', [
            'program' => $program,
        ]);
    }

    /**
     * Show the form for editing the specified program.
     */
    public function edit(Program $program)
    {
        return Inertia::render('Admin/Programs/Edit', [
            'program' => $program,
        ]);
    }

    /**
     * Update the specified program in storage.
     */
    public function update(Request $request, Program $program)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'prog_type' => 'required|string',
            'days' => 'required|array|min:1',
            'description' => 'nullable|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'price' => 'required|numeric|min:0',
            'session_count' => 'required|integer|min:1',
        ]);

        // Convert days array to JSON
        $validated['days'] = json_encode($validated['days']);

        // Update the program
        $program->update($validated);

        return redirect()->route('admin.programs.index')
            ->with('success', 'Program updated successfully!');
    }

    /**
     * Remove the specified program from storage.
     */
    public function destroy(Program $program)
    {
        $program->delete();

        return redirect()->route('admin.programs.index')
            ->with('success', 'Program deleted successfully!');
    }
}
