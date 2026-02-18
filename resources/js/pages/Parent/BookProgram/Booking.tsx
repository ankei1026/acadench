import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Calendar,
    Coins,
    Users,
    Settings,
    Info,
    BookOpen,
    GraduationCap,
    CalendarCheck,
    CreditCard,
    TrendingDown,
    Tag,
    Sparkles,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

// Update the Program interface to include dynamic pricing with discount_tier
interface Program {
    prog_id: string;
    name: string;
    prog_type: string;
    description?: string | null;
    days: string[] | string | null;
    start_time: string;
    end_time: string;
    price: number | string;
    session_count: number;
    setting?: string;
    // Add dynamic pricing fields with discount_tier
    dynamic_pricing?: {
        base_price: number;
        final_price: number;
        price_per_session: number;
        session_discount: number;
        setting_discount: number;
        time_discount: number;
        day_discount: number;
        total_discount: number;
        formatted_total: string;
        formatted_per_session: string;
        breakdown: string;
        discount_tier?: 'minimum' | 'double' | 'triple_plus' | null; // Add discount_tier
        min_sessions_required?: number; // Add minimum sessions required
    } | null;
}

interface LearnerOption {
    learner_id: string;
    display_name: string;
    photo?: string | null;
}

interface TutorOption {
    tutor_id: string;
    name: string;
    subject?: string | null;
    photo?: string | null;
}

// Add pricing options interface
interface PricingOption {
    sessions: number;
    total: number;
    per_session: number;
    discount: number;
    formatted_total: string;
    formatted_per_session: string;
    savings: string | null;
}

interface PaymentTypeOption {
    id: number;
    name: string;
    account_number: string | null;
    account_name: string | null;
    instructions: string | null;
    payment_method: string;
}

interface BookingPageProps {
    program: Program;
    learners: LearnerOption[];
    tutors: TutorOption[];
    pricing_options?: PricingOption[];
    pricing_api_healthy?: boolean;
    using_dynamic_pricing?: boolean;
    payment_types?: PaymentTypeOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Book Program',
        href: '/parent/book-program',
    },
    {
        title: 'Book',
        href: '#',
    },
];

const parseDays = (days: Program['days']): string[] => {
    if (Array.isArray(days)) {
        return days;
    }
    if (!days) {
        return [];
    }
    try {
        const parsed = JSON.parse(days as string);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        if (typeof days === 'string') {
            return days
                .split(',')
                .map((day) => day.trim())
                .filter((day) => day.length > 0);
        }
        return [];
    }
};

const formatTime = (timeString: string) => {
    try {
        const time = timeString.length === 5 ? `${timeString}:00` : timeString;
        const date = new Date(`2000-01-01T${time}`);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return timeString;
    }
};

const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numPrice);
};

const formatProgramType = (type: string) => {
    const types: Record<string, string> = {
        'pre-kinder': 'Pre-Kinder',
        'after-school-academic-tutorial': 'After School',
        'special-tutorial': 'Special Tutorial',
        'art-class': 'Art Class',
        'reading-writing': 'Reading & Writing',
        'weekend-academic-tutorial': 'Weekend Tutorial',
    };
    return types[type] || type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getProgramTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        'pre-kinder': 'bg-amber-100 text-amber-800 border border-amber-200',
        'after-school-academic-tutorial': 'bg-blue-100 text-blue-800 border border-blue-200',
        'special-tutorial': 'bg-violet-100 text-violet-800 border border-violet-200',
        'art-class': 'bg-pink-100 text-pink-800 border border-pink-200',
        'reading-writing': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        'weekend-academic-tutorial': 'bg-teal-100 text-teal-800 border border-teal-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border border-gray-200';
};

// Helper function to get discount tier text
const getDiscountTierText = (tier: string | undefined, minSessions: number = 0): string => {
    switch (tier) {
        case 'double':
            return `Double sessions (2x minimum = ${minSessions * 2} sessions)`;
        case 'triple_plus':
            return `Triple+ sessions (${minSessions * 3}+ sessions)`;
        case 'minimum':
        default:
            return 'Bulk discount';
    }
};

