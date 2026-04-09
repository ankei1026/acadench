import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    BookOpen,
    Video,
    User,
    Sun,
    TrendingUp,
    CalendarDays,
    Target,
    CalendarClock,
    PlayCircle,
    UserCircle,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    Clock3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/parent/home',
    },
];

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay: boolean;
    extendedProps: {
        session_id?: string;
        booking_id?: string;
        session_number?: number;
        total_sessions?: number;
        learner?: string | null;
        tutor?: string | null;
        tutor_count?: number;
        program?: string | null;
        start_time?: string | null;
        end_time?: string | null;
        status?: string;
        notes?: string | null;
    };
}

interface ParentHomeProps {
    calendarEvents: CalendarEvent[];
    stats: {
        activeBookings: number;
        totalLearners: number;
        activeTutors: number;
        totalSessions: number;
        totalAmount: number;
    };
}

export default function Home({ calendarEvents = [], stats }: ParentHomeProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
    const [currentTime, setCurrentTime] = useState(new Date());

    const calendarRef = useRef<any>(null);

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Get status badge variant
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'ongoing':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'ongoing':
                return <Clock3 className="h-4 w-4 text-blue-600" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock3 className="h-4 w-4 text-amber-600" />;
        }
    };

    // Get calendar event gradient colors based on status
    const getEventGradient = (status: string) => {
        switch (status) {
            case 'completed':
                return 'from-green-500 to-emerald-500';
            case 'ongoing':
                return 'from-blue-500 to-cyan-500';
            case 'cancelled':
                return 'from-red-500 to-rose-500';
            default:
                return 'from-orange-500 to-amber-500';
        }
    };

    // Get today's events
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todaysEvents = calendarEvents.filter((event) => {
        const start = new Date(event.start);
        const end = event.end ? new Date(event.end) : start;
        return start <= today && today <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });

    // Get upcoming events (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingEvents = calendarEvents
        .filter((event) => {
            const start = new Date(event.start);
            const end = event.end ? new Date(event.end) : start;
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
            <Head title="Parent Home" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 p-3 shadow-md">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Parent Dashboard
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Active Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-2.5">
                                <CalendarDays className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>ongoing bookings</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700">Total Learners</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalLearners}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 p-2.5">
                                <User className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                            <User className="h-3 w-3" />
                            <span>{stats.totalLearners} learners</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Active Tutors</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeTutors}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-2.5">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                            <Users className="h-3 w-3" />
                            <span>{stats.activeTutors} tutors</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Total Sessions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-2.5">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                            <CalendarClock className="h-3 w-3" />
                            <span>{stats.totalSessions} sessions</span>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule Preview */}
                {todaysEvents.length > 0 && (
                    <Card className="border border-orange-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 p-2">
                                    <Clock className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-orange-800">Today's Schedule</h3>
                                <Badge className="border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                    {todaysEvents.length} sessions
                                </Badge>
                            </div>
                            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                                {todaysEvents.slice(0, 3).map((event) => (
                                    <div
                                        key={event.id}
                                        className="min-w-[250px] cursor-pointer rounded-lg border border-orange-200 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900">{event.title}</p>
                                            <Badge className={getStatusBadgeClass(event.extendedProps.status || 'pending')}>
                                                {event.extendedProps.session_number}/{event.extendedProps.total_sessions}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-600">
                                            <span className="font-medium">Learner:</span> {event.extendedProps.learner || 'TBA'}
                                        </p>
                                        <div className="text-xs text-gray-600">
                                            <span className="font-medium">
                                                Tutor{event.extendedProps.tutor_count && event.extendedProps.tutor_count > 1 ? 's' : ''}:
                                            </span>{' '}
                                            {event.extendedProps.tutor_count && event.extendedProps.tutor_count > 1 ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="inline-flex cursor-help items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {event.extendedProps.tutor_count} tutors
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{event.extendedProps.tutor}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                event.extendedProps.tutor || 'Not assigned'
                                            )}
                                        </div>
                                        {event.extendedProps.start_time && (
                                            <p className="mt-1 text-xs text-gray-600">
                                                <Clock className="mr-1 inline h-3 w-3" />
                                                {event.extendedProps.start_time} - {event.extendedProps.end_time}
                                            </p>
                                        )}
                                    </div>
                                ))}
                                {todaysEvents.length > 3 && (
                                    <div className="flex min-w-[60px] items-center justify-center">
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
                                        Learning Schedule
                                    </CardTitle>
                                    <div className="flex items-center gap-1 rounded-lg border border-orange-200 bg-white p-1">
                                        <Button
                                            variant={calendarView === 'dayGridMonth' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => handleViewChange('dayGridMonth')}
                                            className={`text-xs ${
                                                calendarView === 'dayGridMonth'
                                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                                    : 'text-gray-600 hover:bg-orange-50'
                                            }`}
                                        >
                                            Month
                                        </Button>
                                        <Button
                                            variant={calendarView === 'timeGridWeek' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => handleViewChange('timeGridWeek')}
                                            className={`text-xs ${
                                                calendarView === 'timeGridWeek'
                                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                                    : 'text-gray-600 hover:bg-orange-50'
                                            }`}
                                        >
                                            Week
                                        </Button>
                                        <Button
                                            variant={calendarView === 'timeGridDay' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => handleViewChange('timeGridDay')}
                                            className={`text-xs ${
                                                calendarView === 'timeGridDay'
                                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                                    : 'text-gray-600 hover:bg-orange-50'
                                            }`}
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
                                    slotMinTime="06:00:00"
                                    slotMaxTime="22:00:00"
                                    allDaySlot={false}
                                    eventTimeFormat={{
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        meridiem: 'short',
                                    }}
                                    eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
                                    eventContent={(eventInfo) => {
                                        const props = eventInfo.event.extendedProps;
                                        const sessionNum = props.session_number;
                                        const totalSessions = props.total_sessions;
                                        const startTime = props.start_time;
                                        const tutorCount = props.tutor_count || 0;
                                        const status = props.status || 'pending';

                                        return (
                                            <div className={`flex flex-col overflow-hidden rounded bg-gradient-to-r ${getEventGradient(status)} p-1 text-xs text-white shadow-sm`}>
                                                <div className="flex items-center gap-1">
                                                    <span className="truncate font-medium">{eventInfo.event.title}</span>
                                                    {tutorCount > 1 && (
                                                        <Badge className="ml-auto border-0 bg-white/20 px-1 py-0 text-[8px]">{tutorCount}</Badge>
                                                    )}
                                                </div>
                                                {eventInfo.view.type === 'timeGridWeek' || eventInfo.view.type === 'timeGridDay' ? (
                                                    <>
                                                        <span className="text-[10px] opacity-90">
                                                            {startTime} • Session {sessionNum}/{totalSessions}
                                                        </span>
                                                        <span className="truncate text-[10px] opacity-80">{props.learner}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] opacity-90">
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
                                                    <Badge className="border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                                        Session {selectedEvent.extendedProps.session_number}/
                                                        {selectedEvent.extendedProps.total_sessions}
                                                    </Badge>
                                                </div>
                                                <p className="flex items-center gap-1 text-sm text-gray-600">
                                                    <CalendarDays className="h-4 w-4 text-orange-500" />
                                                    {new Date(selectedEvent.start).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                                {selectedEvent.extendedProps.start_time && (
                                                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                                                        <Clock className="h-4 w-4 text-orange-500" />
                                                        {selectedEvent.extendedProps.start_time} - {selectedEvent.extendedProps.end_time}
                                                    </p>
                                                )}
                                                {selectedEvent.extendedProps.status && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        {getStatusIcon(selectedEvent.extendedProps.status)}
                                                        <Badge className={getStatusBadgeClass(selectedEvent.extendedProps.status)}>
                                                            {selectedEvent.extendedProps.status.charAt(0).toUpperCase() +
                                                                selectedEvent.extendedProps.status.slice(1)}
                                                        </Badge>
                                                    </div>
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

                                                {selectedEvent.extendedProps.tutor && (
                                                    <div className="flex items-start gap-3 rounded-lg border border-orange-100 p-3">
                                                        <div className="rounded-full bg-orange-100 p-2">
                                                            <BookOpen className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-gray-500">
                                                                Tutor{selectedEvent.extendedProps.tutor_count && selectedEvent.extendedProps.tutor_count > 1 ? 's' : ''}
                                                            </p>
                                                            <p className="font-medium text-gray-900">{selectedEvent.extendedProps.tutor}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedEvent.extendedProps.program && (
                                                    <div className="flex items-center gap-3 rounded-lg border border-orange-100 p-3">
                                                        <div className="rounded-full bg-orange-100 p-2">
                                                            <Video className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Program</p>
                                                            <p className="font-medium text-gray-900">{selectedEvent.extendedProps.program}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedEvent.extendedProps.notes && (
                                                    <div className="rounded-lg border border-orange-100 bg-orange-50/50 p-3">
                                                        <p className="text-xs font-medium text-orange-800">Notes</p>
                                                        <p className="mt-1 text-sm text-gray-700">{selectedEvent.extendedProps.notes}</p>
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
                                        <div className="max-h-[300px] space-y-2 overflow-y-auto">
                                            {upcomingEvents.slice(0, 5).map((event) => (
                                                <div
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className="cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md"
                                                    style={{
                                                        borderColor: event.extendedProps.status === 'completed' ? '#bbf7d0' :
                                                                   event.extendedProps.status === 'ongoing' ? '#bfdbfe' :
                                                                   event.extendedProps.status === 'cancelled' ? '#fecaca' : '#fde68a',
                                                        backgroundColor: event.extendedProps.status === 'completed' ? '#f0fdf4' :
                                                                       event.extendedProps.status === 'ongoing' ? '#eff6ff' :
                                                                       event.extendedProps.status === 'cancelled' ? '#fef2f2' : '#fffbeb'
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                                            <p className="text-xs text-gray-600">
                                                                {new Date(event.start).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                                {event.extendedProps.start_time && (
                                                                    <span className="ml-2">
                                                                        {event.extendedProps.start_time} - {event.extendedProps.end_time}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            {event.extendedProps.learner && (
                                                                <p className="text-xs text-gray-600">
                                                                    Learner: {event.extendedProps.learner}
                                                                </p>
                                                            )}
                                                            {event.extendedProps.tutor && (
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    Tutor: {event.extendedProps.tutor}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge className={getStatusBadgeClass(event.extendedProps.status || 'pending')}>
                                                            {event.extendedProps.session_number}/{event.extendedProps.total_sessions}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                            {upcomingEvents.length > 5 && (
                                                <Button variant="link" className="w-full text-xs text-orange-600">
                                                    View {upcomingEvents.length - 5} more
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="py-4 text-center text-sm text-gray-500">No upcoming sessions</p>
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
