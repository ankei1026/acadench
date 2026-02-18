<?php

namespace App\Http\Controllers;

use App\Models\Learner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentLearnerController extends Controller
{
    /**
     * Display a listing of learners for the authenticated parent.
     */
    public function index()
    {
        $learners = Learner::where('parent_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($learner) {
                return [
                    'id' => $learner->learner_id,
                    'learner_id' => $learner->learner_id,
                    'name' => $learner->name,
                    'nickname' => $learner->nickname,
                    'display_name' => $learner->display_name,
                    'photo' => $learner->photo ? asset('storage/' . $learner->photo) : null,
                    'date_of_birth' => $learner->date_of_birth?->format('Y-m-d'),
                    'age' => $learner->age,
                    'gender' => $learner->gender,
                    'school_level' => $learner->school_level,
                    'school_name' => $learner->school_name,
                    'is_special_child' => $learner->is_special_child,
                    'created_at' => $learner->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Parent/Learner/Index', [
            'learners' => $learners
        ]);
    }

    /**
     * Show the form for creating a new learner.
     */
    public function create()
    {
        return Inertia::render('Parent/Learner/Create', [
            'schoolLevels' => Learner::getSchoolLevels(),
            'genderOptions' => Learner::getGenderOptions(),
        ]);
    }

    /**
     * Display the specified learner for the authenticated parent.
     */
    public function show(Learner $learner)
    {
        if ($learner->parent_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Parent/Learner/Show', [
            'learner' => [
                'learner_id' => $learner->learner_id,
                'name' => $learner->name,
                'nickname' => $learner->nickname,
                'display_name' => $learner->display_name,
                'photo' => $learner->photo ? asset('storage/' . $learner->photo) : null,
                'date_of_birth' => $learner->date_of_birth?->format('Y-m-d'),
                'age' => $learner->age,
                'gender' => $learner->gender,
                'allergies' => $learner->allergies,
                'medical_condition' => $learner->medical_condition,
                'religion' => $learner->religion,
                'school_level' => $learner->school_level,
                'school_name' => $learner->school_name,
                'is_special_child' => $learner->is_special_child,
                'father_name' => $learner->father_name,
                'mother_name' => $learner->mother_name,
                'guardian_name' => $learner->guardian_name,
                'emergency_contact_primary' => $learner->emergency_contact_primary,
                'emergency_contact_secondary' => $learner->emergency_contact_secondary,
                'special_request' => $learner->special_request,
                'created_at' => $learner->created_at?->format('Y-m-d H:i:s'),
            ],
            'schoolLevels' => Learner::getSchoolLevels(),
        ]);
    }

    /**
     * Show the form for editing the specified learner.
     */
    public function edit(Learner $learner)
    {
        if ($learner->parent_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Parent/Learner/Edit', [
            'learner' => [
                'learner_id' => $learner->learner_id,
                'name' => $learner->name,
                'nickname' => $learner->nickname,
                'photo' => $learner->photo ? asset('storage/' . $learner->photo) : null,
                'date_of_birth' => $learner->date_of_birth?->format('Y-m-d'),
                'gender' => $learner->gender,
                'allergies' => $learner->allergies,
                'medical_condition' => $learner->medical_condition,
                'religion' => $learner->religion,
                'school_level' => $learner->school_level,
                'school_name' => $learner->school_name,
                'is_special_child' => $learner->is_special_child,
                'father_name' => $learner->father_name,
                'mother_name' => $learner->mother_name,
                'guardian_name' => $learner->guardian_name,
                'emergency_contact_primary' => $learner->emergency_contact_primary,
                'emergency_contact_secondary' => $learner->emergency_contact_secondary,
                'special_request' => $learner->special_request,
            ],
            'schoolLevels' => Learner::getSchoolLevels(),
            'genderOptions' => Learner::getGenderOptions(),
        ]);
    }

    /**
     * Store a newly created learner in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:100',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'photo' => 'nullable|image|max:5120', // max 5MB
            'allergies' => 'nullable|string',
            'medical_condition' => 'nullable|string',
            'religion' => 'nullable|string|max:100',
            'school_level' => 'required|string|in:pre-school,elementary,pre-kindergarten,kindergarten',
            'is_special_child' => 'boolean',
            'school_name' => 'nullable|string|max:255',
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'guardian_name' => 'nullable|string|max:255',
            'emergency_contact_primary' => 'required|string|max:20',
            'emergency_contact_secondary' => 'nullable|string|max:20',
            'special_request' => 'nullable|string',
        ]);

        try {
            // Handle photo upload
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('learners/photos', 'public');
            }

            // Create learner
            $learner = Learner::create([
                'name' => $validated['name'],
                'nickname' => $validated['nickname'],
                'parent_id' => Auth::id(),
                'photo' => $photoPath,
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'allergies' => $validated['allergies'],
                'medical_condition' => $validated['medical_condition'],
                'religion' => $validated['religion'],
                'school_level' => $validated['school_level'],
                'is_special_child' => $validated['is_special_child'] ?? false,
                'school_name' => $validated['school_name'],
                'father_name' => $validated['father_name'],
                'mother_name' => $validated['mother_name'],
                'guardian_name' => $validated['guardian_name'],
                'emergency_contact_primary' => $validated['emergency_contact_primary'],
                'emergency_contact_secondary' => $validated['emergency_contact_secondary'],
                'special_request' => $validated['special_request'],
            ]);

            return redirect()
                ->route('learners.index')
                ->with('success', 'Learner created successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create learner. Please try again.']);
        }
    }

    /**
     * Update the specified learner in storage.
     */
    public function update(Request $request, Learner $learner)
    {
        if ($learner->parent_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'nickname' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'photo' => 'nullable|image|max:5120',
            'allergies' => 'nullable|string',
            'medical_condition' => 'nullable|string',
            'religion' => 'nullable|string|max:100',
            'school_level' => 'nullable|string|in:pre-school,elementary,pre-kindergarten,kindergarten',
            'is_special_child' => 'boolean',
            'school_name' => 'nullable|string|max:255',
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'guardian_name' => 'nullable|string|max:255',
            'emergency_contact_primary' => 'nullable|string|max:20',
            'emergency_contact_secondary' => 'nullable|string|max:20',
            'special_request' => 'nullable|string',
        ]);

        try {
            $photoPath = $learner->photo;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('learners/photos', 'public');
            }

            $learner->update([
                'name' => $request->filled('name') ? $validated['name'] : $learner->name,
                'nickname' => $request->has('nickname') ? $validated['nickname'] : $learner->nickname,
                'photo' => $photoPath,
                'date_of_birth' => $request->filled('date_of_birth') ? $validated['date_of_birth'] : $learner->date_of_birth,
                'gender' => $request->filled('gender') ? $validated['gender'] : $learner->gender,
                'allergies' => $request->has('allergies') ? $validated['allergies'] : $learner->allergies,
                'medical_condition' => $request->has('medical_condition') ? $validated['medical_condition'] : $learner->medical_condition,
                'religion' => $request->has('religion') ? $validated['religion'] : $learner->religion,
                'school_level' => $request->filled('school_level') ? $validated['school_level'] : $learner->school_level,
                'is_special_child' => $validated['is_special_child'] ?? $learner->is_special_child,
                'school_name' => $request->has('school_name') ? $validated['school_name'] : $learner->school_name,
                'father_name' => $request->has('father_name') ? $validated['father_name'] : $learner->father_name,
                'mother_name' => $request->has('mother_name') ? $validated['mother_name'] : $learner->mother_name,
                'guardian_name' => $request->has('guardian_name') ? $validated['guardian_name'] : $learner->guardian_name,
                'emergency_contact_primary' => $request->filled('emergency_contact_primary')
                    ? $validated['emergency_contact_primary']
                    : $learner->emergency_contact_primary,
                'emergency_contact_secondary' => $request->has('emergency_contact_secondary')
                    ? $validated['emergency_contact_secondary']
                    : $learner->emergency_contact_secondary,
                'special_request' => $request->has('special_request') ? $validated['special_request'] : $learner->special_request,
            ]);

            return redirect()
                ->route('learners.show', $learner)
                ->with('success', 'Learner updated successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update learner. Please try again.']);
        }
    }

    /**
     * Remove the specified learner from storage.
     */
    public function destroy(Learner $learner)
    {
        if ($learner->parent_id !== Auth::id()) {
            abort(403);
        }

        try {
            $learner->delete();

            return redirect()
                ->route('learners.index')
                ->with('success', 'Learner deleted successfully!');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete learner. Please try again.']);
        }
    }
}
