import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DataTable } from '../../Components/DataTable';
import { getColumnsWithActions } from './column/booking-column';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bookings',
        href: '/admin/bookings',
    },
];

interface Booking {
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
    };
    program?: {
        prog_id: string;
        name: string;
        prog_type: string;
    };
    tutor?: {
        tutor_id: string;
        name: string;
    };
}

interface Tutor {
    tutor_id: string;
    name: string;
}

interface BookingsPageProps {
    bookings: Booking[];
    available_tutors: Tutor[];
    updated_booking?: Booking | null;
}

import { useEffect, useState } from 'react';

export default function Bookings({ bookings, available_tutors, updated_booking }: BookingsPageProps) {
    const [bookingList, setBookingList] = useState<Booking[]>(bookings);

    useEffect(() => {
        if (updated_booking) {
            setBookingList((prev) => prev.map((b) => (b.book_id === updated_booking.book_id ? updated_booking : b)));
        }
    }, [updated_booking]);
    const handleRefresh = () => {
        router.reload({
            only: ['bookings'],
            onSuccess: () => {
                // Toast notification could be added here
            },
        });
    };

    // Calculate stats
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const approvedBookings = bookings.filter((b) => b.status === 'approved').length;
    const declinedBookings = bookings.filter((b) => b.status === 'declined').length;

    const columns = getColumnsWithActions(available_tutors);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings" />
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
                                    Bookings
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Manage and review booking requests</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                                {totalBookings} Total Bookings
                            </Badge>
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
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{pendingBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 p-2.5">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">{approvedBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2.5">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-700">Declined</p>
                                <p className="text-2xl font-bold text-gray-900">{declinedBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-red-500 to-rose-500 p-2.5">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="p-6">
                        <DataTable
                            columns={columns}
                            data={bookingList}
                            searchKey="book_id"
                            filterOptions={{
                                status: ['pending', 'approved', 'declined'],
                            }}
                            title="Bookings List"
                            description="View and manage all booking requests"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
