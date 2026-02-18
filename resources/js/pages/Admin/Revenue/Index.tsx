import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { columns } from './column/receipt-column';
import { DataTable } from '../../Components/DataTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Receipt, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface Booking {
    book_id: string;
    learner_id: string;
    program_id: string;
    amount: number;
    status: string;
}

interface PaymentType {
    id: number;
    name: string;
    account_number: string | null;
    account_name: string | null;
    instructions: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ReceiptData {
    receipt_id: string;
    book_id: string;
    amount: number;
    payment_type: string;
    paymentType?: {
        name: string;
    };
    receipt_image?: string | null;
    booking?: Booking;
    created_at: string;
}

interface Stats {
    totalPaid: number;
    netRevenue: number;
    approvedRefunds: number;
    potentialRevenue: number;
    potentialRevenueAfterRefunds: number;
    totalReceipts: number;
    totalBookings: number;
    fullyPaidBookings: number;
}

interface PageProps {
    stats: Stats;
    recentReceipts: ReceiptData[];
    paymentTypeOptions: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Revenue',
        href: '/admin/revenue',
    },
];

export default function Revenue() {
    const pageProps = usePage().props as unknown as PageProps;
    const { stats, recentReceipts, paymentTypeOptions } = pageProps;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revenue" />
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
                                    Revenue
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Track payments and revenue overview</p>
                        </div>
                        <Link href="/admin/refund-requests">
                            <Button variant="outline">View Refund Requests</Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Received</p>
                                <p className="text-2xl font-bold text-amber-700">
                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(stats.totalPaid)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-pink-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Approved Refunds</p>
                                <p className="text-2xl font-bold text-red-700">
                                    -{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(stats.approvedRefunds)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-red-500 to-pink-500 p-2.5">
                                <AlertCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Net Revenue</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(stats.netRevenue)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2.5">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Transactions</p>
                                <p className="text-2xl font-bold text-amber-700">{stats.totalReceipts}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <Receipt className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Fully Paid Bookings</p>
                                <p className="text-2xl font-bold text-amber-700">{stats.fullyPaidBookings} / {stats.totalBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Potential Revenue</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(stats.potentialRevenue)}
                            </p>
                            <p className="text-sm text-gray-600">Total bookings amount</p>
                        </div>
                    </Card>

                    <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">After Refunds</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(stats.potentialRevenueAfterRefunds)}
                            </p>
                            <p className="text-sm text-gray-600">Potential revenue minus approved refunds</p>
                        </div>
                    </Card>
                </div>

                {/* Recent Transactions with DataTable */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold">Recent Transactions</h2>
                    <Card className="border-amber-100">
                        <div className="p-6">
                            <DataTable
                                columns={columns}
                                data={recentReceipts || []}
                                searchKey="book_id"
                                filterOptions={{
                                    'paymentType': paymentTypeOptions || [],
                                }}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
