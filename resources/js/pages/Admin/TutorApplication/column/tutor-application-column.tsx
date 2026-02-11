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
import { ColumnDef } from '@tanstack/react-table';
import {
    Calendar,
    Mail,
    MoreHorizontal,
    User2,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
} from 'lucide-react';
import { formatDateTime } from '@/lib/dateTimeFormat';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export type TutorApplication = {
    id: string;
    full_name: string;
    email: string;
    subject: string;
    document_path: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
};

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approved', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-800' },
};

function ActionCell({ application }: { application: TutorApplication }) {
    const [approveDialog, setApproveDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleViewDetails = () => {
        router.visit(`/admin/tutor-applications/${application.id}`);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(`/admin/tutor-applications/${application.id}/download`);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${application.full_name}_application.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Document downloaded successfully!');
        } catch (error) {
            toast.error('Failed to download document');
        }
    };

    const handleApprove = () => {
        setIsLoading(true);
        router.patch(
            `/admin/tutor-applications/${application.id}/approve`,
            {},
            {
                onSuccess: () => {
                    toast.success(`Application from ${application.full_name} has been approved!`);
                    setApproveDialog(false);
                },
                onError: () => {
                    toast.error('Failed to approve application');
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const handleReject = () => {
        setIsLoading(true);
        router.patch(
            `/admin/tutor-applications/${application.id}/reject`,
            {},
            {
                onSuccess: () => {
                    toast.error(`Application from ${application.full_name} has been rejected.`);
                    setRejectDialog(false);
                },
                onError: () => {
                    toast.error('Failed to reject application');
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleViewDetails}>
                        <User2 className="mr-2 h-4 w-4" />
                        View Full Details
                    </DropdownMenuItem>
                    {application.document_path && (
                        <DropdownMenuItem onClick={handleDownload}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Document
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {application.status === 'pending' && (
                        <>
                            <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => setApproveDialog(true)}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setRejectDialog(true)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Approve Dialog */}
            <AlertDialog open={approveDialog} onOpenChange={setApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Application</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to approve the application of{' '}
                            <span className="font-semibold text-gray-900">
                                {application.full_name}
                            </span>
                            ? They will be notified and added as a tutor.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel disabled={isLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? 'Approving...' : 'Approve'}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={rejectDialog} onOpenChange={setRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Application</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject the application of{' '}
                            <span className="font-semibold text-gray-900">
                                {application.full_name}
                            </span>
                            ? They will be notified about the rejection.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel disabled={isLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isLoading ? 'Rejecting...' : 'Reject'}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export const columns: ColumnDef<TutorApplication>[] = [
    {
        accessorKey: 'full_name',
        header: 'Applicant Name',
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-3">
                    <User2 className="h-4 w-4 text-gray-400" />
                    <div>
                        <p className="font-medium text-gray-900">
                            {row.original.full_name}
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
                    <Mail className="h-4 w-4 text-gray-400" />
                    {row.original.email}
                </div>
            );
        },
    },
    {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => {
            return (
                <div className="text-gray-700">
                    <p className="font-medium">{row.original.subject}</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status as keyof typeof statusConfig;
            const config = statusConfig[status];
            const StatusIcon = config.icon;

            return (
                <div className="flex items-center gap-2">
                    <Badge className={config.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Applied On',
        cell: ({ row }) => {
            const { date, time } = formatDateTime(row.original.created_at);
            return (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{date}</span>
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
            return <ActionCell application={row.original} />;
        },
    },
];
