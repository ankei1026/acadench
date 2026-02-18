<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class PasswordResetController extends Controller
{
    /**
     * Self password update - User changing their own password
     */
    public function updateSelf(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        try {
            $user = Auth::user();

            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return back()->withErrors([
                    'current_password' => 'The provided password does not match your current password.'
                ])->withInput();
            }

            // Update password
            $user->password = Hash::make($validated['password']);
            $user->save();

            Log::info('User updated their own password', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return back()->with('success', 'Password updated successfully!');

        } catch (\Exception $e) {
            Log::error('Self password update failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to update password. Please try again.');
        }
    }

    /**
     * Admin reset password - Admin resets another user's password
     */
    public function resetByAdmin(Request $request, $userId)
    {
        // Check if user is admin
        if (!Auth::user() || Auth::user()->role !== 'admin') {
            return back()->with('error', 'Unauthorized. Admin access required.');
        }

        $validated = $request->validate([
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        try {
            $user = User::findOrFail($userId);

            // Update password
            $user->password = Hash::make($validated['password']);

            // Force logout from all devices
            $user->tokens()->delete();

            // Set password changed timestamp
            $user->password_changed_at = now();

            $user->save();

            Log::info('Admin reset user password', [
                'admin_id' => Auth::id(),
                'admin_email' => Auth::user()->email,
                'target_user_id' => $user->id,
                'target_user_email' => $user->email
            ]);

            $userName = $user->name ?? 'User';

            return back()->with('success', "Password has been reset successfully for {$userName}!");

        } catch (\Exception $e) {
            Log::error('Admin password reset failed', [
                'admin_id' => Auth::id(),
                'target_user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to reset password. Please try again.');
        }
    }

    /**
     * Generate a random secure password
     */
    public function generate()
    {
        $length = 12;
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $special = '!@#$%^&*()_-+=<>?';

        $all = $uppercase . $lowercase . $numbers . $special;
        $password = '';

        // Ensure at least one of each type
        $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
        $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
        $password .= $numbers[random_int(0, strlen($numbers) - 1)];
        $password .= $special[random_int(0, strlen($special) - 1)];

        // Fill the rest randomly
        for ($i = 4; $i < $length; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        // Shuffle the password
        $password = str_shuffle($password);

        // Return as JSON since this is likely an AJAX call
        return response()->json([
            'password' => $password
        ]);
    }
}
