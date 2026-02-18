'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResetPasswordDialog } from '../../../Components/ResetPassword';
import { ColumnDef } from '@tanstack/react-table';
import {
    Calendar,
    Mail,
    MoreHorizontal,
    User2,
    XCircle,
    Key,
    Eye,
} from 'lucide-react';
import { formatDateTime } from '@/lib/dateTimeFormat';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type Parent = {
    id: string;
    name: string;
    email: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
};

export const columns: ColumnDef<Parent>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
            const parent = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                        <span className="text-sm font-semibold text-white">
                            {parent.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">
                            {parent.name}
                        </p>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-amber-500" />
                    {row.original.email}
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Joined Date',
        cell: ({ row }) => {
            const { date, time } = formatDateTime(row.original.created_at);
            return (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{date}</span>
                        <span className="text-xs text-gray-500">{time}</span>
                    </div>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const parent = row.original;
            const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
            const [isLoading, setIsLoading] = useState(false);

            // Use the user object if available, otherwise use parent data
            const userId = parent.user?.id || parent.id;
            const userName = parent.user?.name || parent.name;
            const userEmail = parent.user?.email || parent.email;

            const handleDelete = () => {
                setIsLoading(true);
                router.delete(`/admin/parents/${parent.id}`, {
                    onSuccess: () => {
                        toast.success(`Parent ${parent.name} has been deleted successfully!`);
                        setDeleteDialogOpen(false);
                    },
                    onError: () => {
                        toast.error('Failed to delete parent');
                    },
                    onFinish: () => {
                        setIsLoading(false);
                    },
                });
            };

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-amber-50"
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 border-amber-200">
                            <DropdownMenuLabel className="text-gray-700">
                                Actions
                            </DropdownMenuLabel>

                            {/* View Details
                            <DropdownMenuItem
                                onClick={() => router.visit(`/admin/parents/${parent.id}`)}
                                className="cursor-pointer"
                            >
                                <Eye className="mr-2 h-4 w-4 text-gray-500" />
                                View Details
                            </DropdownMenuItem> */}

                            <DropdownMenuSeparator />

                            <DropdownMenuLabel className="text-gray-700">
                                Manage
                            </DropdownMenuLabel>

                            {/* Reset Password - Admin Reset */}
                            <div onClick={(e) => e.stopPropagation()}>
                                <ResetPasswordDialog
                                    userId={userId}
                                    userName={userName}
                                    userEmail={userEmail}
                                    trigger={
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="cursor-pointer text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                                        >
                                            <Key className="mr-2 h-4 w-4" />
                                            Reset Password
                                        </DropdownMenuItem>
                                    }
                                />
                            </div>

                            <DropdownMenuSeparator />

                            {/* Delete Parent */}
                            <DropdownMenuItem
                                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setDeleteDialogOpen(true);
                                }}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Delete Parent
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent className="border-amber-200">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                                    Delete Parent
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-gray-900">{parent.name}</span>?
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="py-4">
                                <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                                    <p className="text-sm text-amber-800">
                                        <span className="font-semibold">Warning:</span> This will permanently delete the parent account and all associated data.
                                    </p>
                                </div>
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    disabled={isLoading}
                                    className="border-gray-200 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="mr-2">Deleting...</span>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        </>
                                    ) : (
                                        'Delete Parent'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            );
        },
    },
];
