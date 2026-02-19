import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { BookOpen, Video, User, ArrowRight, Calendar, Clock, Sun, TrendingUp, CalendarDays, Target, CalendarClock, PlayCircle, UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// import '@fullcalendar/core/index.css';
// import '@fullcalendar/daygrid/index.css';
// import '@fullcalendar/timegrid/index.css';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutor',
        href: '/tutor/dashboard',
    },
];

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay: boolean;
    extendedProps: {
        booking_id?: string;
        lecture_ids?: string[];
        lecture_count?: number;
        session_number?: number;
        total_sessions?: number;
        learner?: string | null;
        tutor?: string | null;
        program?: string | null;
        start_time?: string | null;
        end_time?: string | null;
    };
}

interface TutorDashboardProps {
    calendarEvents: CalendarEvent[];
    stats: {
        activeBookings: number;
        totalLectures: number;
        totalStudents: number;
        totalSessions: number;
    };
    tutor_id: string;
}

export default function TutorDashboard({ calendarEvents = [], stats, tutor_id }: TutorDashboardProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
    const [currentTime, setCurrentTime] = useState(new Date());

    const calendarRef = useRef<any>(null);

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Get today's events (include multi-day events where today falls within start..end)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todaysEvents = calendarEvents.filter((event) => {
        const start = new Date(event.start);
        const end = event.end ? new Date(event.end) : start;
        // normalize to date-only by comparing ISO date strings
        return start <= today && today <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });

    // Get upcoming events (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingEvents = calendarEvents
        .filter((event) => {
            const start = new Date(event.start);
            const end = event.end ? new Date(event.end) : start;
            // include events that overlap the next 7 days window
            return end >= today && start <= nextWeek;
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Handle view change
    const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
        setCalendarView(view);
        if (calendarRef.current && calendarRef.current.getApi) {
            calendarRef.current.getApi().changeView(view);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tutor Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-orange-200 bg-linear-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-linear-to-r from-orange-500 to-amber-500 p-3 shadow-md">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-linear-to-r from-orange-700 to-amber-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Tutor Dashboard
                                </h1>
                            </div>
                            <p className="ml-2 flex items-center gap-1 text-gray-600">
                                <Sun className="h-4 w-4 text-orange-500" />
                                {currentTime.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                                <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 font-mono text-xs text-orange-700">
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-orange-100 bg-linear-to-br from-orange-50 to-amber-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Total Lectures</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalLectures}</p>
                            </div>
                            <div className="rounded-lg bg-linear-to-r from-orange-500 to-amber-500 p-2.5"></div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                            <Video className="h-3 w-3" />
                            <span>{stats.totalLectures} lectures</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-orange-100 bg-linear-to-br from-orange-50 to-emerald-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                            </div>
                            <div className="rounded-lg bg-linear-to-r from-orange-500 to-yellow-500 p-2.5">
                                <User className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                            <User className="h-3 w-3" />
                            <span>{stats.totalStudents} students</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-orange-100 bg-linear-to-br from-orange-50 to-pink-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Total Sessions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                            </div>
                            <div className="rounded-lg bg-linear-to-r from-orange-500 to-yellow-500 p-2.5">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                            <CalendarClock className="h-3 w-3" />
                            <span>{stats.totalSessions} upcoming</span>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule Preview */}
                {todaysEvents.length > 0 && (
                    <Card className="border border-orange-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-linear-to-r from-orange-500 to-amber-500 p-2">
                                    <Clock className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-orange-800">Today's Schedule</h3>
                                <Badge className="border-0 bg-linear-to-r from-orange-500 to-amber-500 text-white">
                                    {todaysEvents.length} sessions
                                </Badge>
                            </div>
                            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                                {todaysEvents.slice(0, 3).map((event) => (
                                    <div
                                        key={event.id}
                                        className="min-w-62.5 cursor-pointer rounded-lg border border-orange-200 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        <div className="font-semibold text-gray-900">{event.title}</div>
                                        <div className="mt-1 text-xs text-gray-600">
                                            {event.extendedProps.session_number
                                                ? `Session ${event.extendedProps.session_number} of ${event.extendedProps.total_sessions}`
                                                : event.extendedProps.lecture_count
                                                ? `${event.extendedProps.lecture_count} lecture(s)`
                                                : 'Lecture'}
                                        </div>
                                        {event.extendedProps.learner && (
                                            <div className="mt-1 text-xs text-gray-700">
                                                <strong>Learner:</strong> {event.extendedProps.learner}
                                            </div>
                                        )}
                                        {event.extendedProps.start_time && (
                                            <div className="mt-1 text-xs text-orange-600">
                                                {event.extendedProps.start_time} - {event.extendedProps.end_time}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {todaysEvents.length > 3 && (
                                    <div className="flex min-w-15 items-center justify-center">
                                        <span className="text-xs text-gray-500">+{todaysEvents.length - 3} more</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Calendar Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <Card className="border border-orange-200 bg-white shadow-sm">
                            <CardHeader className="border-b border-orange-100 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-orange-800">
                                        <CalendarDays className="h-5 w-5 text-orange-500" />
                                        Teaching Schedule
                                    </CardTitle>
                                    <div className="flex items-center gap-1 rounded-lg border border-orange-200 bg-white p-1">
                                        <Button
                                            variant={calendarView === 'dayGridMonth' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => handleViewChange('dayGridMonth')}
                                            className={
                                                calendarView === 'dayGridMonth'
                                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                    : 'text-gray-600 hover:bg-orange-50'
                                            }
                                        >
                                            Month
                                        </Button>
                                        <Button
                                            variant={calendarView === 'timeGridWeek' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => handleViewChange('timeGridWeek')}
                                            className={
                                                calendarView === 'timeGridWeek'
                                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                    : 'text-gray-600 hover:bg-orange-50'
                                            }
                                        >
                                            Week
                                        </Button>
                                        <Button
                                            variant={calendarView === 'timeGridDay' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => handleViewChange('timeGridDay')}
                                            className={
                                                calendarView === 'timeGridDay'
                                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                    : 'text-gray-600 hover:bg-orange-50'
                                            }
                                        >
                                            Day
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView={calendarView}
                                    headerToolbar={false}
                                    events={calendarEvents}
                                    eventClick={(info) => {
                                        setSelectedEvent({
                                            id: info.event.id,
                                            title: info.event.title,
                                            start: info.event.startStr,
                                            extendedProps: info.event.extendedProps,
                                        });
                                    }}
                                    height="auto"
                                    dayMaxEvents={3}
                                    eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
                                    eventContent={(eventInfo) => {
                                        const sessionNum = eventInfo.event.extendedProps?.session_number;
                                        const totalSessions = eventInfo.event.extendedProps?.total_sessions;
                                        return (
                                            <div className="flex items-center gap-1 overflow-hidden rounded bg-linear-to-r from-orange-500 to-amber-500 p-1 text-xs text-white shadow-sm">
                                                <span className="truncate">{eventInfo.event.title}</span>
                                                {eventInfo.view.type !== 'dayGridMonth' && sessionNum && totalSessions && (
                                                    <span className="ml-1 shrink-0 rounded bg-white/20 px-1 py-0.5 text-xs font-semibold">
                                                        {sessionNum}/{totalSessions}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            {/* Selected Event Details */}
                            <Card className="border border-orange-200 bg-white shadow-sm">
                                <CardHeader className="border-b border-orange-100 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-orange-800">
                                        <CalendarClock className="h-5 w-5 text-orange-500" />
                                        Session Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {selectedEvent ? (
                                        <div className="space-y-4">
                                            <div className="rounded-lg border border-orange-200 p-4">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <h4 className="font-semibold text-gray-900">{selectedEvent.title}</h4>
                                                    {selectedEvent.extendedProps.session_number && (
                                                        <Badge className="border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                                            Session {selectedEvent.extendedProps.session_number}/
                                                            {selectedEvent.extendedProps.total_sessions}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="flex items-center gap-1 text-sm text-gray-600">
                                                    <CalendarDays className="h-4 w-4 text-orange-500" />
                                                    {selectedEvent.end
                                                        ? `${new Date(selectedEvent.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${new Date(selectedEvent.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                                        : new Date(selectedEvent.start).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                </p>
                                                {selectedEvent.extendedProps.start_time && (
                                                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                                                        <Clock className="h-4 w-4 text-orange-500" />
                                                        {selectedEvent.extendedProps.start_time} - {selectedEvent.extendedProps.end_time}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                {selectedEvent.extendedProps.learner && (
                                                    <div className="flex items-center gap-3 rounded-lg border border-orange-100 p-3">
                                                        <div className="rounded-full bg-orange-100 p-2">
                                                            <UserCircle className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Learner</p>
                                                            <p className="font-medium text-gray-900">{selectedEvent.extendedProps.learner}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedEvent.extendedProps.program && (
                                                    <div className="flex items-center gap-3 rounded-lg border border-orange-100 p-3">
                                                        <div className="rounded-full bg-orange-100 p-2">
                                                            <BookOpen className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Program</p>
                                                            <p className="font-medium text-gray-900">{selectedEvent.extendedProps.program}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <div className="rounded-full bg-gradient-to-r from-orange-100 to-amber-100 p-4">
                                                <CalendarDays className="h-8 w-8 text-orange-500" />
                                            </div>
                                            <p className="mt-3 text-sm text-gray-500">Click on any session in the calendar to view details</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Upcoming Sessions Preview */}
                            <Card className="border border-orange-200 bg-white shadow-sm">
                                <CardHeader className="border-b border-orange-100 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-orange-800">
                                        <PlayCircle className="h-5 w-5 text-orange-500" />
                                        Upcoming (Next 7 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {upcomingEvents.length > 0 ? (
                                        <div className="space-y-2">
                                            {upcomingEvents.slice(0, 5).map((event) => (
                                                <div
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className="cursor-pointer rounded-lg border border-orange-100 bg-orange-50 p-2 transition-colors hover:bg-orange-100"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-xs font-semibold text-orange-700">{event.title}</p>
                                                            <p className="text-xs text-gray-600">
                                                                {new Date(event.start).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </p>
                                                            {event.extendedProps.learner && (
                                                                <p className="text-xs text-gray-600">{event.extendedProps.learner}</p>
                                                            )}
                                                        </div>
                                                        <Badge className="bg-orange-200 text-orange-800">
                                                            {event.extendedProps.session_number
                                                                ? `${event.extendedProps.session_number}/${event.extendedProps.total_sessions}`
                                                                : 'Lecture'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-sm text-gray-500">No upcoming sessions</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
