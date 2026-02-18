import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Video, Link as LinkIcon, BookOpen, User, Calendar, ExternalLink, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/dateTimeFormat';

interface LectureRow {
    lecture_id: string;
    name: string;
    platform: string;
    platform_link: string;
    created_at: string | null;
    program?: {
        name: string;
        prog_type: string;
        session_count: number;
        start_time: string | null;
        end_time: string | null;
        days: string[] | null;
    } | null;
    booking?: {
        book_id: string;
        book_date: string | null;
        session_count: number;
        notes: string | null;
        learner?: {
            learner_id: string;
            name: string;
            nickname: string | null;
            photo: string | null;
        } | null;
        tutor?: {
            tutor_id: string;
            first_name: string;
            last_name: string;
        } | null;
    } | null;
}

interface LecturesPageProps {
    lectures: LectureRow[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lectures',
        href: '/parent/lectures',
    },
];

// Helper to calculate end date
const calculateEndDate = (startDate: string | null, sessionCount: number): string | null => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + sessionCount);
    return end.toISOString().split('T')[0];
};

// Helper to format time to 12-hour format with AM/PM
const formatTime12Hour = (time: string | null): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};

// Helper to convert abbreviated day names to full day names
const formatDays = (days: string[] | string | null): string => {
    if (!days) return '';
    const dayMap: Record<string, string> = {
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday',
        'Sun': 'Sunday',
    };
    const dayArray = Array.isArray(days) ? days : [days];
    return dayArray.map(day => dayMap[day] || day).join(', ');
};

export default function Lectures({ lectures }: LecturesPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Lectures" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <Video className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    My Lectures
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">
                                View your online class lectures and meeting links
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Total Lectures</p>
                                <p className="text-2xl font-bold text-gray-900">{lectures.length}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <Video className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Google Meet</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {lectures.filter(l => l.platform === 'Google Meet').length}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-2.5">
                                <Video className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Active</p>
                                <p className="text-2xl font-bold text-gray-900">{lectures.length}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2.5">
                                <LinkIcon className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lectures Grid - Card View */}
                {lectures.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {lectures.map((lecture) => {
                            const endDate = calculateEndDate(lecture.booking?.book_date ?? null, lecture.booking?.session_count ?? 0);

                            return (
                                <Card key={lecture.lecture_id} className="border-amber-200 bg-white shadow-md hover:shadow-lg transition-all">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={lecture.booking?.learner?.photo || undefined} alt={lecture.booking?.learner?.name} />
                                                    <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                                        {lecture.booking?.learner?.name?.charAt(0).toUpperCase() || 'L'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                                        {lecture.name}
                                                    </CardTitle>
                                                    <p className="text-sm text-gray-500">
                                                        {lecture.booking?.learner?.nickname
                                                            ? `${lecture.booking.learner.name} (${lecture.booking.learner.nickname})`
                                                            : lecture.booking?.learner?.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Platform */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                            <span className="text-gray-600">Platform:</span>
                                            <span className="font-medium text-gray-900">{lecture.platform}</span>
                                        </div>

                                        {/* Schedule */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-purple-500" />
                                            <span className="text-gray-600">Schedule:</span>
                                            <span className="font-medium text-gray-900">
                                                {lecture.booking?.book_date
                                                    ? `${formatDate(lecture.booking.book_date)} → ${endDate ? formatDate(endDate) : 'N/A'}`
                                                    : 'N/A'}
                                            </span>
                                        </div>

                                        {/* Sessions */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-amber-500" />
                                            <span className="text-gray-600">Sessions:</span>
                                            <span className="font-medium text-gray-900">{lecture.booking?.session_count || lecture.program?.session_count || 0}</span>
                                        </div>

                                        {/* Time */}
                                        {lecture.program?.start_time && lecture.program?.end_time && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-600">Time:</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatTime12Hour(lecture.program.start_time)} - {formatTime12Hour(lecture.program.end_time)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Days */}
                                        {lecture.program?.days && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-indigo-500" />
                                                <span className="text-gray-600">Days:</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatDays(lecture.program.days)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Tutor */}
                                        {lecture.booking?.tutor ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-purple-500" />
                                                <span className="text-gray-600">Tutor:</span>
                                                <span className="font-medium text-gray-900">{lecture.booking.tutor.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-gray-300" />
                                                <span className="text-gray-600">Tutor:</span>
                                                <span className="text-gray-400">Not assigned</span>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {lecture.booking?.notes && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <span className="text-gray-600">Notes:</span>
                                                    <p className="text-gray-900">{lecture.booking.notes}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Program */}
                                        {lecture.program && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <BookOpen className="h-4 w-4 text-amber-500" />
                                                <span className="text-gray-600">Program:</span>
                                                <span className="font-medium text-gray-900">{lecture.program.name}</span>
                                            </div>
                                        )}

                                        {/* Join Button: only render when a platform link exists (hide for Hub) */}
                                        {lecture.platform_link ? (
                                            <a
                                                href={lecture.platform_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-medium text-white hover:from-amber-600 hover:to-orange-600"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Join Meeting
                                            </a>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/50 p-12">
                        <div className="rounded-full bg-amber-100 p-4">
                            <Video className="h-8 w-8 text-amber-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Lectures Yet</h3>
                        <p className="mt-2 text-center text-gray-600">
                            Lectures will appear here once you complete payment for online programs.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
