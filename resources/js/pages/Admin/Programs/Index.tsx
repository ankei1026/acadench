import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Pencil,
    Trash2,
    Eye,
    Plus,
    Calendar,
    Clock,
    DollarSign,
    Users,
    BookOpen,
    Zap,
    TrendingUp,
    Filter,
    Search,
    SortAsc,
    Coins,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Define the Program type based on your model
interface Program {
    prog_id: string;
    name: string;
    prog_type: string;
    days: string[] | string;
    start_time: string;
    end_time: string;
    price: number;
    session_count: number;
    capacity?: number;
    available_slots?: number;
    description?: string;
    setting?: string;
}

interface ProgramsPageProps {
    programs: Program[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Programs',
        href: '/admin/programs',
    },
];

// Helper function to parse days
const parseDays = (days: string[] | string): string[] => {
    if (Array.isArray(days)) {
        return days;
    }
    try {
        const parsed = JSON.parse(days);
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

// Helper function to format time
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

// Helper function to format price
const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numPrice);
};

// Get gradient colors based on program type - updated for yellow-50 background
const getProgramGradient = (type: string) => {
    const gradients: Record<string, string> = {
        'pre-kinder': 'from-amber-500 to-orange-400',
        'after-school-academic-tutorial': 'from-blue-500 to-cyan-500',
        'special-tutorial': 'from-violet-500 to-purple-500',
        'art-class': 'from-pink-500 to-rose-500',
        'reading-writing': 'from-emerald-500 to-green-500',
        'weekend-academic-tutorial': 'from-teal-500 to-cyan-500',
    };
    return gradients[type] || 'from-gray-600 to-gray-500';
};

// Get badge color based on program type - softer variants for yellow-50 bg
const getProgramTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        'pre-kinder': 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
        'after-school-academic-tutorial':
            'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        'special-tutorial':
            'bg-violet-100 text-violet-800 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
        'art-class': 'bg-pink-100 text-pink-800 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
        'reading-writing':
            'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        'weekend-academic-tutorial': 'bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300';
};

// Format program type for display
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

// Get program icon based on type
const getProgramIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
        'pre-kinder': <span className="text-2xl">👶</span>,
        'after-school-academic-tutorial': <BookOpen className="h-5 w-5" />,
        'special-tutorial': <Zap className="h-5 w-5" />,
        'art-class': <span className="text-2xl">🎨</span>,
        'reading-writing': <span className="text-2xl">📚</span>,
        'weekend-academic-tutorial': <Calendar className="h-5 w-5" />,
    };
    return icons[type] || <BookOpen className="h-5 w-5" />;
};

