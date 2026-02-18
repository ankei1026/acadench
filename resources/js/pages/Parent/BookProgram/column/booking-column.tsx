'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar, Coins, User, Clock, CheckCircle, XCircle, BookOpen, MoreHorizontal, CalendarRange } from 'lucide-react';
import { formatDate } from '@/lib/dateTimeFormat';
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

export type BookingRow = {
    book_id: string;
    program: string | null;
    learner?: {
        learner_id: string;
        name: string;
        nickname?: string | null;
        photo?: string | null;
    } | null;
    tutor: string | null;
    book_date: string | null;
    session_count: number;
    amount: number;
    status: 'pending' | 'approved' | 'declined' | string;
    decline_reason?: string | null;
    booking_status?: 'processing' | 'active' | 'completed' | 'cancelled' | null;
    payment_status?: 'pending' | 'partial' | 'paid' | 'failed' | null;
    // Payment tracking fields
    total_paid?: number;
    receipt_count?: number;
    is_first_payment?: boolean;
    remaining_balance?: number;
    current_installment?: number | null;
    remaining_installments?: number | null;
    // Discount information
    discount_info?: {
        total_discount: number;
        discount_tier: string | null;
        breakdown: string;
        original_amount: number;
    } | null;
};

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    declined: 'bg-red-100 text-red-800 border border-red-200',
};

// Status Badge with Icon
const StatusBadge = ({ status, declineReason }: { status: string; declineReason?: string | null }) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    if (status === 'declined' && declineReason) {
        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Badge className={`${statusStyles[status]} cursor-pointer`}>
                            <XCircle className="mr-1 h-3 w-3" />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Decline Reason</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled className="max-w-xs text-xs whitespace-normal">
                            {declineReason}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        );
    }

    const icon =
        status === 'pending' ? (
            <Clock className="mr-1 h-3 w-3" />
        ) : status === 'approved' ? (
            <CheckCircle className="mr-1 h-3 w-3" />
        ) : (
            <XCircle className="mr-1 h-3 w-3" />
        );

    return (
        <Badge className={statusStyles[status] || 'border border-gray-200 bg-gray-100 text-gray-700'}>
            {icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
};

// Booking Status Badge with Icon
const BookingStatusBadge = ({ status, paymentStatus }: { status?: string | null; paymentStatus?: string | null }) => {
    // When admin status is declined, treat booking_status as cancelled
    const displayStatus = status === 'declined' ? 'cancelled' : status || 'processing';
    const finalPaymentStatus = displayStatus === 'cancelled' ? 'failed' : paymentStatus;

    const statusConfig: Record<
        string,
        {
            label: string;
            color: string;
            icon: React.ReactNode;
        }
    > = {
        processing: {
            label: 'Processing',
            color: 'bg-blue-100 text-blue-800 border border-blue-200',
            icon: <Clock className="mr-1 h-3 w-3" />,
        },
        active: {
            label: 'Active',
            color: 'bg-purple-100 text-purple-800 border border-purple-200',
            icon: <BookOpen className="mr-1 h-3 w-3" />,
        },
        completed: {
            label: 'Completed',
            color: 'bg-green-100 text-green-800 border border-green-200',
            icon: <CheckCircle className="mr-1 h-3 w-3" />,
        },
        cancelled: {
            label: 'Cancelled',
            color: 'bg-gray-100 text-gray-800 border border-gray-200',
            icon: <XCircle className="mr-1 h-3 w-3" />,
        },
    };

    const config = statusConfig[displayStatus] || statusConfig['processing'];

    return (
        <div className="flex items-center gap-2">
            <Badge className={config.color}>
                {config.icon}
                {config.label}
            </Badge>
        </div>
    );
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// Helper function to calculate end date
const calculateEndDate = (startDate: string | null, sessionCount: number): string | null => {
    if (!startDate) return null;

    const start = new Date(startDate);
    const end = new Date(start);

    // For session-based programs, add session_count days
    // For weekly programs, you might want to add weeks instead
    end.setDate(start.getDate() + sessionCount);

    return end.toISOString();
};

// Date Range Component
const DateRangeCell = ({ startDate, sessionCount }: { startDate: string | null; sessionCount: number }) => {
    if (!startDate) {
        return <span className="text-gray-400">N/A</span>;
    }

    const start = new Date(startDate);
    const end = calculateEndDate(startDate, sessionCount);

    // Check if it's a single session
    if (sessionCount === 1) {
        return (
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{formatDate(startDate)}</span>
                </div>
                <span className="text-xs text-gray-500 ml-6">Single session</span>
            </div>
        );
    }

    // Check if it's the same day (shouldn't happen with sessionCount > 1, but just in case)
    if (start.toDateString() === new Date(end!).toDateString()) {
        return (
            <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4 text-amber-500" />
                <span className="font-medium">{formatDate(startDate)}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2 text-gray-700">
                <CalendarRange className="h-4 w-4 text-amber-500" />
                <div className="flex items-center gap-1">
                    <span className="font-medium">{formatDate(startDate)}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="font-medium">{formatDate(end!)}</span>
                </div>
            </div>
            <span className="text-xs text-gray-500 ml-6">{sessionCount} sessions</span>
        </div>
    );
};

export const columns: ColumnDef<BookingRow>[] = [
    {
        accessorKey: 'program',
        header: 'Program',
        cell: ({ row }) => <div className="font-medium text-gray-900">{row.original.program ?? 'N/A'}</div>,
    },
    {
        accessorKey: 'learner',
        header: 'Learner',
        cell: ({ row }) => {
            const learner = row.original.learner;
            if (!learner) {
                return <span className="text-gray-400">N/A</span>;
            }

            const displayName = learner.nickname ? `${learner.name} (${learner.nickname})` : learner.name;
            const photoUrl = learner.photo || undefined;

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={photoUrl} alt={learner.name} />
                        <AvatarFallback className="bg-amber-100 text-sm text-amber-700">
                            {learner.name?.charAt(0).toUpperCase() || 'L'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-500">{learner.learner_id}</p>
                    </div>
                </div>
            );
        },
    },
    {
        id: 'date_range',
        header: 'Schedule',
        cell: ({ row }) => (
            <DateRangeCell
                startDate={row.original.book_date}
                sessionCount={row.original.session_count}
            />
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 font-semibold text-amber-900">
                <Coins className="h-4 w-4 text-amber-500" />
                {formatPrice(row.original.amount)}
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Admin Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} declineReason={row.original.decline_reason} />,
    },
    {
        accessorKey: 'booking_status',
        header: 'Booking Status',
        cell: ({ row }) => <BookingStatusBadge status={row.original.booking_status} />,
    },
];
