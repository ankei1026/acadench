import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, AlertCircle, DollarSign, FileText } from 'lucide-react';

interface Booking {
    book_id: string;
    program_name: string;
    learner_name: string;
    book_date: string;
}

interface RefundRequest {
    refund_request_id: string;
    book_id: string;
    reason: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
    booking: Booking;
}

interface PageProps {
    refundRequests: RefundRequest[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Refund Request',
        href: '/parent/request-refund',
    },
    {
        title: 'My Requests',
        href: '/parent/my-refund-requests',
    },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return (
                <Badge className="flex w-fit items-center gap-1 border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    <Clock className="h-3 w-3" />
                    Pending
                </Badge>
            );
        case 'approved':
            return (
                <Badge className="flex w-fit items-center gap-1 border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3" />
                    Approved
                </Badge>
            );
        case 'rejected':
            return (
                <Badge className="flex w-fit items-center gap-1 border-red-200 bg-red-100 text-red-800 hover:bg-red-100">
                    <XCircle className="h-3 w-3" />
                    Rejected
                </Badge>
            );
        default:
            return <Badge>{status}</Badge>;
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function MyRefundRequests({ refundRequests }: PageProps) {
    const pendingCount = refundRequests.filter((r) => r.status === 'pending').length;
    const approvedCount = refundRequests.filter((r) => r.status === 'approved').length;
    const rejectedCount = refundRequests.filter((r) => r.status === 'rejected').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Refund Requests" />
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
                                    My Refund Requests
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Track the status of your refund requests</p>
                        </div>
                        <Link href="/parent/request-refund">
                            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:from-amber-700 hover:to-orange-700">
                                <DollarSign className="mr-2 h-4 w-4" />
                                Request New Refund
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{refundRequests.length}</p>
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
                                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
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
                                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
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
                                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-red-500 to-rose-500 p-2.5">
                                <XCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refund Requests Table */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle>Request History</CardTitle>
                        <CardDescription>{refundRequests.length} total requests submitted</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                        <TableHead>Request ID</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Learner</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Requested</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {refundRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No refund requests found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        refundRequests.map((request) => (
                                            <TableRow key={request.refund_request_id} className="border-b border-gray-100 hover:bg-amber-50/30">
                                                <TableCell className="font-mono text-sm text-gray-600">{request.refund_request_id}</TableCell>
                                                <TableCell className="font-medium text-gray-900">{request.booking.program_name}</TableCell>
                                                <TableCell className="text-gray-700">{request.booking.learner_name}</TableCell>
                                                <TableCell className="font-semibold text-green-600">
                                                    {formatCurrency(request.amount)}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">{formatDate(request.created_at)}</TableCell>
                                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Approved Requests Details */}
                {refundRequests.filter((r) => r.status === 'approved').length > 0 && (
                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/30 shadow-sm">
                        <CardHeader className="border-b border-green-100">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                Approved Refunds
                            </CardTitle>
                            <CardDescription>These requests have been approved and will be processed</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-4">
                                {refundRequests
                                    .filter((r) => r.status === 'approved')
                                    .map((request) => (
                                        <div key={request.refund_request_id} className="rounded-lg border border-green-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{request.booking.program_name}</h4>
                                                    <p className="text-sm text-gray-600">Learner: {request.booking.learner_name}</p>
                                                    <p className="mt-2 text-sm text-gray-700">
                                                        <strong>Refund Amount:</strong> {formatCurrency(request.amount)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(request.status)}
                                                </div>
                                            </div>

                                            {request.admin_notes && (
                                                <Alert className="mt-3 border-blue-200 bg-blue-50 text-sm">
                                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                                    <AlertDescription className="text-blue-900">
                                                        <strong>Admin Notes:</strong> {request.admin_notes}
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <Alert className="mt-3 border-green-200 bg-green-50 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <AlertDescription className="text-green-900">
                                                    Your refund will be processed through <strong>Soraya Learning Hub</strong> within 3-5 business
                                                    days. You'll receive an email confirmation when the refund is completed.
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Rejected Requests Details */}
                {refundRequests.filter((r) => r.status === 'rejected').length > 0 && (
                    <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50/30 shadow-sm">
                        <CardHeader className="border-b border-red-100">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className="rounded-lg bg-gradient-to-r from-red-500 to-rose-500 p-2">
                                    <XCircle className="h-5 w-5 text-white" />
                                </div>
                                Rejected Requests
                            </CardTitle>
                            <CardDescription>These requests were not approved</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-4">
                                {refundRequests
                                    .filter((r) => r.status === 'rejected')
                                    .map((request) => (
                                        <div key={request.refund_request_id} className="rounded-lg border border-red-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{request.booking.program_name}</h4>
                                                    <p className="text-sm text-gray-600">Learner: {request.booking.learner_name}</p>
                                                    <p className="mt-2 text-sm text-gray-700">
                                                        <strong>Requested Amount:</strong> {formatCurrency(request.amount)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(request.status)}
                                                </div>
                                            </div>

                                            {request.admin_notes && (
                                                <Alert className="mt-3 border-red-200 bg-red-50 text-sm">
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                    <AlertDescription className="text-red-900">
                                                        <strong>Reason for Rejection:</strong> {request.admin_notes}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
