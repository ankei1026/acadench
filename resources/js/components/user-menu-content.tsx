import { Link, router } from '@inertiajs/react';
import { Bell, LogOut, User2 } from 'lucide-react';
import { useState } from 'react';

import {
    DropdownMenuGroup,
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

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

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
                        <div className="flex items-center">
                            <Bell className="mr-2" />
                            Notification
                        </div>
                    </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Notifications</DialogTitle>
                        <DialogDescription>
                            Your recent notifications will appear here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-4">
                            {/* Example notification items */}
                            <div className="rounded-lg border p-3">
                                <p className="font-medium">Welcome back!</p>
                                <p className="text-sm text-muted-foreground">
                                    You have 3 new messages
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    2 hours ago
                                </p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="font-medium">System Update</p>
                                <p className="text-sm text-muted-foreground">
                                    New features are available
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    1 day ago
                                </p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="font-medium">Reminder</p>
                                <p className="text-sm text-muted-foreground">
                                    Complete your profile setup
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    3 days ago
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <DropdownMenuSeparator />

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
                            <User2 className="mr-2" />
                            Profile
                        </div>
                    </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Profile Information</DialogTitle>
                        <DialogDescription>
                            View and manage your profile information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-lg font-semibold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium">
                                        Name
                                    </label>
                                    <div className="col-span-3">
                                        <div className="rounded-md border px-3 py-2 text-sm">
                                            {user.name}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium">
                                        Email
                                    </label>
                                    <div className="col-span-3">
                                        <div className="rounded-md border px-3 py-2 text-sm">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right text-sm font-medium">
                                        Role
                                    </label>
                                    <div className="col-span-3">
                                        <div className="rounded-md border px-3 py-2 text-sm capitalize">
                                            {user.role}
                                        </div>
                                    </div>
                                </div> */}
                            </div>

                            {/* <div className="flex justify-end space-x-2 pt-4">
                                <Link
                                    href={`/${user.role}/profile/edit`}
                                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                    onClick={() => {
                                        cleanup();
                                        setProfileDialogOpen(false);
                                    }}
                                >
                                    Edit Profile
                                </Link>
                            </div> */}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
                            <LogOut className="mr-2" />
                            Log out
                        </div>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to log out?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be signed out of your account and
                            redirected to the home page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Link
                                href={logout()}
                                method="post"
                                onClick={() => {
                                    cleanup();
                                    handleLogout();
                                }}
                                className="bg-red-600 text-white hover:bg-red-700"
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
