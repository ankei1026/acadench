# Laravel Database Notifications Setup Guide

## Overview
You've successfully set up Laravel's database notification system. Notifications are now stored in the database and can be fetched by the frontend in real-time.

## Database Structure
- **Table**: `notifications`
- **Columns**: id (UUID), type, notifiable_type, notifiable_id, data (JSON), read_at, created_at, updated_at

## Sending Notifications

### Basic Example
```php
use App\Models\User;
use App\Notifications\InAppNotification;

$user = User::find(1);
$user->notify(new InAppNotification(
    title: 'Welcome!',
    message: 'Your booking has been confirmed.',
    type: 'success' // 'info', 'success', 'warning', 'error'
));
```

### In a Controller
```php
namespace App\Http\Controllers;

use App\Models\Booking;
use App\Notifications\InAppNotification;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $booking = Booking::create($request->validated());
        
        // Send notification to the learner's parent
        $booking->learner->parent->notify(new InAppNotification(
            title: 'New Booking Confirmed',
            message: 'Your child has been booked for ' . $booking->program->name,
            type: 'success'
        ));
        
        return response()->json($booking);
    }
}
```

### Bulk Notifying Multiple Users
```php
use App\Models\User;
use App\Notifications\InAppNotification;
use Illuminate\Support\Facades\Notification;

$users = User::where('role', 'parent')->get();

Notification::send($users, new InAppNotification(
    title: 'System Maintenance',
    message: 'The system will be under maintenance tonight.',
    type: 'warning'
));
```

### In Event Listeners
You can send notifications from event listeners automatically:

```php
namespace App\Listeners;

use App\Events\BookingConfirmed;
use App\Notifications\InAppNotification;

class SendBookingConfirmationNotification
{
    public function handle(BookingConfirmed $event)
    {
        $event->booking->learner->parent->notify(new InAppNotification(
            title: 'Booking Confirmed',
            message: 'Your booking for ' . $event->booking->program->name . ' is confirmed!',
            type: 'success'
        ));
    }
}
```

## API Endpoints

### Get All Notifications
```
GET /notifications
```
**Response**: Array of all notifications for the authenticated user

### Get Unread Notifications
```
GET /notifications/unread
```
**Response**: Array of unread notifications (limited to 10)

### Mark Notification as Read
```
PATCH /notifications/{id}/read
```

### Mark All Notifications as Read
```
PATCH /notifications/mark-all-read
```

### Delete Notification
```
DELETE /notifications/{id}
```

## Frontend Usage

The notification system is already integrated in `user-menu-content.tsx`. The component:
- Fetches notifications when the dialog opens
- Displays notifications with different styles based on type
- Allows marking notifications as read
- Allows deleting notifications
- Shows the time each notification was created

### Notification Types
- `info` - Blue/amber styling
- `success` - Green styling
- `warning` - Yellow styling  
- `error` - Red styling

## Examples of Sending Notifications

### When a refund is approved
```php
// In AdminRefundRequestController
public function approve(RefundRequest $refundRequest)
{
    $refundRequest->update(['status' => 'approved']);
    
    $refundRequest->user->notify(new InAppNotification(
        title: 'Refund Approved',
        message: 'Your refund request of ₵' . $refundRequest->amount . ' has been approved.',
        type: 'success'
    ));
    
    return redirect()->back()->with('success', 'Refund approved');
}
```

### When a tutor application is approved
```php
// In AdminTutorApplicationController
public function approve(TutorApplication $application)
{
    $application->update(['status' => 'approved']);
    
    $application->user->notify(new InAppNotification(
        title: 'Application Approved!',
        message: 'Congratulations! Your tutor application has been approved.',
        type: 'success'
    ));
    
    return redirect()->back();
}
```

### When a lecture is added
```php
// In AdminLecturesController
public function store(Request $request)
{
    $lecture = Lecture::create($request->validated());
    
    // Notify all tutors assigned to this program
    $lecture->program->tutors->each(function($tutor) use ($lecture) {
        $tutor->user->notify(new InAppNotification(
            title: 'New Lecture Added',
            message: 'A new lecture has been added to ' . $lecture->program->name,
            type: 'info'
        ));
    });
    
    return response()->json($lecture);
}
```

## Customizing Notifications

You can create additional notification classes for different scenarios:

```php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingCancelledNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $programName,
        public string $reason,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Booking Cancelled',
            'message' => "Your booking for {$this->programName} has been cancelled. Reason: {$this->reason}",
            'type' => 'warning',
        ];
    }
}
```

## Notes
- Notifications are stored in the database and persist permanently (until deleted)
- The frontend fetches notifications on demand when the dialog opens
- You can add more channels (email, SMS) by modifying the `via()` method in notification classes
- Consider adding scheduled cleanup for old read notifications if needed
