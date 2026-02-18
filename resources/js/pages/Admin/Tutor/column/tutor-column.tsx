'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResetPasswordDialog } from '../../../Components/ResetPassword';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    BookOpen,
    CheckCircle,
    DollarSign,
    MoreHorizontal,
    XCircle,
    Key,
    Eye,
    Shield,
} from 'lucide-react';

export type Tutor = {
    tutor_id: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    status: 'active' | 'inactive';
    rate_per_hour: string;
    photo: string;
    subject: string;
    total_sessions?: number;
    location?: string;
    created_at?: string;
};

export const columns: ColumnDef<Tutor>[] = [
    {
        accessorKey: 'tutor_id',
        header: 'Tutor ID',
        cell: ({ row }) => {
            return (
                <div className="font-mono text-sm text-gray-600">
                    {row.original.tutor_id}
                </div>
            );
        },
    },
    {
        accessorFn: (row) => row.user.name,
        id: 'name',
        header: 'Tutor',
        cell: ({ row }) => {
            const tutor = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10">
                        <img
                            src={tutor.photo || '/assets/default.webp'}
                            alt={tutor.user.name}
                            className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    '/assets/default.webp';
                            }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                            {tutor.user.name}
                        </span>
                        <span className="text-sm text-gray-500">
                            {tutor.user.email}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{row.original.subject}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            const isActive = status === 'active';

            return (
                <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={` ${
                        isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } `}
                >
                    {isActive ? (
                        <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                        </>
                    ) : (
                        <>
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactive
                        </>
                    )}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const tutor = row.original;
            const { auth } = usePage().props as any;
            const [dialogOpen, setDialogOpen] = useState(false);
            const [isLoading, setIsLoading] = useState(false);
            const [action, setAction] = useState<'activate' | 'deactivate'>('deactivate');

            const handleOpenDialog = (act: 'activate' | 'deactivate') => {
                setAction(act);
                setDialogOpen(true);
            };

            const handleConfirm = () => {
                setIsLoading(true);

                router.patch(
                    `/admin/tutors/${tutor.tutor_id}/update-status`,
                    {},
                    {
                        onSuccess: () => {
                            const pastTense = action === 'activate' ? 'activated' : 'deactivated';
                            toast.success(`Tutor ${tutor.user.name} has been ${pastTense} successfully!`);
                            setDialogOpen(false);
                        },
                        onError: () => {
                            toast.error('Failed to update tutor status');
                        },
                        onFinish: () => {
                            setIsLoading(false);
                        },
                    }
                );
            };

            // Check if this tutor is the currently logged-in user
            const isCurrentUser = auth?.user?.id === tutor.user.id;

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            {/* View Details */}
                            <DropdownMenuItem
                                onClick={() => router.visit(`/admin/tutors/${tutor.tutor_id}`)}
                                className="cursor-pointer"
                            >
                                <Eye className="mr-2 h-4 w-4 text-gray-500" />
                                View Details
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuLabel>Manage</DropdownMenuLabel>

                            {/* Reset Password - Auto-detects self vs admin */}
                            <div onClick={(e) => e.stopPropagation()}>
                                <ResetPasswordDialog
                                    userId={tutor.user.id}
                                    userName={tutor.user.name}
                                    userEmail={tutor.user.email}
                                    trigger={
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className={`cursor-pointer ${
                                                isCurrentUser
                                                    ? 'text-amber-600'
                                                    : 'text-blue-600'
                                            }`}
                                        >
                                            <Key className="mr-2 h-4 w-4" />
                                            {isCurrentUser ? 'Change Password' : 'Reset Password'}
                                            {isCurrentUser && (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0"
                                                >
                                                    You
                                                </Badge>
                                            )}
                                        </DropdownMenuItem>
                                    }
                                />
                            </div>

                            {/* Activate/Deactivate - Cannot deactivate yourself */}
                            {isCurrentUser ? (
                                <DropdownMenuItem
                                    className="text-gray-400 cursor-not-allowed"
                                    disabled
                                >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Cannot modify own status
                                </DropdownMenuItem>
                            ) : (
                                tutor.status === 'active' ? (
                                    <DropdownMenuItem
                                        className="text-red-600 cursor-pointer"
                                        onClick={() => handleOpenDialog('deactivate')}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Deactivate Tutor
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        className="text-green-600 cursor-pointer"
                                        onClick={() => handleOpenDialog('activate')}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Activate Tutor
                                    </DropdownMenuItem>
                                )
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Status Change Confirmation Dialog */}
                    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <AlertDialogContent className="border-amber-200">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                                    {action === 'activate' ? 'Activate Tutor' : 'Deactivate Tutor'}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                    Are you sure you want to {action === 'activate' ? 'activate' : 'deactivate'}{' '}
                                    <span className="font-semibold text-gray-900">{tutor.user.name}</span>?
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="py-4">
                                {action === 'deactivate' ? (
                                    <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                                        <p className="text-sm text-amber-800">
                                            <span className="font-semibold">Note:</span> Deactivated tutors will not be available for new assignments and cannot log in to the system.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
                                        <p className="text-sm text-emerald-800">
                                            <span className="font-semibold">Note:</span> Activated tutors will be available for assignments and can log in to the system.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end">
                                <AlertDialogCancel
                                    disabled={isLoading}
                                    className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                    className={
                                        action === 'activate'
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600'
                                            : 'bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600'
                                    }
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="mr-2">
                                                {action === 'activate' ? 'Activating...' : 'Deactivating...'}
                                            </span>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        </>
                                    ) : (
                                        action === 'activate' ? 'Activate' : 'Deactivate'
                                    )}
                                </AlertDialogAction>
                            </div>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            );
        },
    },
];
