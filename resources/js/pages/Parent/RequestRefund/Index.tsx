import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    AlertCircle,
    AlertTriangle,
    Calendar,
    Clock,
    User,
    BookOpen,
    DollarSign,
    ChevronRight,
    FileText,
    Shield,
    MessageSquare,
    Send,
    CheckCircle2,
    Info,
    Receipt,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Booking {
    book_id: string;
    program: string;
    learner: {
        learner_id: string;
        name: string;
        nickname: string;
        photo: string | null;
    } | null;
    tutor: string;
    session_count: number;
    book_date: string;
    amount: number;
    payment_status: string;
    booking_status: string;
    total_paid: number;
    remaining_balance: number;
    payment_types?: string;
    receipt_count?: number;
}

interface PageProps {
    bookings: Booking[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Refund Request',
        href: '/parent/request-refund',
    },
];

export default function Home({ bookings }: PageProps) {
    const { props } = usePage();
    const successMessage = (props.flash as any)?.success;

    const [selectedBooking, setSelectedBooking] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('selectedRefundBooking') || '';
        }
        return '';
    });
    const [reason, setReason] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'select' | 'form' | 'confirmation'>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('refundStep');
            if (stored === 'confirmation') {
                return 'confirmation';
            }
        }
        return 'select';
    });
    const [error, setError] = useState<string>('');

    // Show confirmation when success message appears
    useEffect(() => {
        if (successMessage && step === 'form') {
            setStep('confirmation');
            localStorage.setItem('refundStep', 'confirmation');
            localStorage.setItem('selectedRefundBooking', selectedBooking);
        }
    }, [successMessage, step, selectedBooking]);

    // Filter bookings that haven't started yet (book_date is in the future) and have payments
    const eligibleBookings = bookings.filter((booking) => {
        const bookDate = new Date(booking.book_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookDate > today &&
               booking.booking_status !== 'completed' &&
               booking.booking_status !== 'cancelled' &&
               booking.total_paid > 0; // Only show bookings with payments
    });

    const selected = selectedBooking ? eligibleBookings.find((b) => b.book_id === selectedBooking) : null;

    const handleSelectBooking = (bookId: string) => {
        setSelectedBooking(bookId);
        localStorage.setItem('selectedRefundBooking', bookId);
        localStorage.setItem('refundStep', 'form');
        setStep('form');
    };

    const handleBack = () => {
        setStep('select');
        localStorage.setItem('refundStep', 'select');
        setSelectedBooking('');
        localStorage.removeItem('selectedRefundBooking');
        setReason('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedBooking || !reason.trim()) {
            setError('Please select a booking and provide a reason');
            return;
        }

        if (reason.trim().length < 10) {
            setError('Reason must be at least 10 characters');
            return;
        }

        setLoading(true);

        router.post(
            '/parent/request-refund',
            {
                book_id: selectedBooking,
                reason: reason.trim(),
            },
            {
                onFinish: () => setLoading(false),
                onSuccess: () => {
                    toast({
                        title: 'Refund Request Submitted',
                        description: 'Your refund request has been submitted and is pending review.',
                        variant: 'success',
                    });
                },
                onError: (errors: any) => {
                    console.error('Refund request error:', errors);
                    const errorMessage = errors.reason || errors.book_id || 'Failed to submit refund request. Please try again.';
                    setError(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
                },
            },
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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

    const getDaysUntilStart = (dateString: string) => {
        const startDate = new Date(dateString);
        const today = new Date();
        const diffTime = startDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Request Refund" />
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
                                    Request a Refund
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Submit a refund request for your paid amount</p>
                        </div>
                        <Link href="/parent/my-refund-requests">
                            <Button variant="outline" className="border-amber-200 whitespace-nowrap hover:bg-amber-50">
                                View My Requests
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Steps Indicator */}
                {eligibleBookings.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2">
                            <div className={`flex items-center ${step === 'select' ? 'text-orange-600' : 'text-green-600'}`}>
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                        step === 'select'
                                            ? 'bg-orange-600 text-white'
                                            : step === 'confirmation'
                                              ? 'bg-green-600 text-white'
                                              : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {step === 'confirmation' ? <CheckCircle2 className="h-5 w-5" /> : 1}
                                </div>
                                <span className="ml-2 text-sm font-medium">Select Booking</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                            <div
                                className={`flex items-center ${step === 'form' ? 'text-blue-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                        step === 'form'
                                            ? 'bg-blue-600 text-white'
                                            : step === 'confirmation'
                                              ? 'bg-green-600 text-white'
                                              : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {step === 'confirmation' ? <CheckCircle2 className="h-5 w-5" /> : 2}
                                </div>
                                <span className="ml-2 text-sm font-medium">Provide Reason</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                            <div className={`flex items-center ${step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                        step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    3
                                </div>
                                <span className="ml-2 text-sm font-medium">Confirmation</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Alert */}
                <Alert className="border-amber-200 bg-amber-50/50 shadow-sm backdrop-blur-sm">
                    <Info className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="font-semibold text-amber-900">Refund Policy</AlertTitle>
                    <AlertDescription className="text-amber-800">
                        You can request a refund for bookings that haven't started yet. The refund amount will be the total amount you've paid for this booking.
                        Refund requests must be submitted before your session start date. Once approved, refunds are processed through{' '}
                        <strong>Soraya Learning Hub</strong> within 3-5 business days.
                    </AlertDescription>
                </Alert>

                {eligibleBookings.length === 0 ? (
                    <Card className="border-2 border-dashed border-amber-200 bg-white/50 shadow-sm backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="rounded-full bg-amber-100 p-4">
                                <AlertTriangle className="h-12 w-12 text-amber-500" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-gray-900">No Eligible Bookings</h3>
                            <p className="mt-2 max-w-md text-center text-gray-600">
                                You can only request refunds for bookings that haven't started yet and have payments made.
                                Check back when you have upcoming sessions with payments.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6 border-amber-200 hover:bg-amber-50"
                                onClick={() => router.visit('/parent/book-program/bookings')}
                            >
                                View My Bookings
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {step === 'select' && (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {eligibleBookings.map((booking) => {
                                    const daysUntil = getDaysUntilStart(booking.book_date);
                                    return (
                                        <Card
                                            key={booking.book_id}
                                            className="group cursor-pointer border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 transition-all hover:border-amber-300 hover:shadow-md"
                                            onClick={() => handleSelectBooking(booking.book_id)}
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <Badge className="border-amber-200 bg-amber-100 text-amber-700">
                                                        {daysUntil} {daysUntil === 1 ? 'day' : 'days'} left
                                                    </Badge>
                                                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                                        Paid: {formatCurrency(booking.total_paid)}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="mt-2 text-lg">{booking.program}</CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {booking.learner?.name || booking.learner?.nickname}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pb-3">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Starts {formatDate(booking.book_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <BookOpen className="h-4 w-4" />
                                                        <span>{booking.session_count} sessions</span>
                                                    </div>
                                                    {booking.receipt_count && booking.receipt_count > 0 && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Receipt className="h-4 w-4" />
                                                            <span>{booking.receipt_count} payment(s) made</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="border-t border-amber-100 bg-amber-50/30 pt-3">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full transition-colors group-hover:bg-amber-100 group-hover:text-amber-700"
                                                >
                                                    Select Booking
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {step === 'form' && selected && (
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Booking Summary Card */}
                                <div className="lg:col-span-1">
                                    <Card className="sticky top-6 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50/30 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Payment Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                                    <BookOpen className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Program</p>
                                                    <p className="font-semibold">{selected.program}</p>
                                                </div>
                                            </div>

                                            <Separator className="bg-amber-100" />

                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Learner</p>
                                                    <p className="font-semibold">{selected.learner?.name || selected.learner?.nickname}</p>
                                                </div>
                                            </div>

                                            <Separator className="bg-amber-100" />

                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 p-2">
                                                    <Calendar className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Start Date</p>
                                                    <p className="font-semibold">{formatDate(selected.book_date)}</p>
                                                </div>
                                            </div>

                                            <Separator className="bg-amber-100" />

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-2">
                                                        <DollarSign className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Total Booking Amount</p>
                                                        <p className="font-semibold">{formatCurrency(selected.amount)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 p-2">
                                                        <Receipt className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Amount Paid</p>
                                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selected.total_paid)}</p>
                                                        {selected.receipt_count && selected.receipt_count > 1 && (
                                                            <p className="text-xs text-gray-500">From {selected.receipt_count} payments</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {selected.remaining_balance > 0 && (
                                                    <div className="mt-2 rounded-lg bg-amber-50 p-3">
                                                        <p className="text-xs text-amber-800">
                                                            <strong>Note:</strong> You have an outstanding balance of {formatCurrency(selected.remaining_balance)}.
                                                            Only the paid amount of {formatCurrency(selected.total_paid)} will be refunded.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Refund Form */}
                                <div className="lg:col-span-2">
                                    <Card className="border-amber-100 shadow-sm">
                                        <CardHeader className="border-b border-amber-100">
                                            <CardTitle className="flex items-center gap-2">
                                                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-2">
                                                    <MessageSquare className="h-5 w-5 text-white" />
                                                </div>
                                                Refund Request Form
                                            </CardTitle>
                                            <CardDescription>Please provide details about why you're requesting a refund</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {error && (
                                                <Alert className="mb-4 border-red-200 bg-red-50 shadow-sm">
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                                                </Alert>
                                            )}
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="reason" className="text-base font-medium">
                                                        Reason for Refund <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Textarea
                                                        id="reason"
                                                        placeholder="Please explain your reason for requesting a refund..."
                                                        value={reason}
                                                        onChange={(e) => setReason(e.target.value)}
                                                        rows={6}
                                                        className="resize-none border-amber-100 focus:border-amber-300 focus:ring-amber-500"
                                                        required
                                                    />
                                                    <p className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Info className="h-3 w-3" />
                                                        Provide as much detail as possible to help us process your request
                                                    </p>
                                                </div>

                                                {/* Important Notes */}
                                                <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 backdrop-blur-sm">
                                                    <div className="flex items-start gap-3">
                                                        <Shield className="mt-0.5 h-5 w-5 text-amber-600" />
                                                        <div>
                                                            <h4 className="font-semibold text-amber-900">Refund Amount: {formatCurrency(selected.total_paid)}</h4>
                                                            <p className="mt-1 text-sm text-amber-800">
                                                                This is the total amount you've paid for this booking. The refund will be processed
                                                                through <strong>Soraya Learning Hub</strong> and typically takes 3-5 business days
                                                                after approval.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <Clock className="mt-0.5 h-5 w-5 text-amber-600" />
                                                        <div>
                                                            <h4 className="font-semibold text-amber-900">Important Deadline</h4>
                                                            <p className="mt-1 text-sm text-amber-800">
                                                                Your refund request must be submitted before{' '}
                                                                <strong>{formatDate(selected.book_date)}</strong>. Requests after this date may not be
                                                                eligible for refund.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleBack}
                                                        className="flex-1 border-amber-200 hover:bg-amber-50"
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={loading || !reason.trim()}
                                                        className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:from-amber-700 hover:to-orange-700"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="mr-2 h-4 w-4" />
                                                                Submit Request
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {step === 'confirmation' && selected && (
                            <Card className="mx-auto max-w-2xl border-2 border-green-200 bg-green-50/30 shadow-md">
                                <CardContent className="pt-8 pb-6 text-center">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
                                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Request Submitted!</h2>
                                    <p className="mb-6 text-gray-600">
                                        Your refund request for <strong>{selected.program}</strong> has been successfully submitted.
                                    </p>

                                    <div className="mb-6 rounded-lg border border-green-200 bg-white p-4 text-left shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Booking ID</p>
                                                <p className="font-mono font-medium text-gray-900">{selected.book_id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Request Date</p>
                                                <p className="font-medium text-gray-900">{formatDate(new Date().toISOString())}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Amount to Refund</p>
                                                <p className="font-bold text-green-600">{formatCurrency(selected.total_paid)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Status</p>
                                                <Badge className="mt-1 border-yellow-200 bg-yellow-100 text-yellow-800">Pending Review</Badge>
                                            </div>
                                        </div>
                                        {selected.receipt_count && selected.receipt_count > 1 && (
                                            <p className="mt-3 text-xs text-gray-500 border-t border-green-100 pt-3">
                                                This refund includes {selected.receipt_count} separate payments totaling {formatCurrency(selected.total_paid)}.
                                            </p>
                                        )}
                                    </div>

                                    <Alert className="mb-6 border-green-200 bg-green-50 text-left shadow-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-800">
                                            We'll review your request and notify you via email within 2-3 business days. You can track the status in
                                            your refund requests page.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="flex justify-center gap-3">
                                        <Button
                                            variant="outline"
                                            className="border-green-200 hover:bg-green-50"
                                            onClick={() => router.visit('/parent/book-program/bookings')}
                                        >
                                            View My Bookings
                                        </Button>
                                        <Link href="/parent/my-refund-requests">
                                            <Button variant="outline" className="border-green-200 hover:bg-green-50">
                                                View My Requests
                                            </Button>
                                        </Link>
                                        <Button
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:from-green-700 hover:to-emerald-700"
                                            onClick={() => {
                                                setStep('select');
                                                setSelectedBooking('');
                                                setReason('');
                                                localStorage.removeItem('refundStep');
                                                localStorage.removeItem('selectedRefundBooking');
                                            }}
                                        >
                                            Request Another Refund
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