export default function Programs({ programs }: ProgramsPageProps) {
    const [parsedPrograms, setParsedPrograms] = useState<Program[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const processedPrograms = programs.map((program) => ({
            ...program,
            days: parseDays(program.days),
        }));
        setParsedPrograms(processedPrograms);
    }, [programs]);

    // Filter programs based on search query
    const filteredPrograms = parsedPrograms.filter(
        (program) =>
            program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            program.prog_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            program.prog_id.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Calculate program stats
    const totalPrograms = filteredPrograms.length;
    const totalSessions = filteredPrograms.reduce((sum, program) => sum + program.session_count, 0);
    const totalRevenue = filteredPrograms.reduce((sum, program) => sum + program.price * program.session_count, 0);
    const averagePrice = totalPrograms > 0 ? filteredPrograms.reduce((sum, program) => sum + program.price, 0) / totalPrograms : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Programs" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header with Stats */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Program Management</h1>
                                <p className="text-gray-600 dark:text-gray-300">Manage and organize all learning programs</p>
                            </div>
                            <Button
                                asChild
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600"
                            >
                                <Link href="/admin/programs/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Program
                                </Link>
                            </Button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-amber-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-amber-100 p-2">
                                        <BookOpen className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Programs</p>
                                        <p className="text-xl font-bold text-gray-900">{totalPrograms}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Sessions</p>
                                        <p className="text-xl font-bold text-gray-900">{totalSessions}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search programs by name"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Programs Grid */}
                {filteredPrograms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-200 bg-white/50 p-12 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-amber-100 to-orange-100">
                            <BookOpen className="h-10 w-10 text-amber-500" />
                        </div>
                        <h3 className="mt-6 text-xl font-semibold text-gray-900">No programs found</h3>
                        <p className="mt-2 text-gray-600">
                            {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first program'}
                        </p>
                        <Button
                            asChild
                            className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                        >
                            <Link href="/admin/programs/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Program
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Programs <span className="text-gray-500">({filteredPrograms.length})</span>
                            </h2>
                            <Badge variant="outline" className="rounded-full border-amber-300 bg-amber-50 text-amber-700">
                                {new Set(filteredPrograms.map((p) => p.prog_type)).size} Program Types
                            </Badge>
                        </div>

                        {/* Programs Grid */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPrograms.map((program) => {
                                const daysArray = Array.isArray(program.days) ? program.days : parseDays(program.days);
                                const totalCost = program.price * program.session_count;
                                const gradientClass = getProgramGradient(program.prog_type);

                                return (
                                    <Card
                                        key={program.prog_id}
                                        className="group relative overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-amber-200 hover:shadow-lg"
                                    >
                                        {/* Subtle gradient accent */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} pointer-events-none opacity-5`} />

                                        <CardHeader className="relative pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`rounded-xl ${getProgramTypeColor(program.prog_type).split(' ')[0]} p-2.5`}>
                                                        {getProgramIcon(program.prog_type)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="line-clamp-1 text-lg font-bold text-gray-900">{program.name}</CardTitle>
                                                        <CardDescription className="truncate font-mono text-xs text-gray-500">
                                                            ID: {program.prog_id}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className={`mt-3 ${getProgramTypeColor(program.prog_type)}`}>
                                                {formatProgramType(program.prog_type)}
                                            </Badge>
                                        </CardHeader>

                                        <CardContent className="relative space-y-5">
                                            {/* Schedule Section */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    <Calendar className="h-4 w-4" />
                                                    Schedule
                                                </div>
                                                <div className="space-y-2 pl-6">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="bg-gray-50 px-2 py-0.5 text-xs">
                                                            {daysArray.length} days/week
                                                        </Badge>
                                                        <span className="text-sm text-gray-600">
                                                            {daysArray.slice(0, 2).join(', ')}
                                                            {daysArray.length > 2 && ` +${daysArray.length - 2}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Clock className="h-4 w-4" />
                                                        {formatTime(program.start_time)} - {formatTime(program.end_time)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pricing Section */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Pricing
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-lg bg-gray-50 p-3">
                                                        <p className="text-xs text-gray-500">Per Session</p>
                                                        <p className="text-base font-bold text-gray-900">{formatPrice(program.price)}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-emerald-50 p-3">
                                                        <p className="text-xs text-gray-500">Total</p>
                                                        <p className="text-base font-bold text-emerald-700">{formatPrice(totalCost)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sessions & Capacity */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                        <BookOpen className="h-4 w-4" />
                                                        Minimum Sessions
                                                    </div>
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                        {program.session_count}
                                                    </Badge>
                                                </div>
                                                {/* Setting */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                        <span className="text-lg">📍</span>
                                                        Setting
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className={program.setting === 'online'
                                                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                        }
                                                    >
                                                        {program.setting === 'online' ? '🌐 Online' : '🏠 Hub'}
                                                    </Badge>
                                                </div>
                                                {program.capacity && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium text-gray-700">Capacity</span>
                                                            <span className="text-gray-600">
                                                                {program.available_slots || 0}/{program.capacity}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
                                                                style={{
                                                                    width: `${((program.available_slots || 0) / program.capacity) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Description Preview */}
                                            {program.description && (
                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium text-gray-700">Description</div>
                                                    <p className="line-clamp-2 text-sm text-gray-600">{program.description}</p>
                                                </div>
                                            )}
                                        </CardContent>

                                        <CardFooter className="relative border-t border-gray-100 pt-4">
                                            <div className="flex w-full items-center justify-between">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="gap-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                >
                                                    <Link href={`/admin/programs/${program.prog_id}`}>
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View
                                                    </Link>
                                                </Button>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="h-8 w-8 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Link href={`/admin/programs/${program.prog_id}/edit`}>
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Link
                                                            href={`/admin/programs/${program.prog_id}`}
                                                            method="delete"
                                                            as="button"
                                                            preserveScroll
                                                            onBefore={() => confirm('Are you sure you want to delete this program?')}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Results count */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">
                                Showing {filteredPrograms.length} of {parsedPrograms.length} programs
                                {searchQuery && ` matching "${searchQuery}"`}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
