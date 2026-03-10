<?php
namespace App\Http\Controllers;

use App\Models\Rating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'tutor_id' => 'required|string|exists:tutors,tutor_id',
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string',
        ]);

        // Prevent duplicate rating by same parent for same tutor (optional, can be removed)
        $existing = Rating::where('tutor_id', $validated['tutor_id'])
            ->where('parent_id', $user->id)
            ->first();
        if ($existing) {
            return back()->withErrors(['rating' => 'You have already rated this tutor.']);
        }

        $rating = Rating::create([
            'tutor_id' => $validated['tutor_id'],
            'parent_id' => $user->id,
            'rating' => $validated['rating'],
            'feedback' => $validated['feedback'] ?? null,
        ]);

        // For Inertia, return a redirect with a flash message
        return redirect()->back()->with('success', 'Rating submitted successfully!');
    }
}
