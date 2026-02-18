import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface RefundRequest {
    refund_request_id: string;
    book_id: string;
    reason: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
}

interface Booking {
    book_id: string;
    program_name: string;
    learner_name: string;
    learner_id: string;
    parent_name: string;
    parent_email: string;
    book_date: string;
    session_count: number;
    total_amount: number;
    total_paid: number;
    remaining_balance: number;
}

interface Receipt {
    receipt_id: string;
    amount: number;
    payment_type: string;
    receipt_date: string;
    created_at: string;
}

interface PageProps {
    refundRequest: RefundRequest;
    booking: Booking;
    receipts: Receipt[];
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
    {
        title: 'Refund Details',
        href: '/admin/refund-requests/:id',
    },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
        case 'approved':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
        case 'rejected':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
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

export default function RefundRequestShow({ refundRequest, booking, receipts }: PageProps) {
    const [approveNotes, setApproveNotes] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');
    const [showApproveForm, setShowApproveForm] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.patch(
            `/admin/refund-requests/${refundRequest.refund_request_id}/approve`,
            { admin_notes: approveNotes },
            {
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.patch(
            `/admin/refund-requests/${refundRequest.refund_request_id}/reject`,
            { admin_notes: rejectNotes },
            {
                onFinish: () => setLoading(false),
            }
        );
    };

    const isProcessed = refundRequest.status !== 'pending';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Refund Request - ${refundRequest.refund_request_id}`} />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{refundRequest.refund_request_id}</h1>
                        <p className="text-gray-600 mt-2">
                            Submitted on {formatDate(refundRequest.created_at)}
                        </p>
                    </div>
                    <div className="text-right">
                        {getStatusBadge(refundRequest.status)}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Booking Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-gray-600">PROGRAM</Label>
                                        <p className="font-semibold">{booking.program_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-600">LEARNER</Label>
                                        <p className="font-semibold">{booking.learner_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-600">SESSION START DATE</Label>
                                        <p className="font-semibold">{new Date(booking.book_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-600">SESSIONS</Label>
                                        <p className="font-semibold">{booking.session_count}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Booking Amount:</span>
                                        <span className="font-semibold">₱{booking.total_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount Paid:</span>
                                        <span className="font-semibold">₱{booking.total_paid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="text-gray-600">Remaining Balance:</span>
                                        <span className="font-semibold text-blue-600">₱{booking.remaining_balance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parent Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Parent Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs text-gray-600">NAME</Label>
                                    <p className="font-semibold">{booking.parent_name}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-600">EMAIL</Label>
                                    <p className="font-semibold text-blue-600">{booking.parent_email}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Refund Reason */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Reason for Refund</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {refundRequest.reason}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Payment History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment History</CardTitle>
                                <CardDescription>{receipts.length} payments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Receipt ID</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Payment Type</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {receipts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                                                    No payments recorded
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            receipts.map((receipt) => (
                                                <TableRow key={receipt.receipt_id}>
                                                    <TableCell className="font-mono text-sm">{receipt.receipt_id}</TableCell>
                                                    <TableCell className="font-semibold">₱{receipt.amount.toLocaleString()}</TableCell>
                                                    <TableCell>{receipt.payment_type}</TableCell>
                                                    <TableCell className="text-sm text-gray-600">
                                                        {formatDate(receipt.created_at)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Admin Notes */}
                        {refundRequest.admin_notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {refundRequest.admin_notes}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Refund Amount Summary */}
                        <Card className="border-2 border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="text-lg">Refund Amount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-blue-600 text-center">
                                    ₱{refundRequest.amount.toLocaleString()}
                                </div>
                                <p className="text-sm text-gray-600 text-center mt-3">
                                    To be refunded via Soraya Learning Hub
                                </p>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        {!isProcessed ? (
                            <div className="space-y-3">
                                <Button
                                    onClick={() => setShowApproveForm(true)}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Refund
                                </Button>
                                <Button
                                    onClick={() => setShowRejectForm(true)}
                                    variant="destructive"
                                    className="w-full"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Request
                                </Button>
                            </div>
                        ) : (
                            <Alert className="border-l-4 border-blue-500 bg-blue-50">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-900">
                                    This request has been {refundRequest.status}.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Approval Form */}
                        {showApproveForm && !isProcessed && (
                            <Card className="border-green-200">
                                <CardHeader>
                                    <CardTitle className="text-base">Approve Refund</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleApprove} className="space-y-4">
                                        <div>
                                            <Label htmlFor="approve-notes" className="text-sm">
                                                Notes (Optional)
                                            </Label>
                                            <Textarea
                                                id="approve-notes"
                                                placeholder="Add any notes for processing..."
                                                value={approveNotes}
                                                onChange={(e) => setApproveNotes(e.target.value)}
                                                rows={4}
                                                className="resize-none text-sm"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                {loading ? 'Processing...' : 'Confirm Approval'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setShowApproveForm(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Rejection Form */}
                        {showRejectForm && !isProcessed && (
                            <Card className="border-red-200">
                                <CardHeader>
                                    <CardTitle className="text-base">Reject Request</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleReject} className="space-y-4">
                                        <div>
                                            <Label htmlFor="reject-notes" className="text-sm">
                                                Reason for Rejection <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="reject-notes"
                                                placeholder="Explain why you're rejecting this request..."
                                                value={rejectNotes}
                                                onChange={(e) => setRejectNotes(e.target.value)}
                                                rows={4}
                                                className="resize-none text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={loading || !rejectNotes.trim()}
                                                variant="destructive"
                                                className="flex-1"
                                            >
                                                {loading ? 'Processing...' : 'Confirm Rejection'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setShowRejectForm(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Important Note */}
                        <Alert className="bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-900 text-sm">
                                <strong>Important:</strong> Approved refunds will be processed through Soraya Learning Hub.
                                Ensure all details are correct before approval.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
