<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get all unread notifications for the authenticated user
     */
    public function unread(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'type' => $notification->data['type'] ?? 'info',
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
            ]);

        return response()->json($notifications);
    }

    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'type' => $notification->data['type'] ?? 'info',
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
            ]);

        return response()->json($notifications);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->unreadNotifications()
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, string $id)
    {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->delete();

        return response()->json(['success' => true]);
    }
}
