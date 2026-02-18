import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '../../Components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, XCircle, Clock, DollarSign, FileText } from 'lucide-react';

interface RefundRequest {
    refund_request_id: string;
    book_id: string;
    reason: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
    booking: {
        book_id: string;
        program_name: string;
        learner_name: string;
        parent_name: string;
        parent_email: string;
        book_date: string;
        total_amount: number;
        total_paid: number;
    };
}

interface Stats {
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
    total_refunded: number;
}

interface PageProps {
    refundRequests: RefundRequest[];
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Refund Requests',
        href: '/admin/refund-requests',
    },
];

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

// Status badge component
const getStatusBadge = (status: string) => {
    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
        approved: { label: 'Approved', color: 'bg-green-100 text-green-800 hover:bg-green-100' },
        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? (
        <Badge className={config.color}>
            {config.label}
        </Badge>
    ) : null;
};

// Column definitions
const getColumns = (): ColumnDef<RefundRequest>[] => [
    {
        accessorKey: 'refund_request_id',
        header: 'Refund ID',
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('refund_request_id')}</span>,
    },
    {
        accessorKey: 'booking',
        header: 'Learner',
        cell: ({ row }) => {
            const booking = row.original.booking;
            return (
                <div>
                    <div className="font-medium text-gray-900">{booking.learner_name}</div>
                    <div className="text-sm text-gray-500">{booking.parent_name}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'booking',
        header: 'Program',
        cell: ({ row }) => <span className="text-gray-700">{row.original.booking.program_name}</span>,
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span className="font-semibold text-green-600">{formatPrice(row.getValue('amount'))}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
        accessorKey: 'created_at',
        header: 'Requested',
        cell: ({ row }) => <span className="text-sm text-gray-600">{formatDate(row.getValue('created_at'))}</span>,
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
            <Link href={`/admin/refund-requests/${row.original.refund_request_id}`}>
                <Button variant="outline" size="sm" className="border-amber-200 hover:bg-amber-50">
                    View
                </Button>
            </Link>
        ),
    },
];

export default function RefundRequestsIndex({ refundRequests, stats }: PageProps) {
    const columns = getColumns();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Refund Requests" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Refund Requests
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Manage and process customer refund requests</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_requests}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 p-2.5">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending_requests}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 p-2.5">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.approved_requests}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2.5">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-700">Rejected</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.rejected_requests}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-red-500 to-rose-500 p-2.5">
                                <XCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Total Refunded</p>
                                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.total_refunded)}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-2.5">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="p-6">
                        <DataTable
                            columns={columns}
                            data={refundRequests}
                            searchKey="refund_request_id"
                            filterOptions={{
                                status: ['pending', 'approved', 'rejected'],
                            }}
                            title="Refund Requests"
                            description="View and manage all refund requests"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
