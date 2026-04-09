import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { DollarSign, BookOpen, User, FileText, Calendar, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/dateTimeFormat';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Payroll',
        href: '/admin/payroll',
    },
];

interface Tutor {
    tutor_id: string;
    name: string;
}

interface PayrollItem {
    payroll_id: string;
    session_id: string;
    session_date: string;
    program_name: string;
    learner_name: string;
    program_price: number;
    tutor_share_percentage: number;
    base_rate: number;
    substitution_bonus: number;
    total_amount: number;
    status: string;
    is_substitution: boolean;
    attendance_status: string | null;
    notes: string | null;
    paid_at: string | null;
    created_at: string;
}

interface Summary {
    total_sessions: number;
    total_earned: number;
    substitution_sessions: number;
    tutor_share_percentage: number;
    pending_amount: number;
    approved_amount: number;
    paid_amount: number;
}

interface Filters {
    tutor_id: string | null;
    year: string | null;
    month: string | null;
    status: string;
}

interface AdminPayrollProps {
    tutors: Tutor[];
    selectedTutor: Tutor | null;
    payrolls: PayrollItem[];
    summary: Summary;
    filters: Filters;
}

export default function AdminPayroll({ tutors, selectedTutor, payrolls, summary, filters }: AdminPayrollProps) {
    const currentYear = new Date().getFullYear();

    const [selectedTutorId, setSelectedTutorId] = useState<string>(filters.tutor_id || '');
    const [selectedYear, setSelectedYear] = useState<string>(filters.year || currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState<string>(filters.month || 'all');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');

    const yearOptions = useMemo(() => {
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push((currentYear - i).toString());
        }
        return years;
    }, [currentYear]);

    const monthOptions = [
        { value: 'all', label: 'All Months' },
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'paid', label: 'Paid' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const handleFilter = () => {
        if (!selectedTutorId) return;

        router.get(
            '/admin/payroll',
            {
                tutor_id: selectedTutorId,
                year: selectedYear,
                month: selectedMonth === 'all' ? undefined : selectedMonth,
                status: selectedStatus === 'all' ? undefined : selectedStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleReset = () => {
        setSelectedTutorId('');
        setSelectedYear(currentYear.toString());
        setSelectedMonth('all');
        setSelectedStatus('all');
        router.get(
            '/admin/payroll',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const formatCurrency = (amount: number) => {
        if (isNaN(amount) || amount === null || amount === undefined) {
            return '₱0.00';
        }
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'approved':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-blue-600" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 text-amber-600" />;
        }
    };

    const filteredTotalEarned = payrolls.reduce((sum, payroll) => sum + (payroll.total_amount || 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Management" />

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
                                    Payroll Management
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Manage tutor payroll and payments</p>
                        </div>
                    </div>
                </div>

                {/* Tutor Selection */}
                <Card className="border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 space-y-1">
                                <Label className="text-amber-700">Select Tutor</Label>
                                <Select value={selectedTutorId} onValueChange={setSelectedTutorId}>
                                    <SelectTrigger className="border-amber-200 focus:ring-amber-500">
                                        <SelectValue placeholder="Choose a tutor to view payroll" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tutors.map((tutor) => (
                                            <SelectItem key={tutor.tutor_id} value={tutor.tutor_id}>
                                                {tutor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleFilter}
                                disabled={!selectedTutorId}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                            >
                                <Search className="mr-2 h-4 w-4" />
                                View Payroll
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {selectedTutor && (
                    <>
                        {/* Tutor Info & Summary */}
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-amber-600" />
                                <span className="font-medium text-gray-700">Viewing payroll for:</span>
                                <span className="font-bold text-amber-800">{selectedTutor.name}</span>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-amber-700">Total Sessions</p>
                                            <p className="text-3xl font-bold text-gray-900">{summary.total_sessions || 0}</p>
                                        </div>
                                        <div className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 p-3">
                                            <BookOpen className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-amber-600">{summary.substitution_sessions || 0} substitutions</p>
                                </CardContent>
                            </Card>

                            <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-orange-700">Total Earned</p>
                                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.total_earned)}</p>
                                        </div>
                                        <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-3">
                                            <DollarSign className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-orange-600">{summary.tutor_share_percentage || 43}% of program price</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card className="border-amber-200">
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-amber-700">Year</Label>
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger className="w-32 border-amber-200">
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearOptions.map((year) => (
                                                    <SelectItem key={year} value={year}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-amber-700">Month</Label>
                                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                            <SelectTrigger className="w-40 border-amber-200">
                                                <SelectValue placeholder="All Months" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthOptions.map((month) => (
                                                    <SelectItem key={month.value} value={month.value}>
                                                        {month.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleFilter}
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                    >
                                        Apply Filters
                                    </Button>
                                    <Button variant="outline" onClick={handleReset} className="border-amber-200 text-amber-700 hover:bg-amber-50">
                                        Reset
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Filtered Total */}
                        {(selectedYear || selectedMonth !== 'all' || selectedStatus !== 'all') && (
                            <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-amber-600" />
                                        <span className="font-medium text-gray-700">Filtered Total</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-amber-700">{formatCurrency(filteredTotalEarned)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payroll Table */}
                        <Card className="border-amber-200">
                            <CardHeader className="border-b border-amber-100">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-amber-800">
                                    <FileText className="h-5 w-5 text-amber-500" />
                                    Session Earnings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {payrolls.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-amber-50">
                                                <TableHead className="text-amber-700">Date</TableHead>
                                                <TableHead className="text-amber-700">Program</TableHead>
                                                <TableHead className="text-amber-700">Learner</TableHead>
                                                <TableHead className="text-amber-700">Type</TableHead>
                                                <TableHead className="text-right text-amber-700">Program Price</TableHead>
                                                <TableHead className="text-right text-amber-700">Earned (43%)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payrolls.map((payroll) => (
                                                <TableRow key={payroll.payroll_id} className="border-amber-100 hover:bg-amber-50/50">
                                                    <TableCell className="font-medium">{formatDate(payroll.session_date)}</TableCell>
                                                    <TableCell>{payroll.program_name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3 text-amber-400" />
                                                            {payroll.learner_name || 'N/A'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {payroll.is_substitution ? (
                                                            <Badge className="bg-purple-100 text-purple-700">Substitution</Badge>
                                                        ) : (
                                                            <Badge className="bg-gray-100 text-gray-700">Regular</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">{formatCurrency(payroll.program_price)}</TableCell>
                                                    <TableCell className="text-right font-semibold text-amber-700">
                                                        {formatCurrency(payroll.total_amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 p-4">
                                            <DollarSign className="h-8 w-8 text-amber-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Payroll Records</h3>
                                        <p className="mt-2 text-gray-600">No payroll records found for this tutor.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {!selectedTutor && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/50 p-12">
                        <div className="rounded-full bg-amber-100 p-4">
                            <Search className="h-8 w-8 text-amber-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Select a Tutor</h3>
                        <p className="mt-2 text-center text-gray-600">Choose a tutor from the dropdown above to view their payroll records.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