export default function Booking({
    program,
    learners,
    tutors,
    pricing_options = [],
    pricing_api_healthy = false,
    using_dynamic_pricing = false,
    payment_types = [],
}: BookingPageProps) {
    const daysArray = parseDays(program.days);
    const daysSummary = daysArray.join(', ');

    // State for loading pricing updates
    const [isLoadingPricing, setIsLoadingPricing] = useState(false);
    const [currentPricing, setCurrentPricing] = useState(program.dynamic_pricing);
    const [pricingError, setPricingError] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        prog_id: program.prog_id,
        learner_id: '',
        book_date: '',
        session_count: program.session_count || 1,
        notes: '',
        request_tutor: false,
        tutor_id: '',
        amount: program.dynamic_pricing?.final_price || Number(program.price) * (program.session_count || 1),
        // Downpayment fields
        downpayment_amount: '' as string | number,
        payment_type_id: '',
        receipt_image: null as File | null,
    });

    // Debug log to see what's coming from the API
    useEffect(() => {
        console.log('Current Pricing Data:', currentPricing);
        console.log('Program Data:', program);
        console.log('Original Total Calculation:', {
            base_price: currentPricing?.base_price,
            session_count: data.session_count,
            originalTotal: currentPricing?.base_price ? currentPricing.base_price * data.session_count : Number(program.price) * data.session_count,
            program_price: Number(program.price),
            discount_tier: currentPricing?.discount_tier,
            min_sessions_required: currentPricing?.min_sessions_required,
        });
    }, [currentPricing, data.session_count, program]);

    // Function to fetch pricing
    const fetchPricing = useCallback(
        async (sessionCount: number, bookDate?: string) => {
            if (!using_dynamic_pricing) {
                // If not using dynamic pricing, just update amount based on static price
                setData('amount', Number(program.price) * sessionCount);
                return;
            }

            setIsLoadingPricing(true);
            setPricingError(null);

            try {
                const params = new URLSearchParams({
                    prog_id: program.prog_id,
                    session_count: sessionCount.toString(),
                });

                // Only add book_date if it exists
                if (bookDate) {
                    params.append('book_date', bookDate);
                }

                const response = await fetch(`/parent/book-program/pricing?${params.toString()}`);
                const result = await response.json();

                if (result.success) {
                    setCurrentPricing(result.data);
                    setData('amount', result.data.final_price);

                    // Show toast for significant discounts with tier information
                    if (result.data.total_discount > 0) {
                        const tierText = result.data.discount_tier === 'double'
                            ? 'Double sessions: 3% off!'
                            : result.data.discount_tier === 'triple_plus'
                            ? 'Triple+ sessions: 5% off!'
                            : `${result.data.total_discount}% off!`;

                        toast.success(tierText, {
                            description: result.formatted.breakdown,
                        });
                    }
                } else {
                    setPricingError(result.error || 'Failed to fetch pricing');
                    // Fallback to static calculation
                    setData('amount', Number(program.price) * sessionCount);
                }
            } catch (error) {
                console.error('Failed to fetch pricing:', error);
                setPricingError('Network error. Using standard pricing.');
                // Fallback to static calculation
                setData('amount', Number(program.price) * sessionCount);
            } finally {
                setIsLoadingPricing(false);
            }
        },
        [program.prog_id, program.price, using_dynamic_pricing],
    );

    // Fetch pricing when session count changes
    useEffect(() => {
        fetchPricing(data.session_count, data.book_date);
    }, [data.session_count, fetchPricing]);

    // Fetch pricing when date changes (if date is set)
    useEffect(() => {
        if (data.book_date) {
            fetchPricing(data.session_count, data.book_date);
        }
    }, [data.book_date, fetchPricing]);

    // Use dynamic pricing if available, otherwise fallback to static
    const pricePerSession = currentPricing?.price_per_session || Number(program.price);
    const totalAmount = currentPricing?.final_price || Number(program.price) * data.session_count;
    const discountPercentage = currentPricing?.total_discount || 0;

    // Calculate original total based on base price from dynamic pricing or static price
    const originalTotal = currentPricing?.base_price
        ? currentPricing.base_price * data.session_count // Use base price from API
        : Number(program.price) * data.session_count; // Fallback to static price

    // Get minimum sessions required
    const minSessionsRequired = currentPricing?.min_sessions_required || program.session_count;

    // Get selected payment type info
    const selectedPaymentType = payment_types.find(pt => pt.id.toString() === data.payment_type_id);
    const showAccountNumber = selectedPaymentType &&
        (selectedPaymentType.payment_method === 'gcash' || selectedPaymentType.payment_method === 'bank_transfer');
    const showInstructions = selectedPaymentType && selectedPaymentType.instructions;

    // Calculate downpayment remaining
    const downpaymentNum = parseFloat(String(data.downpayment_amount)) || 0;
    const downpaymentRemaining = Math.max(0, totalAmount - downpaymentNum);

    const submitBooking = () => {
        post('/parent/book-program', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Booking submitted with downpayment', {
                    description: `${program.name} for ${data.session_count} session(s). Awaiting admin approval.`,
                });
            },
            onError: (errors) => {
                toast.error('Unable to submit booking', {
                    description: Object.values(errors).join(', ') || 'Please check the form fields and try again.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Book ${program.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-full rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                        <h1 className="text-3xl font-bold tracking-tight text-amber-900">Book {program.name}</h1>
                        <p className="text-sm text-amber-700">Review program details and complete your booking</p>

                        {/* API Status Badge */}
                        {using_dynamic_pricing && (
                            <Badge className="mt-2 border-green-200 bg-green-100 text-green-800">
                                <Sparkles className="mr-1 h-3 w-3" />
                                Dynamic Pricing Active
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Program Details Card */}
                    <Card className="border-amber-200 bg-white shadow-lg">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className={`rounded-xl ${getProgramTypeColor(program.prog_type).split(' ')[0]} p-3`}>
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-900">{program.name}</CardTitle>
                                    <CardDescription className="font-mono text-xs">ID: {program.prog_id}</CardDescription>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge className={getProgramTypeColor(program.prog_type)}>{formatProgramType(program.prog_type)}</Badge>
                                <Badge
                                    variant="secondary"
                                    className={program.setting === 'online' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}
                                >
                                    {program.setting === 'online' ? '🌐 Online' : '🏠 Hub'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {program.description && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700">Description</div>
                                    <p className="text-sm text-gray-600">{program.description}</p>
                                </div>
                            )}

                            {/* Schedule */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Calendar className="h-4 w-4" />
                                    Schedule
                                </div>
                                <div className="grid grid-cols-2 gap-3 pl-6">
                                    <div className="rounded-lg bg-amber-50 p-3">
                                        <p className="text-xs text-gray-500">Days</p>
                                        <p className="text-sm font-medium text-gray-900">{daysSummary || 'TBA'}</p>
                                    </div>
                                    <div className="rounded-lg bg-blue-50 p-3">
                                        <p className="text-xs text-gray-500">Time</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatTime(program.start_time)} - {formatTime(program.end_time)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Minimum Sessions Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <GraduationCap className="h-4 w-4" />
                                    Session Requirements
                                </div>
                                <div className="ml-6 space-y-2">
                                    <div className="rounded-lg bg-blue-50 p-3">
                                        <p className="text-xs text-gray-500">Minimum Sessions Required</p>
                                        <p className="text-lg font-bold text-blue-700">{program.session_count} sessions</p>
                                    </div>

                                    {/* Discount Tiers Info */}
                                    {using_dynamic_pricing && (
                                        <div className="rounded-lg bg-green-50 p-3">
                                            <p className="text-xs text-gray-500 mb-2">Discount Tiers:</p>
                                            <ul className="space-y-1 text-xs">
                                                <li className="flex justify-between">
                                                    <span>• {program.session_count} sessions (minimum):</span>
                                                    <span className="font-medium">No discount</span>
                                                </li>
                                                <li className="flex justify-between">
                                                    <span>• {program.session_count * 2} sessions (2x minimum):</span>
                                                    <span className="font-medium text-green-600">3% discount</span>
                                                </li>
                                                <li className="flex justify-between">
                                                    <span>• {program.session_count * 3}+ sessions (3x+ minimum):</span>
                                                    <span className="font-medium text-green-600">5% discount</span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Original/Static Pricing (for comparison) */}
                            {using_dynamic_pricing && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Tag className="h-4 w-4" />
                                        Base Price
                                    </div>
                                    <div className="ml-6 rounded-lg bg-gray-50 p-3">
                                        <p className="text-xs text-gray-500">Per Session (before discounts)</p>
                                        <p className="text-lg font-bold text-gray-900">{formatPrice(program.price)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Booking Form Card */}
                    <Card className="border-amber-200 bg-white shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-900">Booking Form</CardTitle>
                            <CardDescription>Fill in your booking details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="learner" className="text-gray-700">
                                    <Users className="mr-1 inline h-4 w-4" />
                                    Learner *
                                </Label>
                                <Select value={data.learner_id} onValueChange={(value) => setData('learner_id', value)}>
                                    <SelectTrigger id="learner" className="border-amber-200 focus:ring-amber-500">
                                        <SelectValue placeholder="Select learner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {learners.map((learner) => (
                                            <SelectItem key={learner.learner_id} value={learner.learner_id}>
                                                {learner.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.learner_id && <p className="text-sm text-red-600">{errors.learner_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="book-date" className="text-gray-700">
                                    <CalendarCheck className="mr-1 inline h-4 w-4" />
                                    Preferred Start Date *
                                </Label>
                                <Input
                                    id="book-date"
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    className="border-amber-200 focus:ring-amber-500"
                                    value={data.book_date}
                                    onChange={(event) => setData('book_date', event.target.value)}
                                />
                                {using_dynamic_pricing && (
                                    <p className="mt-1 text-xs text-gray-500">Date affects pricing (weekends may have premium rates)</p>
                                )}
                                {errors.book_date && <p className="text-sm text-red-600">{errors.book_date}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="session-count" className="text-gray-700">
                                    <GraduationCap className="mr-1 inline h-4 w-4" />
                                    Number of Sessions *
                                </Label>
                                <Input
                                    id="session-count"
                                    type="number"
                                    min={program.session_count}
                                    max={20}
                                    className="border-amber-200 focus:ring-amber-500"
                                    value={data.session_count}
                                    onChange={(event) => {
                                        const count = Math.max(program.session_count, parseInt(event.target.value) || program.session_count);
                                        setData('session_count', count);
                                    }}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Minimum {program.session_count} sessions required.
                                    {using_dynamic_pricing && (
                                        <span className="block mt-1">
                                            Discount tiers: {program.session_count * 2} sessions (3% off) | {program.session_count * 3}+ sessions (5% off)
                                        </span>
                                    )}
                                </p>
                                {errors.session_count && <p className="text-sm text-red-600">{errors.session_count}</p>}
                            </div>

                            {/* Pricing Display with Dynamic Updates */}
                            <div className="space-y-3 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-medium text-gray-700">
                                        <Coins className="mr-1 inline h-4 w-4" />
                                        Pricing Details
                                    </Label>
                                    {isLoadingPricing && (
                                        <Badge variant="outline" className="flex items-center gap-1 bg-white">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Updating...
                                        </Badge>
                                    )}
                                </div>

                                {/* Pricing Error Alert */}
                                {pricingError && (
                                    <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-2">
                                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                                        <p className="text-xs text-yellow-700">{pricingError}</p>
                                    </div>
                                )}

                                {/* Price Breakdown */}
                                <div className="space-y-2 text-sm">
                                    {/* Show base price if available and different from discounted price */}
                                    {currentPricing?.base_price && currentPricing.base_price !== pricePerSession && (
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Base price per session:</span>
                                            <span>{formatPrice(currentPricing.base_price)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Your price per session:</span>
                                        <span className={`font-medium ${discountPercentage > 0 ? 'text-green-600' : ''}`}>
                                            {formatPrice(pricePerSession)}
                                        </span>
                                    </div>

                                    {/* Always show original total for comparison */}
                                    {originalTotal > 0 && (
                                        <div className="mt-1 flex justify-between border-t border-amber-100 pt-2 text-gray-500">
                                            <span>Original total ({data.session_count} sessions):</span>
                                            <span className={discountPercentage > 0 ? 'line-through' : ''}>{formatPrice(originalTotal)}</span>
                                        </div>
                                    )}

                                    {/* Show discount if applicable */}
                                    {discountPercentage > 0 && (
                                        <>
                                            <div className="mt-1 flex justify-between rounded-md bg-green-50 p-2 text-green-600">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <TrendingDown className="h-3 w-3" />
                                                    You save:
                                                </span>
                                                <span className="font-bold">{discountPercentage}%</span>
                                            </div>

                                            <div className="flex justify-between text-xs text-green-600">
                                                <span>You save (amount):</span>
                                                <span className="font-medium">{formatPrice(originalTotal - totalAmount)}</span>
                                            </div>
                                        </>
                                    )}

                                    {/* Final total */}
                                    <div className="mt-2 border-t-2 border-amber-200 pt-2">
                                        <div className="flex justify-between text-base font-bold">
                                            <span>Total Amount:</span>
                                            <span className="text-amber-900">{formatPrice(totalAmount)}</span>
                                        </div>
                                    </div>

                                    {/* Discount Breakdown with Tier Information */}
                                    {currentPricing && discountPercentage > 0 && (
                                        <div className="mt-3 rounded border border-amber-100 bg-white/50 p-2 text-xs">
                                            <p className="mb-1 flex items-center gap-1 font-medium text-gray-700">
                                                <Tag className="h-3 w-3" />
                                                Discount breakdown:
                                            </p>
                                            <ul className="space-y-1 text-gray-600">
                                                {/* Session discount with tier information */}
                                                {currentPricing.session_discount > 0 && (
                                                    <li className="flex justify-between">
                                                        <span>
                                                            •{' '}
                                                            {currentPricing.discount_tier === 'double'
                                                                ? `Double sessions (${minSessionsRequired * 2} sessions)`
                                                                : currentPricing.discount_tier === 'triple_plus'
                                                                  ? `Triple+ sessions (${minSessionsRequired * 3}+ sessions)`
                                                                  : 'Bulk discount'}
                                                            :
                                                        </span>
                                                        <span className="font-medium">{currentPricing.session_discount}%</span>
                                                    </li>
                                                )}
                                                {currentPricing.setting_discount > 0 && (
                                                    <li className="flex justify-between">
                                                        <span>• Online setting:</span>
                                                        <span className="font-medium">{currentPricing.setting_discount}%</span>
                                                    </li>
                                                )}
                                                {currentPricing.time_discount > 0 && (
                                                    <li className="flex justify-between">
                                                        <span>• Off-peak time:</span>
                                                        <span className="font-medium">{currentPricing.time_discount}%</span>
                                                    </li>
                                                )}
                                                {currentPricing.time_discount < 0 && (
                                                    <li className="flex justify-between text-amber-600">
                                                        <span>• Peak time premium:</span>
                                                        <span className="font-medium">+{Math.abs(currentPricing.time_discount)}%</span>
                                                    </li>
                                                )}
                                                {currentPricing.day_discount > 0 && (
                                                    <li className="flex justify-between">
                                                        <span>• Weekday discount:</span>
                                                        <span className="font-medium">{currentPricing.day_discount}%</span>
                                                    </li>
                                                )}
                                                {currentPricing.day_discount < 0 && (
                                                    <li className="flex justify-between text-amber-600">
                                                        <span>• Weekend premium:</span>
                                                        <span className="font-medium">+{Math.abs(currentPricing.day_discount)}%</span>
                                                    </li>
                                                )}
                                            </ul>

                                            {/* Total savings calculation */}
                                            <div className="mt-2 border-t border-dashed border-amber-200 pt-2 font-medium text-green-600">
                                                <div className="flex justify-between">
                                                    <span>Total savings:</span>
                                                    <span>{formatPrice(originalTotal - totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Show message if no discounts */}
                                    {(!currentPricing || discountPercentage === 0) && using_dynamic_pricing && !isLoadingPricing && (
                                        <div className="mt-2 text-center text-xs text-gray-500 italic">
                                            Standard pricing applied. Book {program.session_count * 2} sessions for 3% off or {program.session_count * 3}+ sessions for 5% off!
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Session Package Options */}
                            {pricing_options.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="font-medium text-gray-700">Popular Packages</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {pricing_options.map((option) => (
                                            <Button
                                                key={option.sessions}
                                                type="button"
                                                variant={data.session_count === option.sessions ? 'default' : 'outline'}
                                                className={`h-auto flex-col items-start p-3 ${
                                                    data.session_count === option.sessions
                                                        ? 'border-amber-500 bg-amber-500 text-white hover:bg-amber-600'
                                                        : 'border-amber-200 hover:border-amber-300'
                                                }`}
                                                onClick={() => setData('session_count', option.sessions)}
                                            >
                                                <div className="text-sm font-medium">{option.sessions} sessions</div>
                                                <div className="text-xs opacity-90">{option.formatted_total}</div>
                                                {option.discount > 0 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className={`mt-1 ${
                                                            data.session_count === option.sessions
                                                                ? 'bg-amber-400 text-white'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        Save {option.discount}%
                                                    </Badge>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="special-request" className="text-gray-700">
                                    <Info className="mr-1 inline h-4 w-4" />
                                    Special Request
                                </Label>
                                <Textarea
                                    id="special-request"
                                    className="border-amber-200 focus:ring-amber-500"
                                    value={data.notes}
                                    onChange={(event) => setData('notes', event.target.value)}
                                    placeholder="Add notes for the tutor or admin"
                                    rows={3}
                                />
                            </div>

                            {/* Tutor Request Section */}
                            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="request-tutor"
                                        checked={data.request_tutor}
                                        onCheckedChange={(value) => setData('request_tutor', Boolean(value))}
                                    />
                                    <Label htmlFor="request-tutor" className="font-medium text-gray-700">
                                        <Settings className="mr-1 inline h-4 w-4" />
                                        Request a Tutor (optional)
                                    </Label>
                                </div>
                                {data.request_tutor && (
                                    <>
                                        <Select value={data.tutor_id} onValueChange={(value) => setData('tutor_id', value)}>
                                            <SelectTrigger className="border-amber-200 focus:ring-amber-500">
                                                <SelectValue placeholder="Select tutor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tutors.map((tutor) => (
                                                    <SelectItem key={tutor.tutor_id} value={tutor.tutor_id}>
                                                        {tutor.name}
                                                        {tutor.subject ? ` • ${tutor.subject}` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.tutor_id && <p className="text-sm text-red-600">{errors.tutor_id}</p>}
                                    </>
                                )}
                            </div>

                            {/* Downpayment Section */}
                            <div className="space-y-4 rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-emerald-500 p-1.5">
                                        <CreditCard className="h-4 w-4 text-white" />
                                    </div>
                                    <Label className="text-base font-semibold text-emerald-800">
                                        Downpayment (Required)
                                    </Label>
                                </div>
                                <p className="text-xs text-gray-600">
                                    A minimum downpayment of ₱500 is required to submit your booking. You can pay the remaining balance after admin approval.
                                </p>

                                {/* Payment Method */}
                                <div className="space-y-2">
                                    <Label htmlFor="payment-method" className="text-gray-700">
                                        <Coins className="mr-1 inline h-4 w-4" />
                                        Payment Method *
                                    </Label>
                                    <Select
                                        value={data.payment_type_id}
                                        onValueChange={(value) => setData('payment_type_id', value)}
                                    >
                                        <SelectTrigger id="payment-method" className="border-emerald-200 focus:ring-emerald-500">
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {payment_types.map((pt) => (
                                                <SelectItem key={pt.id} value={pt.id.toString()}>
                                                    {pt.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_type_id && <p className="text-sm text-red-600">{errors.payment_type_id}</p>}

                                    {/* Show Payment Instructions */}
                                    {showInstructions && selectedPaymentType && (
                                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                                            <div className="flex items-start gap-2">
                                                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                                <div className="text-sm text-blue-700">
                                                    {selectedPaymentType.instructions}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Show Account Number for GCash/Bank Transfer */}
                                    {showAccountNumber && selectedPaymentType?.account_number && (
                                        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
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

                                {/* Downpayment Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="downpayment-amount" className="text-gray-700">
                                        <Coins className="mr-1 inline h-4 w-4" />
                                        Downpayment Amount *
                                    </Label>
                                    <Input
                                        id="downpayment-amount"
                                        type="number"
                                        min={500}
                                        max={totalAmount}
                                        className="border-emerald-200 focus:ring-emerald-500"
                                        value={data.downpayment_amount}
                                        onChange={(e) => setData('downpayment_amount', e.target.value)}
                                        placeholder="Enter amount (min ₱500)"
                                    />
                                    <p className="text-xs text-gray-500">Minimum: ₱500 | Maximum: {formatPrice(totalAmount)}</p>
                                    {errors.downpayment_amount && <p className="text-sm text-red-600">{errors.downpayment_amount}</p>}
                                </div>

                                {/* Downpayment Summary */}
                                {downpaymentNum > 0 && (
                                    <div className="rounded-lg bg-white border border-emerald-200 p-3 space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                                            <Info className="h-4 w-4" />
                                            Payment Summary
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-gray-600">Total Booking:</span>
                                            <span className="font-medium text-gray-900">{formatPrice(totalAmount)}</span>
                                            <span className="text-gray-600">Downpayment:</span>
                                            <span className="font-medium text-emerald-600">{formatPrice(downpaymentNum)}</span>
                                            <span className="text-gray-600">Remaining (after approval):</span>
                                            <span className="font-medium text-amber-600">{formatPrice(downpaymentRemaining)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Receipt Image */}
                                <div className="space-y-2">
                                    <Label htmlFor="receipt-image" className="text-gray-700">
                                        <CreditCard className="mr-1 inline h-4 w-4" />
                                        Receipt Image (optional)
                                    </Label>
                                    <Input
                                        id="receipt-image"
                                        type="file"
                                        accept="image/*"
                                        className="border-emerald-200 focus:ring-emerald-500"
                                        onChange={(e) => setData('receipt_image', e.target.files?.[0] ?? null)}
                                    />
                                    {errors.receipt_image && <p className="text-sm text-red-600">{errors.receipt_image}</p>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-amber-100 pt-4">
                            <Button
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600"
                                disabled={
                                    processing ||
                                    isLoadingPricing ||
                                    !data.learner_id ||
                                    !data.book_date ||
                                    data.session_count < program.session_count ||
                                    (data.request_tutor && !data.tutor_id) ||
                                    !data.payment_type_id ||
                                    downpaymentNum < 500
                                }
                                onClick={submitBooking}
                            >
                                {processing || isLoadingPricing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isLoadingPricing ? 'Calculating...' : 'Submitting...'}
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Submit Booking with Downpayment
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
