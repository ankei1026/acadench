import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { DataTable } from '@/pages/Components/DataTable';
import { columns, type BookingRow } from '@/pages/Parent/BookProgram/column/booking-column';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Book,
    Calendar,
    CheckCircle,
    DollarSign,
    MoreHorizontal,
    Settings,
    Clock,
    User,
    GraduationCap,
    Info,
    XCircle,
    AlertCircle,
    CreditCard,
    TrendingDown,
    CalendarRange,
    Sparkles,
    Coins,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/dateTimeFormat';

interface BookingShowProps {
    bookings: BookingRow[];
    payment_types?: {
        id: number;
        name: string;
        account_number: string | null;
        account_name: string | null;
        instructions: string | null;
        payment_method: string;
    }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Book Program',
        href: '/parent/book-program',
    },
    {
        title: 'My Bookings',
        href: '#',
    },
];

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    declined: 'bg-red-100 text-red-800 border border-red-200',
};

// Helper function to calculate end date
const calculateEndDate = (startDate: string | null, sessionCount: number): string | null => {
    if (!startDate) return null;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + sessionCount);

    return end.toISOString();
};

// Date Range Display Component
const DateRangeDisplay = ({ startDate, sessionCount }: { startDate: string | null; sessionCount: number }) => {
    if (!startDate) {
        return <span className="text-gray-400">N/A</span>;
    }

    const endDate = calculateEndDate(startDate, sessionCount);

    if (sessionCount === 1) {
        return (
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                <span>{formatDate(startDate)}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-amber-500" />
            <div className="flex items-center gap-1">
                <span>{formatDate(startDate)}</span>
                <span className="text-gray-400">→</span>
                <span>{formatDate(endDate!)}</span>
            </div>
        </div>
    );
};

export default function Show({ bookings, payment_types = [] }: BookingShowProps) {
    const [activeBooking, setActiveBooking] = useState<BookingRow | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        receipt_date: '',
        amount: '',
        payment_method: '',
        payment_type_id: '',
        payment_type: '',
        total_booking_amount: '',
        remaining_balance: '',
        receipt_image: null as File | null,
    });

    // Computed values for payment calculations
    const isFullPayment = data.payment_type === 'full_payment';
    const isDownPayment = data.payment_type === 'down_payment' || data.payment_type === 'partial';
    const isFinalPayment = data.payment_type === 'final_payment';
    const isFirstPayment = activeBooking?.is_first_payment ?? true;

    // Calculate remaining balance
    const totalBookingAmount = activeBooking?.amount ?? 0;
    const currentAmount = parseFloat(data.amount) || 0;
    const totalPaid = activeBooking?.total_paid ?? 0;
    const calculatedRemainingBalance = Math.max(0, totalBookingAmount - totalPaid - currentAmount);

    // Get selected payment type info
    const selectedPaymentType = payment_types.find(pt => pt.id.toString() === data.payment_type_id);
    const showAccountNumber = selectedPaymentType &&
        (selectedPaymentType.payment_method === 'gcash' || selectedPaymentType.payment_method === 'bank_transfer');
    const showInstructions = selectedPaymentType && selectedPaymentType.instructions;

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const approvedBookings = bookings.filter((b) => b.status === 'approved').length;
    const paidBookings = bookings.filter((b) => b.payment_status === 'paid').length;
    const uniquePrograms = [...new Set(bookings.map((b) => b.program).filter(Boolean))];

    // Calculate total savings from all bookings
    const totalSavings = bookings.reduce((sum, booking) => {
        if (booking.discount_info && booking.discount_info.original_amount > booking.amount) {
            return sum + (booking.discount_info.original_amount - booking.amount);
        }
        return sum;
    }, 0);

    const openDetails = (row: BookingRow) => {
        setActiveBooking(row);
        setDialogOpen(true);
    };

    const openPay = (row: BookingRow) => {
        setActiveBooking(row);
        reset();
        // Set initial values
        setData({
            receipt_date: new Date().toISOString().split('T')[0],
            amount: '', // Start empty for user to enter
            payment_method: '',
            payment_type_id: '',
            payment_type: '',
            total_booking_amount: row.amount.toString(),
            remaining_balance: '',
            receipt_image: null,
        });
        setPayOpen(true);
    };

    const openCancel = (row: BookingRow) => {
        setActiveBooking(row);
        setCancelOpen(true);
    };

    const handleCancel = () => {
        if (!activeBooking) {
            return;
        }
        router.patch(
            `/parent/book-program/${activeBooking.book_id}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Booking cancelled');
                    setCancelOpen(false);
                },
                onError: () => {
                    toast.error('Unable to cancel booking');
                },
            },
        );
    };

    const handlePay = () => {
        if (!activeBooking) {
            return;
        }
        post(`/parent/book-program/${activeBooking.book_id}/receipt`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Payment submitted');
                setPayOpen(false);
            },
            onError: () => {
                toast.error('Unable to submit payment');
            },
        });
    };

    const handleAmountChange = (value: string) => {
        setData('amount', value);
    };

    const handlePaymentTypeChange = (value: string) => {
        setData('payment_type', value);
        // Reset related fields when payment type changes
        if (value === 'full_payment') {
            // For full payment, set amount to remaining balance
            const remaining = Math.max(0, totalBookingAmount - totalPaid);
            setData('amount', remaining.toString());
            setData('remaining_balance', '0');
        } else if (value === 'final_payment') {
            // For final payment, set amount to remaining balance
            const remaining = Math.max(0, totalBookingAmount - totalPaid);
            setData('amount', remaining.toString());
            setData('remaining_balance', '0');
        } else if (value === 'down_payment' || value === 'partial') {
            // Reset for down payment/partial
            setData('remaining_balance', '');
        }
    };

    const tableColumns = useMemo(() => {
        return [
            ...columns,
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: { row: { original: BookingRow } }) => {
                    const booking = row.original;
                    const canCancel = booking.booking_status === 'processing';
                    const canPay = booking.status === 'approved' && (booking.payment_status === 'pending' || booking.payment_status === 'partial') && booking.booking_status !== 'cancelled';
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-amber-50">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 border-amber-200">
                                <DropdownMenuLabel className="text-gray-700">Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        openDetails(booking);
                                    }}
                                >
                                    <Info className="mr-2 h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                    disabled={!canCancel}
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        if (canCancel) {
                                            openCancel(booking);
                                        }
                                    }}
                                >
                                    Cancel Booking
                                </DropdownMenuItem>
                                {booking.status === 'approved' ? (
                                    <DropdownMenuItem
                                        className="cursor-pointer text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
                                        disabled={!canPay}
                                        onSelect={(event) => {
                                            event.preventDefault();
                                            if (canPay) {
                                                openPay(booking);
                                            }
                                        }}
                                    >
                                        Pay
                                    </DropdownMenuItem>
                                ) : null}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ];
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <Book className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    My Bookings
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">
                                {uniquePrograms.length > 0 ? `Programs: ${uniquePrograms.join(', ')}` : 'View and manage your program bookings'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <Book className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{pendingBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">{approvedBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 p-2.5">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Paid</p>
                                <p className="text-2xl font-bold text-gray-900">{paidBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-2.5">
                                <Coins className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Total Savings Card */}
                    {totalSavings > 0 && (
                        <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Total Savings</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ₱{totalSavings.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2.5">
                                    <TrendingDown className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="p-6">
                        <DataTable
                            columns={tableColumns}
                            data={bookings}
                            searchKey="Program"
                            title="Bookings List"
                            description="View and manage your program bookings"
                        />
                    </div>
                </div>

                {/* View Details Dialog */}
                <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <AlertDialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                    <Book className="h-5 w-5 text-white" />
                                </div>
                                <AlertDialogTitle className="text-xl font-bold text-gray-900">Booking Details</AlertDialogTitle>
                            </div>
                        </AlertDialogHeader>
                        {activeBooking ? (
                            <div className="space-y-4">
                                {/* Status Banner */}
                                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                    <div className="flex items-center gap-2">
                                        {activeBooking.status === 'approved' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                                        {activeBooking.status === 'pending' && <Clock className="h-5 w-5 text-amber-500" />}
                                        {activeBooking.status === 'declined' && <XCircle className="h-5 w-5 text-red-500" />}
                                        <span className="font-semibold text-gray-900">Admin Status</span>
                                    </div>
                                    <Badge className={statusStyles[activeBooking.status] || 'border border-gray-200 bg-gray-100 text-gray-700'}>
                                        {activeBooking.status}
                                    </Badge>
                                </div>

                                {/* Details Grid */}
                                <div className="grid gap-3 text-sm">
                                    <div className="flex items-center justify-between rounded-lg bg-amber-50/50 p-2">
                                        <span className="flex items-center gap-2 font-medium text-gray-700">
                                            <Book className="h-4 w-4 text-amber-500" />
                                            Program
                                        </span>
                                        <span className="text-gray-900">{activeBooking.program ?? 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-blue-50/50 p-2">
                                        <span className="flex items-center gap-2 font-medium text-gray-700">
                                            <User className="h-4 w-4 text-blue-500" />
                                            Learner
                                        </span>
                                        {activeBooking.learner ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={activeBooking.learner.photo || undefined} alt={activeBooking.learner.name} />
                                                    <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                                                        {activeBooking.learner.name?.charAt(0).toUpperCase() || 'L'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-gray-900">
                                                    {activeBooking.learner.nickname
                                                        ? `${activeBooking.learner.name} (${activeBooking.learner.nickname})`
                                                        : activeBooking.learner.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-900">N/A</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-emerald-50/50 p-2">
                                        <span className="flex items-center gap-2 font-medium text-gray-700">
                                            <GraduationCap className="h-4 w-4 text-emerald-500" />
                                            Tutor
                                        </span>
                                        <span className="text-gray-900">{activeBooking.tutor ?? 'Not requested'}</span>
                                    </div>

                                    {/* Combined Date Range */}
                                    <div className="flex items-center justify-between rounded-lg bg-violet-50/50 p-2">
                                        <span className="flex items-center gap-2 font-medium text-gray-700">
                                            <CalendarRange className="h-4 w-4 text-violet-500" />
                                            Schedule
                                        </span>
                                        <span className="text-gray-900">
                                            <DateRangeDisplay
                                                startDate={activeBooking.book_date}
                                                sessionCount={activeBooking.session_count}
                                            />
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-cyan-50/50 p-2">
                                        <span className="flex items-center gap-2 font-medium text-gray-700">
                                            <Clock className="h-4 w-4 text-cyan-500" />
                                            Sessions
                                        </span>
                                        <span className="text-gray-900">{activeBooking.session_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-orange-50/50 p-2">
                                        <span className="flex items-center gap-2 font-medium text-gray-700">
                                            <Coins className="h-4 w-4 text-orange-500" />
                                            Amount
                                        </span>
                                        <div className="text-right">
                                            <span className="font-semibold text-orange-700">₱{activeBooking.amount.toLocaleString()}</span>
                                            {activeBooking.discount_info && activeBooking.discount_info.total_discount > 0 && (
                                                <div className="text-xs text-green-600">
                                                    -{activeBooking.discount_info.total_discount}% discount applied
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Discount Breakdown */}
                                    {activeBooking.discount_info && activeBooking.discount_info.total_discount > 0 && (
                                        <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                                            <div className="mb-2 flex items-center gap-1 text-xs font-medium text-green-700">
                                                <Sparkles className="h-3 w-3" />
                                                Discount Applied
                                            </div>
                                            <div className="space-y-1 text-xs text-gray-600">
                                                <p className="font-medium text-green-600">
                                                    You saved {activeBooking.discount_info.total_discount}% (₱
                                                    {(activeBooking.discount_info.original_amount - activeBooking.amount).toLocaleString()})
                                                </p>
                                                <p>{activeBooking.discount_info.breakdown}</p>
                                                {activeBooking.discount_info.discount_tier && (
                                                    <Badge className="mt-1 bg-green-100 text-green-800 border-green-200">
                                                        {activeBooking.discount_info.discount_tier === 'double'
                                                            ? 'Double Sessions (3% off)'
                                                            : activeBooking.discount_info.discount_tier === 'triple_plus'
                                                            ? 'Triple+ Sessions (5% off)'
                                                            : 'Discounted'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Payment & Booking Status */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                                        <div className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-700">
                                            <Settings className="h-3 w-3" />
                                            Booking Status
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">{activeBooking.booking_status ?? 'N/A'}</div>
                                    </div>
                                    <div className={`rounded-lg border p-3 ${activeBooking.payment_status === 'partial' ? 'border-blue-200 bg-blue-50/50' : 'border-emerald-200 bg-emerald-50/50'}`}>
                                        <div className={`mb-1 flex items-center gap-1 text-xs font-medium ${activeBooking.payment_status === 'partial' ? 'text-blue-700' : 'text-emerald-700'}`}>
                                            <CreditCard className="h-3 w-3" />
                                            Payment Status
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {activeBooking.payment_status === 'partial' ? 'Downpayment Paid' : activeBooking.payment_status ?? 'N/A'}
                                        </div>
                                        {activeBooking.payment_status === 'partial' && activeBooking.remaining_balance !== undefined && activeBooking.remaining_balance > 0 && (
                                            <div className="mt-1 text-xs text-amber-600">
                                                Remaining: ₱{activeBooking.remaining_balance.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {activeBooking.decline_reason ? (
                                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/50 p-3">
                                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                                        <div>
                                            <span className="block text-sm font-medium text-red-700">Decline Reason</span>
                                            <span className="text-sm text-gray-600">{activeBooking.decline_reason}</span>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Booking ID */}
                                <div className="flex items-center justify-between rounded-lg bg-gray-100 p-2 text-xs">
                                    <span className="font-medium text-gray-600">Booking ID</span>
                                    <span className="text-gray-500">{activeBooking.book_id}</span>
                                </div>
                            </div>
                        ) : null}
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-amber-200 text-gray-600 hover:bg-amber-50">Close</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Cancel Confirmation Dialog */}
                <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-red-100 p-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <AlertDialogTitle className="text-xl font-bold text-gray-900">Cancel Booking</AlertDialogTitle>
                            </div>
                        </AlertDialogHeader>
                        <p className="text-sm text-gray-600">Are you sure you want to cancel this booking? This action cannot be undone.</p>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-amber-200 text-gray-600 hover:bg-amber-50">Keep Booking</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600" onClick={handleCancel}>
                                Cancel Booking
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Payment Dialog */}
                <AlertDialog open={payOpen} onOpenChange={setPayOpen}>
                    <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <AlertDialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 p-2">
                                    <CreditCard className="h-5 w-5 text-white" />
                                </div>
                                <AlertDialogTitle className="text-xl font-bold text-gray-900">Submit Payment</AlertDialogTitle>
                            </div>
                        </AlertDialogHeader>
                        <div className="grid gap-4">
                            {/* Show discount info in payment dialog if applicable */}
                            {activeBooking?.discount_info && activeBooking.discount_info.total_discount > 0 && (
                                <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                                    <div className="flex items-center gap-2 text-xs text-green-700">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="font-medium">Discount Applied: {activeBooking.discount_info.total_discount}% off</span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-600">{activeBooking.discount_info.breakdown}</p>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="receipt-date" className="text-gray-700">
                                    <Calendar className="mr-1 inline h-4 w-4" />
                                    Receipt Date
                                </Label>
                                <Input
                                    id="receipt-date"
                                    type="date"
                                    className="border-amber-200 focus:ring-amber-500"
                                    value={data.receipt_date}
                                    onChange={(event) => setData('receipt_date', event.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="payment-method" className="text-gray-700">
                                    <Coins className="mr-1 inline h-4 w-4" />
                                    Payment Method
                                </Label>
                                <Select
                                    value={data.payment_type_id}
                                    onValueChange={(value) => {
                                        setData('payment_type_id', value);
                                        const selected = payment_types.find(pt => pt.id.toString() === value);
                                        if (selected) {
                                            setData('payment_method', selected.payment_method);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="payment-method" className="border-amber-200 focus:ring-amber-500">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {payment_types.map((pt) => (
                                            <SelectItem key={pt.id} value={pt.id.toString()}>
                                                {pt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Show Payment Instructions */}
                                {showInstructions && (
                                    <div className="mt-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                            <div className="text-sm text-blue-700">
                                                {selectedPaymentType.instructions}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Show Account Number for GCash/Bank Transfer */}
                                {showAccountNumber && selectedPaymentType.account_number && (
                                    <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-3">
                                        <div className="text-sm">
                                            <span className="font-medium text-green-700">Account Number: </span>
                                            <span className="text-green-900 font-mono">{selectedPaymentType.account_number}</span>
                                        </div>
                                        {selectedPaymentType.account_name && (
                                            <div className="text-sm mt-1">
                                                <span className="font-medium text-green-700">Account Name: </span>
                                                <span className="text-green-900">{selectedPaymentType.account_name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="payment-type" className="text-gray-700">
                                    <Settings className="mr-1 inline h-4 w-4" />
                                    Payment Type
                                </Label>
                                <Select value={data.payment_type} onValueChange={handlePaymentTypeChange}>
                                    <SelectTrigger id="payment-type" className="border-amber-200 focus:ring-amber-500">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="down_payment">Down Payment</SelectItem>
                                        <SelectItem value="full_payment">Full Payment</SelectItem>
                                        <SelectItem value="partial">Partial Payment</SelectItem>
                                        {!isFirstPayment && (
                                            <SelectItem value="final_payment">Final Payment</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Payment Summary for Down Payment */}
                            {isDownPayment && !isFullPayment && (
                                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                                        <Info className="h-4 w-4" />
                                        Payment Summary
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-gray-600">Total Booking:</span>
                                        <span className="font-medium text-gray-900">₱{totalBookingAmount.toLocaleString()}</span>
                                        <span className="text-gray-600">Amount Paying:</span>
                                        <span className="font-medium text-emerald-600">₱{currentAmount.toLocaleString()}</span>
                                        <span className="text-gray-600">Remaining:</span>
                                        <span className="font-medium text-red-600">₱{calculatedRemainingBalance.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="amount" className="text-gray-700">
                                    <Coins className="mr-1 inline h-4 w-4" />
                                    Amount {isFullPayment && <span className="text-xs text-gray-400">(Fixed)</span>}
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min={500}
                                    className="border-amber-200 focus:ring-amber-500"
                                    value={data.amount}
                                    onChange={(event) => handleAmountChange(event.target.value)}
                                    disabled={isFullPayment}
                                    placeholder={isFullPayment ? `₱${Math.max(0, totalBookingAmount - totalPaid).toLocaleString()}` : "Enter amount (min ₱500)"}
                                />
                                {!isFullPayment && (
                                    <p className="text-xs text-gray-500">Minimum payment: ₱500</p>
                                )}
                            </div>

                            {/* Only show these fields for down payment / partial */}
                            {!isFullPayment && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="total-amount" className="text-gray-700">
                                            <Info className="mr-1 inline h-4 w-4" />
                                            Total Booking Amount
                                        </Label>
                                        <Input
                                            id="total-amount"
                                            type="number"
                                            className="border-amber-200 focus:ring-amber-500 bg-gray-50"
                                            value={data.total_booking_amount}
                                            disabled
                                            onChange={(event) => setData('total_booking_amount', event.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="remaining-balance" className="text-gray-700">
                                            <AlertCircle className="mr-1 inline h-4 w-4" />
                                            Remaining Balance
                                        </Label>
                                        <Input
                                            id="remaining-balance"
                                            type="number"
                                            className="border-amber-200 focus:ring-amber-500 bg-gray-50"
                                            value={calculatedRemainingBalance.toString()}
                                            disabled
                                        />
                                    </div>

                                </>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="receipt-image" className="text-gray-700">
                                    <CreditCard className="mr-1 inline h-4 w-4" />
                                    Receipt Image
                                </Label>
                                <Input
                                    id="receipt-image"
                                    type="file"
                                    accept="image/*"
                                    className="border-amber-200 focus:ring-amber-500"
                                    onChange={(event) => setData('receipt_image', event.target.files?.[0] ?? null)}
                                />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-amber-200 text-gray-600 hover:bg-amber-50">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                                onClick={handlePay}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Submit Payment
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
