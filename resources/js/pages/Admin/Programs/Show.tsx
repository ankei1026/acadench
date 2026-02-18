import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, DollarSign, Users, BookOpen, FileText, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';

// Define the Program type
interface Program {
    prog_id: string;
    name: string;
    prog_type: string;
    days: any;
    start_time: string;
    end_time: string;
    price: number;
    session_count: number;
    description?: string;
    setting?: string;
    created_at?: string;
    updated_at?: string;
}

interface ShowProgramProps {
    program: Program;
}

// Safe days parser
const getDaysArray = (days: any): string[] => {
    if (Array.isArray(days)) {
        return days;
    }

    if (typeof days === 'string') {
        try {
            const parsed = JSON.parse(days);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
};

// Format program type for display
const formatProgramType = (type: string) => {
    const types: Record<string, string> = {
        'pre-kinder': 'Pre-Kinder',
        'after-school-academic-tutorial': 'After School Academic Tutorial',
        'special-tutorial': 'Special Tutorial',
        'art-class': 'Art Class',
        'reading-writing': 'Reading & Writing',
        'weekend-academic-tutorial': 'Weekend Academic Tutorial',
    };
    return types[type] || type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// Get badge color based on program type
const getProgramTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        'pre-kinder': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'after-school-academic-tutorial': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'special-tutorial': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        'art-class': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        'reading-writing': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        'weekend-academic-tutorial': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
};

// Format time to 12-hour format
const formatTime = (timeString: string) => {
    try {
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
        return timeString;
    }
};

// Format price
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(price);
};

// Format date
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
        return dateString;
    }
};

export default function ShowProgram({ program }: ShowProgramProps) {
    const daysArray = getDaysArray(program.days);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Programs',
            href: '/admin/programs',
        },
        {
            title: program.name,
            href: `/admin/programs/${program.prog_id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Program: ${program.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
                            <p className="text-muted-foreground">Program ID: {program.prog_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600"
                                asChild
                            >
                                <Link href={`/admin/programs/${program.prog_id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                            <Button variant="destructive" size="sm" asChild>
                                <Link
                                    href={`/admin/programs/${program.prog_id}`}
                                    method="delete"
                                    as="button"
                                    preserveScroll
                                    onBefore={() => {
                                        if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
                                            return false;
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Badge className={`w-fit ${getProgramTypeColor(program.prog_type)}`}>{formatProgramType(program.prog_type)}</Badge>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Program Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Description Card */}
                        {program.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-muted-foreground">{program.description}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Schedule Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">Days</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {daysArray.map((day, index) => (
                                            <Badge key={index} variant="secondary" className="px-3 py-1">
                                                {day}
                                            </Badge>
                                        ))}
                                        {daysArray.length === 0 && <span className="text-muted-foreground">No days specified</span>}
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            Start Time
                                        </h4>
                                        <p className="text-lg font-semibold">{formatTime(program.start_time)}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            End Time
                                        </h4>
                                        <p className="text-lg font-semibold">{formatTime(program.end_time)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Pricing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Price per Session</h4>
                                    <p className="text-2xl font-bold">{formatPrice(program.price)}</p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <BookOpen className="h-4 w-4" />
                                        Total Sessions
                                    </h4>
                                    <p className="text-2xl font-bold">{program.session_count}</p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Setting</h4>
                                    <Badge
                                        className={`px-3 py-1 text-lg ${program.setting === 'online'
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                        }`}
                                    >
                                        {program.setting === 'online' ? '🌐 Online' : '🏠 Hub'}
                                    </Badge>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Total Program Cost</h4>
                                    <p className="text-2xl font-bold text-green-600">{formatPrice(program.price * program.session_count)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Info & Stats */}
                    <div className="space-y-6">
                        {/* Pricing Card */}

                        {/* Metadata Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Program Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Program ID</h4>
                                    <p className="font-mono text-sm">{program.prog_id}</p>
                                </div>

                                {program.created_at && (
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                                        <p className="text-sm">{formatDate(program.created_at)}</p>
                                    </div>
                                )}

                                {program.updated_at && (
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                                        <p className="text-sm">{formatDate(program.updated_at)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
