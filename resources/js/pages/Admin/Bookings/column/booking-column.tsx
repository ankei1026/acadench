'use client';

import { ColumnDef } from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Eye, CheckCircle, XCircle, MoreHorizontal, Calendar, Users, DollarSign, Clock, Mail, BookOpen, User, Plus } from 'lucide-react';

export type Tutor = {
    tutor_id: string;
    name: string;
};

export type BookingRow = {
    book_id: string;
    parent_id: number;
    learner_id: string;
    prog_id: string;
    tutor_id: string | null;
    book_date: string;
    session_count: number;
    status: 'pending' | 'approved' | 'declined';
    decline_reason: string | null;
    payment_status: 'pending' | 'partial' | 'paid' | 'failed';
    booking_status: 'processing' | 'active' | 'completed' | 'cancelled';
    notes: string | null;
    amount: number;
    total_paid?: number;
    remaining_balance?: number;
    receipt_count?: number;
    created_at: string;
    parent?: {
        id: number;
        name: string;
        email: string;
    };
    learner?: {
        learner_id: string;
        name: string;
        nickname: string | null;
        photo: string | null;
        special_request?: string | null;
    };
    program?: {
        prog_id: string;
        name: string;
        prog_type: string;
    };
    tutor?: {
        tutor_id: string;
        first_name: string;
        last_name: string;
    };
};

// Format price
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// Format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format program type for display (same as Programs page)
const formatProgramType = (type: string) => {
    const types: Record<string, string> = {
        'pre-kinder': 'Pre-Kinder',
        'after-school-academic-tutorial': 'After School',
        'special-tutorial': 'Special Tutorial',
        'art-class': 'Art Class',
        'reading-writing': 'Reading & Writing',
        'weekend-academic-tutorial': 'Weekend Tutorial',
    };
    return types[type] || type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
        approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
        declined: { label: 'Declined', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;
    return config ? (
        <Badge className={`${config.color} border`}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
        </Badge>
    ) : null;
};

// Payment badge component
const PaymentBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-orange-100 text-orange-800 border-orange-200' },
        partial: { label: 'Downpayment Paid', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        failed: { label: 'Failed', color: 'bg-red-100 text-red-800 border-red-200' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? (
        <Badge variant="outline" className={`${config.color} border`}>
            {config.label}
        </Badge>
    ) : null;
};

// Booking Status badge component
const BookingStatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
        active: { label: 'Active', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: BookOpen },
        completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
        cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;
    return config ? (
        <Badge className={`${config.color} border`}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
        </Badge>
    ) : null;
};

// Action Cell with Dropdown
function ActionCell({ booking, tutors }: { booking: BookingRow; tutors: Tutor[] }) {
    const [approveLoading, setApproveLoading] = useState(false);
    const [declineDialog, setDeclineDialog] = useState(false);
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [statusDialog, setStatusDialog] = useState(false);
    const [selectedBookingStatus, setSelectedBookingStatus] = useState(booking.booking_status);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const handleApprove = () => {
        setApproveLoading(true);
        router.patch(
            `/admin/bookings/${booking.book_id}/status`,
            {
                status: 'approved',
            },
            {
                onSuccess: () => {
                    toast.success('Booking approved successfully!', {
                        description: `Booking ${booking.book_id} has been approved.`,
                        duration: 5000,
                    });
                    setApproveLoading(false);
                },
                onError: () => {
                    toast.error('Failed to approve booking');
                    setApproveLoading(false);
                },
            },
        );
    };

    const handleDecline = () => {
        setDeclineDialog(true);
    };

    const handleViewDetails = () => {
        setDetailsDialog(true);
    };

    const handleUpdateBookingStatus = (newStatus: string) => {
        setSelectedBookingStatus(newStatus);
        setStatusDialog(true);
    };

    const confirmStatusUpdate = () => {
        setIsUpdatingStatus(true);
        router.patch(
            `/admin/bookings/${booking.book_id}/status`,
            {
                booking_status: selectedBookingStatus,
            },
            {
                onSuccess: () => {
                    toast.success('Booking status updated successfully!', {
                        description: `Booking ${booking.book_id} status changed to ${selectedBookingStatus}.`,
                        duration: 5000,
                    });
                    setIsUpdatingStatus(false);
                    setStatusDialog(false);
                    router.reload({ only: ['updated_booking'], data: { booking_id: booking.book_id } });
                },
                onError: () => {
                    toast.error('Failed to update booking status');
                    setIsUpdatingStatus(false);
                },
            },
        );
    };

    const confirmDecline = (reason: string) => {
        router.patch(
            `/admin/bookings/${booking.book_id}/status`,
            {
                status: 'declined',
                decline_reason: reason,
            },
            {
                onSuccess: () => {
                    toast.success('Booking declined', {
                        description: `Booking ${booking.book_id} has been declined.`,
                        duration: 5000,
                    });
                    setDeclineDialog(false);
                },
                onError: () => {
                    toast.error('Failed to decline booking');
                },
            },
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleViewDetails}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    {booking.status === 'pending' && (
                        <>
                            <DropdownMenuItem onClick={handleApprove} className="text-green-600 focus:text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {approveLoading ? 'Approving...' : 'Approve'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDecline} className="text-red-600 focus:text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Decline
                            </DropdownMenuItem>
                        </>
                    )}
                    {booking.status === 'approved' && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-medium text-gray-600">Booking Status</DropdownMenuLabel>
                            {booking.booking_status !== 'processing' && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdateBookingStatus('processing')}
                                    className="text-blue-600 focus:text-blue-600"
                                >
                                    <Clock className="mr-2 h-4 w-4" />
                                    Mark as Processing
                                </DropdownMenuItem>
                            )}
                            {booking.booking_status !== 'active' && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdateBookingStatus('active')}
                                    className="text-purple-600 focus:text-purple-600"
                                >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Mark as Active
                                </DropdownMenuItem>
                            )}
                            {booking.booking_status !== 'completed' && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdateBookingStatus('completed')}
                                    className="text-green-600 focus:text-green-600"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Completed
                                </DropdownMenuItem>
                            )}
                            {booking.booking_status !== 'cancelled' && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdateBookingStatus('cancelled')}
                                    className="text-gray-600 focus:text-gray-600"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Mark as Cancelled
                                </DropdownMenuItem>
                            )}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Decline Alert Dialog */}
            <DeclineAlertDialog open={declineDialog} onOpenChange={setDeclineDialog} onConfirm={confirmDecline} bookingId={booking.book_id} />

            {/* Booking Status Update Dialog */}
            <StatusUpdateAlertDialog
                open={statusDialog}
                onOpenChange={setStatusDialog}
                onConfirm={confirmStatusUpdate}
                bookingId={booking.book_id}
                newStatus={selectedBookingStatus}
                isSubmitting={isUpdatingStatus}
            />

            {/* View Details Dialog */}
            <DetailsDialog open={detailsDialog} onOpenChange={setDetailsDialog} booking={booking} tutors={tutors} />
        </>
    );
}

