import { Link, router } from '@inertiajs/react';
import { Bell, LogOut, User2, Key, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { type User } from '@/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { ResetPasswordDialog } from '../pages/Components/ResetPassword';

interface UserMenuContentProps {
    user: User;
}

interface INotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read_at: string | null;
    created_at: string;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch unread count on component mount
        fetchUnreadCount();
        // Set up interval to check for new notifications
        const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (notificationDialogOpen) {
            fetchNotifications();
        }
    }, [notificationDialogOpen]);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/notifications/unread');
            const data = await response.json();
            setUnreadCount(data.length);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
            const response = await fetch('/notifications');
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Content-Type': 'application/json',
                },
            });
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
            ));
            // Update unread count
            fetchUnreadCount();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await fetch(`/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Content-Type': 'application/json',
                },
            });
            setNotifications(notifications.filter(n => n.id !== notificationId));
            // Update unread count
            fetchUnreadCount();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getNotificationStyles = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-green-100 bg-green-50/30 hover:bg-green-50';
            case 'warning':
                return 'border-yellow-100 bg-yellow-50/30 hover:bg-yellow-50';
            case 'error':
                return 'border-red-100 bg-red-50/30 hover:bg-red-50';
            default:
                return 'border-amber-100 bg-amber-50/30 hover:bg-amber-50';
        }
    };

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Notification Dialog */}
            <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
                <DialogTrigger asChild>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={(e) => {
                            e.preventDefault();
                            setNotificationDialogOpen(true);
                        }}
                    >
                        <div className="flex items-center relative">
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="absolute -right-26 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>
                    </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border-amber-200">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                <Bell className="h-4 w-4 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                                Notifications
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600">
                            {notifications.length === 0 ? 'No notifications yet' : `You have ${notifications.length} notification${notifications.length === 1 ? '' : 's'}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {isLoadingNotifications ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`rounded-lg border p-3 transition-colors ${getNotificationStyles(notification.type)} ${notification.read_at ? 'opacity-75' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{notification.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(notification.created_at).toLocaleDateString()} at {' '}
                                                    {new Date(notification.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {!notification.read_at && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-amber-600 hover:text-amber-700 p-1"
                                                        title="Mark as read"
                                                    >
                                                        <Bell className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="text-red-600 hover:text-red-700 p-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No notifications to display</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Profile Dialog */}
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
                <DialogTrigger asChild>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={(e) => {
                            e.preventDefault();
                            setProfileDialogOpen(true);
                        }}
                    >
                        <div className="flex items-center">
                            <User2 className="mr-2 h-4 w-4" />
                            Profile
                        </div>
                    </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg border-amber-200">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                <User2 className="h-4 w-4 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                                Profile Information
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-600">
                            View and manage your profile information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                                    <span className="text-xl font-semibold text-white">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 py-2">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <div className="col-span-3">
                                        <div className="rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900">
                                            {user.name}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="col-span-3">
                                        <div className="rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <DropdownMenuSeparator />

            {/* Reset Password - Self Reset */}
            <div onClick={(e) => e.stopPropagation()}>
                <ResetPasswordDialog
                    userId={user.id}
                    userName={user.name}
                    userEmail={user.email}
                    trigger={
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                        >
                            <Key className="mr-2 h-4 w-4" />
                            Change Password
                        </DropdownMenuItem>
                    }
                />
            </div>

            <DropdownMenuSeparator />

            {/* Logout with confirmation dialog */}
            <AlertDialog
                open={logoutDialogOpen}
                onOpenChange={setLogoutDialogOpen}
            >
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        onSelect={(e) => {
                            e.preventDefault();
                            setLogoutDialogOpen(true);
                        }}
                    >
                        <div className="flex items-center">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </div>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-amber-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                            Are you sure you want to log out?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                            You will be signed out of your account and
                            redirected to the home page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Link
                                href={logout()}
                                method="post"
                                onClick={() => {
                                    cleanup();
                                    handleLogout();
                                }}
                                className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
                                data-test="logout-button"
                            >
                                Log out
                            </Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
