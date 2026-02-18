import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, Clock, BookOpen, User, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/dateTimeFormat';

interface Program {
    prog_id: string;
    name: string;
    prog_type: string;
    start_time: string | null;
    end_time: string | null;
    days: string[] | null;
}

interface Learner {
    learner_id: string;
    name: string;
    nickname: string | null;
    photo: string | null;
}

interface Parent {
    name: string;
    email: string;
}

interface Booking {
    book_id: string;
    book_date: string | null;
    session_count: number;
    status: string;
    booking_status: string;
    payment_status: string;
    amount: number;
    notes: string | null;
    program?: Program | null;
    learner?: Learner | null;
    parent?: Parent | null;
}

interface TutorBookingsPageProps {
    bookings: Booking[];
    tutor_id: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutor',
        href: '/tutor/dashboard',
    },
    {
        title: 'Bookings',
        href: '/tutor/bookings',
    },
];

// Helper to convert abbreviated day names to full day names
const formatDays = (days: string[] | string | null): string => {
    if (!days) return '';
    const dayMap: Record<string, string> = {
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday',
        'Sun': 'Sunday',
    };
    const dayArray = Array.isArray(days) ? days : [days];
    return dayArray.map(day => dayMap[day] || day).join(', ');
};

// Helper to format time to 12-hour format with AM/PM
const formatTime12Hour = (time: string | null): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};

// Helper to calculate end date
const calculateEndDate = (startDate: string | null, sessionCount: number): string | null => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + sessionCount);
    return end.toISOString().split('T')[0];
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'approved':
            return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
        case 'rejected':
            return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getPaymentStatusBadge = (status: string) => {
    switch (status) {
        case 'paid':
            return <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>;
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
        case 'partial':
            return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Partial</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function TutorBookings({ bookings, tutor_id }: TutorBookingsPageProps) {
    const activeBookings = bookings.filter(b => b.booking_status === 'active');
    const totalStudents = new Set(bookings.map(b => b.learner?.learner_id)).size;

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
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    My Bookings
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">
                                View your assigned student bookings
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Active Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{activeBookings.length}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-2.5">
                                <User className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Total Sessions</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {activeBookings.reduce((sum, b) => sum + b.session_count, 0)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2.5">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-700">Tutor ID</p>
                                <p className="text-lg font-bold text-gray-900">{tutor_id}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2.5">
                                <User className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings Grid */}
                {bookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => {
                            const endDate = calculateEndDate(booking.book_date, booking.session_count);

                            return (
                                <Card key={booking.book_id} className="border-amber-200 bg-white shadow-md hover:shadow-lg transition-all">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={booking.learner?.photo || undefined} alt={booking.learner?.name} />
                                                    <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                                        {booking.learner?.name?.charAt(0).toUpperCase() || 'S'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                                        {booking.program?.name || 'N/A'}
                                                    </CardTitle>
                                                    <p className="text-sm text-gray-500">
                                                        {booking.learner?.nickname
                                                            ? `${booking.learner.name} (${booking.learner.nickname})`
                                                            : booking.learner?.name || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Booking ID */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <BookOpen className="h-4 w-4 text-amber-500" />
                                            <span className="text-gray-600">Booking ID:</span>
                                            <span className="font-mono text-xs font-medium text-gray-900">{booking.book_id}</span>
                                        </div>

                                        {/* Schedule */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-purple-500" />
                                            <span className="text-gray-600">Schedule:</span>
                                            <span className="font-medium text-gray-900">
                                                {booking.book_date
                                                    ? `${formatDate(booking.book_date)} → ${endDate ? formatDate(endDate) : 'N/A'}`
                                                    : 'N/A'}
                                            </span>
                                        </div>

                                        {/* Sessions */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-amber-500" />
                                            <span className="text-gray-600">Sessions:</span>
                                            <span className="font-medium text-gray-900">{booking.session_count}</span>
                                        </div>

                                        {/* Time */}
                                        {booking.program?.start_time && booking.program?.end_time && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-600">Time:</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatTime12Hour(booking.program.start_time)} - {formatTime12Hour(booking.program.end_time)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Days */}
                                        {booking.program?.days && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-indigo-500" />
                                                <span className="text-gray-600">Days:</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatDays(booking.program.days)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Status */}
                                        <div className="flex items-center gap-2 text-sm">
                                            {getStatusBadge(booking.status)}
                                            {getPaymentStatusBadge(booking.payment_status)}
                                        </div>

                                        {/* Parent */}
                                        {booking.parent && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-600">Parent:</span>
                                                <span className="font-medium text-gray-900">{booking.parent.name}</span>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {booking.notes && (
                                            <div className="rounded bg-gray-50 p-2 text-sm">
                                                <span className="text-gray-600">Notes: </span>
                                                <span className="text-gray-900">{booking.notes}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/50 p-12">
                        <div className="rounded-full bg-amber-100 p-4">
                            <BookOpen className="h-8 w-8 text-amber-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Bookings Yet</h3>
                        <p className="mt-2 text-center text-gray-600">
                            You haven't been assigned any bookings yet.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