// Decline Alert Dialog Component
function DeclineAlertDialog({
    open,
    onOpenChange,
    onConfirm,
    bookingId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string) => void;
    bookingId: string;
}) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = () => {
        setIsSubmitting(true);
        onConfirm(reason);
        setIsSubmitting(false);
        setReason('');
    };

    const handleCancel = () => {
        setReason('');
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Decline Booking</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to decline booking <span className="font-semibold text-gray-900">{bookingId}</span>? Please provide a
                        reason below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <textarea
                        className="min-h-[100px] w-full rounded-md border border-gray-300 p-3 text-sm focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        placeholder="Enter reason for declining..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting || !reason.trim()} className="bg-red-600 hover:bg-red-700">
                        {isSubmitting ? 'Declining...' : 'Decline Booking'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Status Update Alert Dialog Component
function StatusUpdateAlertDialog({
    open,
    onOpenChange,
    onConfirm,
    bookingId,
    newStatus,
    isSubmitting,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    bookingId: string;
    newStatus: string;
    isSubmitting: boolean;
}) {
    const statusLabels = {
        processing: 'Processing',
        active: 'Active',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };

    const statusDescriptions = {
        processing: 'Being scheduled',
        active: 'Ongoing sessions',
        completed: 'All sessions done',
        cancelled: 'Booking cancelled',
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Update Booking Status</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to change booking <span className="font-semibold text-gray-900">{bookingId}</span> status to{' '}
                        <span className="font-semibold text-gray-900">{statusLabels[newStatus as keyof typeof statusLabels]}</span>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-600">Status Description:</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                        {statusDescriptions[newStatus as keyof typeof statusDescriptions]}
                    </p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Status'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Details Dialog Component
function DetailsDialog({ open, onOpenChange, booking, tutors }: { open: boolean; onOpenChange: (open: boolean) => void; booking: BookingRow; tutors: Tutor[] }) {
    const [assigningTutor, setAssigningTutor] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState('');

    const handleAssignTutor = () => {
        if (!selectedTutor) {
            toast.error('Please select a tutor');
            return;
        }

        setAssigningTutor(true);
        router.patch(
            `/admin/bookings/${booking.book_id}/assign-tutor`,
            { tutor_id: selectedTutor },
            {
                    onSuccess: () => {
                    toast.success('Tutor assigned successfully', {
                        description: `Assigned tutor to booking ${booking.book_id}`,
                        duration: 4000,
                    });
                    setSelectedTutor('');
                    setAssigningTutor(false);
                    onOpenChange(false);
                    router.reload({ only: ['updated_booking'], data: { booking_id: booking.book_id } });
                },
                onError: () => {
                    toast.error('Failed to assign tutor');
                    setAssigningTutor(false);
                },
            },
        );
    };

    // Format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format program type for display
    const formatProgramType = (type: string) => {
        const types: Record<string, string> = {
            'pre-kinder': 'Pre-Kinder',
            'after-school-academic-tutorial': 'After School',
            'special-tutorial': 'Special Tutorial',
            'art-class': 'Art Class',
            'reading-writing': 'Reading & Writing',
            'weekend-academic-tutorial': 'Weekend Tutorial',
        };
        return types[type] || type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Get status badge with explanation
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', description: 'Awaiting admin approval' },
            approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', description: 'Booking confirmed' },
            declined: { label: 'Declined', color: 'bg-red-100 text-red-800 border-red-200', description: 'Booking rejected' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return config ? (
            <div className="flex flex-col">
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}>{config.label}</span>
                <span className="mt-1 text-xs text-gray-500">{config.description}</span>
            </div>
        ) : null;
    };

    // Get payment badge with explanation
    const getPaymentBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Payment Pending', color: 'bg-orange-100 text-orange-800', description: 'Waiting for payment' },
            partial: { label: 'Downpayment Paid', color: 'bg-blue-100 text-blue-800', description: 'Downpayment received, remaining balance pending' },
            paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800', description: 'Payment received' },
            failed: { label: 'Payment Failed', color: 'bg-red-100 text-red-800', description: 'Payment not completed' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return config ? (
            <div className="flex flex-col">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>{config.label}</span>
                <span className="mt-1 text-xs text-gray-500">{config.description}</span>
            </div>
        ) : null;
    };

    // Get booking status badge with explanation
    const getBookingStatusBadge = (status: string) => {
        const statusConfig = {
            processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', description: 'Being scheduled' },
            active: { label: 'Active', color: 'bg-purple-100 text-purple-800', description: 'Ongoing sessions' },
            completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', description: 'All sessions done' },
            cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', description: 'Booking cancelled' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return config ? (
            <div className="flex flex-col">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>{config.label}</span>
                <span className="mt-1 text-xs text-gray-500">{config.description}</span>
            </div>
        ) : null;
    };

    const learnerPhotoUrl = booking.learner?.photo ? `/storage/${booking.learner.photo}` : undefined;
    const learnerDisplayName = booking.learner?.nickname ? `${booking.learner.name} (${booking.learner.nickname})` : booking.learner?.name || 'N/A';

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-amber-500" />
                        Booking Details
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Complete information for booking <span className="font-semibold text-gray-900">{booking.book_id}</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status Section */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Approval Status */}
                        <div
                            className={`rounded-lg border p-3 ${booking.status === 'approved' ? 'border-green-200 bg-green-50' : booking.status === 'declined' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}
                        >
                            <p className="mb-1 text-xs font-medium text-gray-500">Approval Status</p>
                            <div className="flex items-center gap-1.5">
                                {booking.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                                {booking.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                {booking.status === 'declined' && <XCircle className="h-4 w-4 text-red-600" />}
                                <span
                                    className={`text-sm font-semibold ${booking.status === 'approved' ? 'text-green-700' : booking.status === 'declined' ? 'text-red-700' : 'text-yellow-700'}`}
                                >
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                {booking.status === 'pending'
                                    ? 'Awaiting admin approval'
                                    : booking.status === 'approved'
                                      ? 'Booking confirmed'
                                      : 'Booking rejected'}
                            </p>
                        </div>

                        {/* Booking Progress */}
                        <div
                            className={`rounded-lg border p-3 ${booking.booking_status === 'completed' ? 'border-green-200 bg-green-50' : booking.booking_status === 'active' ? 'border-purple-200 bg-purple-50' : booking.booking_status === 'cancelled' ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'}`}
                        >
                            <p className="mb-1 text-xs font-medium text-gray-500">Booking Progress</p>
                            <div className="flex items-center gap-1.5">
                                {booking.booking_status === 'processing' && <Clock className="h-4 w-4 text-blue-600" />}
                                {booking.booking_status === 'active' && <BookOpen className="h-4 w-4 text-purple-600" />}
                                {booking.booking_status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                {booking.booking_status === 'cancelled' && <XCircle className="h-4 w-4 text-gray-600" />}
                                <span
                                    className={`text-sm font-semibold ${booking.booking_status === 'completed' ? 'text-green-700' : booking.booking_status === 'active' ? 'text-purple-700' : booking.booking_status === 'cancelled' ? 'text-gray-700' : 'text-blue-700'}`}
                                >
                                    {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                {booking.booking_status === 'processing'
                                    ? 'Being scheduled'
                                    : booking.booking_status === 'active'
                                      ? 'Ongoing sessions'
                                      : booking.booking_status === 'completed'
                                        ? 'All sessions done'
                                        : 'Booking cancelled'}
                            </p>
                        </div>

                        {/* Payment Status */}
                        <div
                            className={`rounded-lg border p-3 ${booking.payment_status === 'paid' ? 'border-green-200 bg-green-50' : booking.payment_status === 'partial' ? 'border-blue-200 bg-blue-50' : booking.payment_status === 'failed' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}
                        >
                            <p className="mb-1 text-xs font-medium text-gray-500">Payment Status</p>
                            <div className="flex items-center gap-1.5">
                                {booking.payment_status === 'pending' && <Clock className="h-4 w-4 text-orange-600" />}
                                {booking.payment_status === 'partial' && <Clock className="h-4 w-4 text-blue-600" />}
                                {booking.payment_status === 'paid' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                {booking.payment_status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                                <span
                                    className={`text-sm font-semibold ${booking.payment_status === 'paid' ? 'text-green-700' : booking.payment_status === 'partial' ? 'text-blue-700' : booking.payment_status === 'failed' ? 'text-red-700' : 'text-orange-700'}`}
                                >
                                    {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status === 'partial' ? 'Downpayment Paid' : booking.payment_status === 'failed' ? 'Failed' : 'Pending'}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                {booking.payment_status === 'pending'
                                    ? 'Waiting for payment'
                                    : booking.payment_status === 'partial'
                                      ? 'Downpayment received, remaining balance pending after approval'
                                      : booking.payment_status === 'paid'
                                        ? 'Payment received'
                                        : 'Payment not completed'}
                            </p>
                        </div>
                    </div>

                    {/* Learner Section */}
                    <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                            <User className="h-4 w-4 text-amber-500" />
                            Learner Information
                        </h4>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={learnerPhotoUrl} alt={booking.learner?.name} />
                                <AvatarFallback className="bg-amber-100 text-lg text-amber-700">
                                    {booking.learner?.name?.charAt(0).toUpperCase() || 'L'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900">{learnerDisplayName}</p>
                                <p className="text-sm text-gray-500">ID: {booking.learner_id}</p>
                            </div>
                        </div>
                        {booking.learner?.special_request && (
                            <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
                                <p className="mb-1 text-xs font-medium text-purple-700">Special Request</p>
                                <p className="text-sm text-gray-700">{booking.learner.special_request}</p>
                            </div>
                        )}
                    </div>

                    {/* Parent Section */}
                    <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                            <Users className="h-4 w-4 text-amber-500" />
                            Parent Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{booking.parent?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{booking.parent?.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Program Section */}
                    <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                            <BookOpen className="h-4 w-4 text-amber-500" />
                            Program Details
                        </h4>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <p className="text-xs text-gray-500">Program Name</p>
                                <p className="font-medium text-gray-900">{booking.program?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Program Type</p>
                                <p className="font-medium text-gray-900">
                                    {booking.program?.prog_id ? formatProgramType(booking.program.prog_id) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Program ID</p>
                                <p className="font-medium text-gray-900">{booking.prog_id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Assigned Tutor</p>
                                {booking.tutor ? (
                                    <p className="font-medium text-gray-900">{booking.tutor.name}</p>
                                ) : (
                                    <p className="text-sm text-gray-500">No tutor assigned</p>
                                )}
                            </div>
                        </div>

                        {/* Tutor Assignment Section */}
                        {!booking.tutor && tutors.length > 0 && (
                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="mb-2 text-xs font-medium text-amber-700">Assign a Tutor</p>
                                <div className="flex gap-2">
                                    <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                                        <SelectTrigger className="flex-1 border-amber-200">
                                            <SelectValue placeholder="Select a tutor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tutors.map((tutor) => (
                                                <SelectItem key={tutor.tutor_id} value={tutor.tutor_id}>
                                                    {tutor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="sm"
                                        className="bg-amber-600 hover:bg-amber-700"
                                        onClick={handleAssignTutor}
                                        disabled={assigningTutor || !selectedTutor}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        {assigningTutor ? 'Assigning...' : 'Assign'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Booking Details Section */}
                    <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                            <Calendar className="h-4 w-4 text-amber-500" />
                            Booking Details
                        </h4>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <p className="text-xs text-gray-500">Booking Date</p>
                                <p className="font-medium text-gray-900">{formatDate(booking.book_date)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Number of Sessions</p>
                                <p className="font-medium text-gray-900">{booking.session_count} sessions</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Amount</p>
                                <p className="text-lg font-bold text-emerald-600">{formatPrice(booking.amount)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Created At</p>
                                <p className="font-medium text-gray-900">{formatDate(booking.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info Section */}
                    {(booking.total_paid !== undefined && booking.total_paid > 0) && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                                <DollarSign className="h-4 w-4 text-blue-500" />
                                Payment Information
                            </h4>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div>
                                    <p className="text-xs text-gray-500">Amount Paid</p>
                                    <p className="font-bold text-blue-600">{formatPrice(booking.total_paid)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Remaining Balance</p>
                                    <p className="font-bold text-amber-600">{formatPrice(booking.remaining_balance ?? 0)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Receipts</p>
                                    <p className="font-medium text-gray-900">{booking.receipt_count ?? 0} receipt(s)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes Section */}
                    {booking.notes && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <h4 className="mb-2 font-semibold text-amber-800">Notes</h4>
                            <p className="text-sm text-gray-700">{booking.notes}</p>
                        </div>
                    )}

                    {/* Decline Reason Section */}
                    {booking.decline_reason && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <h4 className="mb-2 font-semibold text-red-800">Decline Reason</h4>
                            <p className="text-sm text-gray-700">{booking.decline_reason}</p>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
export const columns: ColumnDef<BookingRow>[] = [
    {
        accessorKey: 'book_id',
        header: 'Booking ID',
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('book_id')}</span>,
    },
    {
        accessorKey: 'learner',
        header: 'Learner',
        cell: ({ row }) => {
            const learner = row.original.learner;
            const displayName = learner?.nickname ? `${learner.name} (${learner.nickname})` : learner?.name || 'N/A';

            const photoUrl = learner?.photo ? `/storage/${learner.photo}` : undefined;

            return learner ? (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={photoUrl} alt={learner.name} />
                        <AvatarFallback className="bg-amber-100 text-sm text-amber-700">
                            {learner.name?.charAt(0).toUpperCase() || 'L'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-xs text-gray-500">{learner.learner_id}</p>
                    </div>
                </div>
            ) : (
                <span className="text-gray-400">N/A</span>
            );
        },
    },
    {
        accessorKey: 'program',
        header: 'Program',
        cell: ({ row }) => {
            const program = row.original.program;
            return program ? (
                <div>
                    <p className="font-medium">{program.name}</p>
                    <p className="text-xs text-gray-500">{formatProgramType(program.prog_type)}</p>
                </div>
            ) : (
                <span className="text-gray-400">N/A</span>
            );
        },
    },
    {
        accessorKey: 'parent',
        header: 'Parent',
        cell: ({ row }) => {
            const parent = row.original.parent;
            return parent ? (
                <div>
                    <p className="font-medium">{parent.name}</p>
                    <p className="text-xs text-gray-500">{parent.email}</p>
                </div>
            ) : (
                <span className="text-gray-400">N/A</span>
            );
        },
    },
    {
        accessorKey: 'book_date',
        header: 'Date',
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                {formatDate(row.getValue('book_date'))}
            </div>
        ),
    },

    {
        accessorKey: 'status',
        header: 'Admin Status',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
        accessorKey: 'booking_status',
        header: 'Booking Status',
        cell: ({ row }) => <BookingStatusBadge status={row.getValue('booking_status')} />,
    },
];

export const getColumnsWithActions = (tutors: Tutor[]): ColumnDef<BookingRow>[] => [
    ...columns,
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            return <ActionCell booking={row.original} tutors={tutors} />;
        },
    },
];
