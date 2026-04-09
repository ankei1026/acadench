import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { CoinsIcon, BookOpen, User, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/dateTimeFormat';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutor',
        href: '/tutor/dashboard',
    },
    {
        title: 'Payroll',
        href: '/tutor/payroll',
    },
];

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
    completed_sessions: number;
    substitution_sessions: number;
    regular_sessions: number;
    total_earned: number;
    pending_amount: number;
    approved_amount: number;
    paid_amount: number;
    base_rate_total: number;
    substitution_bonus_total: number;
    tutor_share_percentage: number;
}

interface Filters {
    year: string | null;
    month: string | null;
}

interface TutorPayrollProps {
    payrolls: PayrollItem[];
    summary: Summary;
    filters: Filters;
    tutor_id: string;
}

export default function TutorPayroll({ payrolls, summary, filters }: TutorPayrollProps) {
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState<string>(filters.year || currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState<string>(filters.month || 'all');

    // Generate year options (last 5 years)
    const yearOptions = useMemo(() => {
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push((currentYear - i).toString());
        }
        return years;
    }, [currentYear]);

    // Month options
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

    const handleFilter = () => {
        router.get(
            '/tutor/payroll',
            {
                year: selectedYear,
                month: selectedMonth === 'all' ? undefined : selectedMonth,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleReset = () => {
        setSelectedYear(currentYear.toString());
        setSelectedMonth('all');
        router.get(
            '/tutor/payroll',
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

    // Calculate filtered total earned
    const filteredTotalEarned = payrolls.reduce((sum, payroll) => sum + (payroll.total_amount || 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Payroll" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <CoinsIcon className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    My Payroll
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">View your earnings and session history</p>
                        </div>
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
                            <p className="mt-2 text-sm text-amber-600">{summary.substitution_sessions || 0} substitution sessions</p>
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
                                    <CoinsIcon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-orange-600">{summary.tutor_share_percentage || 43}% of program price per session</p>
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
                                    <SelectTrigger className="w-32 border-amber-200 focus:ring-amber-500">
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
                                    <SelectTrigger className="w-40 border-amber-200 focus:ring-amber-500">
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
                            <Button onClick={handleFilter} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={handleReset} className="border-amber-200 text-amber-700 hover:bg-amber-50">
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Filtered Total Earned */}
                {(selectedYear || selectedMonth !== 'all') && (
                    <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-amber-600" />
                                <span className="font-medium text-gray-700">
                                    {selectedMonth !== 'all'
                                        ? `${monthOptions.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`
                                        : `Year ${selectedYear}`}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Total Earned in this period</p>
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
                                        <TableHead className="text-right text-amber-700">Program Price</TableHead>
                                        <TableHead className="text-right text-amber-700">Earned ({summary.tutor_share_percentage || 43}%)</TableHead>
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
                                    <CoinsIcon className="h-8 w-8 text-amber-500" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">No Payroll Records</h3>
                                <p className="mt-2 text-gray-600">
                                    {selectedYear || selectedMonth !== 'all'
                                        ? 'No sessions found for the selected period.'
                                        : 'Completed sessions will appear here.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
