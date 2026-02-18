import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { formatDate } from '@/lib/dateTimeFormat';
import { useState, useEffect, useRef } from 'react';

// Icons
import {
    CalendarDays,
    CalendarClock,
    Users,
    BookOpen,
    TrendingUp,
    ChevronRight,
    Clock,
    UserCircle,
    Sparkles,
    Sun,
    Bell,
    Coffee,
    Award,
    Target,
    BarChart3,
    PlayCircle,
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface DashboardProps {
    activeBookings?: Array<any>;
    calendarEvents?: Array<any>;
    stats?: {
        totalBookings: number;
        activeLearners: number;
        activeTutors: number;
        totalSessions: number;
        revenue: number;
        completedSessions: number;
        upcomingSessions: number;
    };
}

export default function Dashboard({ activeBookings = [], calendarEvents = [], stats }: DashboardProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
    const [currentTime, setCurrentTime] = useState(new Date());

    const calendarRef = useRef<any>(null);

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Calculate real stats or use provided ones
    const displayStats = stats || {
        totalBookings: activeBookings.length,
        activeLearners: 0,
        activeTutors: 0,
        totalSessions: calendarEvents.length,
        revenue: 0,
        completedSessions: 0,
        upcomingSessions: calendarEvents.length,
    };

    // Get today's events
    const today = new Date().toISOString().split('T')[0];
    const todaysEvents = calendarEvents.filter((event) => event.start === today);

    // Get upcoming events (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingEvents = calendarEvents
        .filter((event) => {
            const eventDate = new Date(event.start);
            return eventDate >= new Date(today) && eventDate <= nextWeek;
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Group events by month for the progress stats
    const eventsByMonth = calendarEvents.reduce((acc: any, event) => {
        const month = new Date(event.start).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    // Handle view change
    const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
        setCalendarView(view);
        // If calendar is mounted, change its view via the FullCalendar API
        if (calendarRef.current && calendarRef.current.getApi) {
            calendarRef.current.getApi().changeView(view);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <Coffee className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Dashboard
                                </h1>
                            </div>
                            <p className="ml-2 flex items-center gap-1 text-gray-600">
                                <Sun className="h-4 w-4 text-amber-500" />
                                {currentTime.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-xs text-amber-700">
                                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Mild colors like Bookings page */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{displayStats.totalBookings}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <CalendarDays className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>+{Math.round(displayStats.totalBookings * 0.12)} from last month</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700">Active Learners</p>
                                <p className="text-2xl font-bold text-gray-900">{displayStats.activeLearners}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 p-2.5">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                            <Users className="h-3 w-3" />
                            <span>{displayStats.activeLearners} currently enrolled</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Total Sessions</p>
                                <p className="text-2xl font-bold text-gray-900">{displayStats.totalSessions}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                            <CalendarClock className="h-3 w-3" />
                            <span>{displayStats.upcomingSessions} upcoming</span>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule Preview */}
                {todaysEvents.length > 0 && (
                    <Card className="border border-amber-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                    <Clock className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-amber-800">Today's Schedule</h3>
                                <Badge className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                    {todaysEvents.length} sessions
                                </Badge>
                            </div>
                            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                                {todaysEvents.slice(0, 3).map((event) => (
                                    <div
                                        key={event.id}
                                        className="min-w-[250px] cursor-pointer rounded-lg border border-amber-200 bg-white p-3 shadow-sm transition-all hover:shadow-md"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900">{event.title}</p>
                                            <Badge className="bg-amber-100 text-xs text-amber-700">
                                                {event.extendedProps.session_number}/{event.extendedProps.total_sessions}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-600">
                                            <span className="font-medium">Learner:</span> {event.extendedProps.learner || 'TBA'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium">Tutor:</span> {event.extendedProps.tutor || 'Not assigned'}
                                        </p>
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
                                        <Badge className="border border-amber-200 bg-amber-100 text-amber-800">+{todaysEvents.length - 3} more</Badge>
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
                        <Card className="border border-amber-200 bg-white shadow-sm">
                            <CardHeader className="border-b border-amber-100 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-amber-800">
                                        <CalendarDays className="h-5 w-5 text-amber-500" />
                                        Sessions Calendar
                                    </CardTitle>
                                    <div className="flex items-center gap-1 rounded-lg border border-amber-200 bg-white p-1">
                                        <Button
                                            variant={calendarView === 'dayGridMonth' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => handleViewChange('dayGridMonth')}
                                            className={`text-xs ${
                                                calendarView === 'dayGridMonth'
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                    : 'text-amber-700 hover:bg-amber-50'
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
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                    : 'text-amber-700 hover:bg-amber-50'
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
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                    : 'text-amber-700 hover:bg-amber-50'
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
                                    eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
                                    eventContent={(eventInfo) => {
                                        const sessionNum = eventInfo.event.extendedProps.session_number;
                                        const totalSessions = eventInfo.event.extendedProps.total_sessions;
                                        return (
                                            <div className="flex items-center gap-1 overflow-hidden rounded bg-gradient-to-r from-amber-500 to-orange-500 p-1 text-xs text-white shadow-sm">
                                                <span className="truncate font-medium">{eventInfo.event.title}</span>
                                                {eventInfo.view.type !== 'dayGridMonth' && (
                                                    <Badge className="ml-auto border-0 bg-white/20 text-[8px] text-white">
                                                        {sessionNum}/{totalSessions}
                                                    </Badge>
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
                            <Card className="border border-amber-200 bg-white shadow-sm">
                                <CardHeader className="border-b border-amber-100 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-amber-800">
                                        <CalendarClock className="h-5 w-5 text-amber-500" />
                                        Session Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {selectedEvent ? (
                                        <div className="space-y-4">
                                            <div className="rounded-lg border border-amber-200 p-4">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <h4 className="font-semibold text-gray-900">{selectedEvent.title}</h4>
                                                    <Badge className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                                        Session {selectedEvent.extendedProps.session_number}/
                                                        {selectedEvent.extendedProps.total_sessions}
                                                    </Badge>
                                                </div>
                                                <p className="flex items-center gap-1 text-sm text-gray-600">
                                                    <CalendarDays className="h-4 w-4 text-amber-500" />
                                                    {formatDate(selectedEvent.start)}
                                                </p>
                                                {selectedEvent.extendedProps.start_time && (
                                                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                                                        <Clock className="h-4 w-4 text-amber-500" />
                                                        {selectedEvent.extendedProps.start_time} - {selectedEvent.extendedProps.end_time}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 rounded-lg border border-amber-100 p-3">
                                                    <div className="rounded-full bg-amber-100 p-2">
                                                        <UserCircle className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Learner</p>
                                                        <p className="font-medium text-gray-900">{selectedEvent.extendedProps.learner || '—'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 rounded-lg border border-amber-100 p-3">
                                                    <div className="rounded-full bg-amber-100 p-2">
                                                        <BookOpen className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Tutor</p>
                                                        <p className="font-medium text-gray-900">
                                                            {selectedEvent.extendedProps.tutor || 'Not assigned'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 rounded-lg border border-amber-100 p-3">
                                                    <div className="rounded-full bg-amber-100 p-2">
                                                        <Target className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Program</p>
                                                        <p className="font-medium text-gray-900">{selectedEvent.extendedProps.program || '—'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <div className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 p-4">
                                                <CalendarDays className="h-8 w-8 text-amber-500" />
                                            </div>
                                            <p className="mt-3 text-sm text-gray-500">Click on any session in the calendar to view details</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Upcoming Sessions Preview */}
                            <Card className="border border-amber-200 bg-white shadow-sm">
                                <CardHeader className="border-b border-amber-100 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-amber-800">
                                        <PlayCircle className="h-5 w-5 text-amber-500" />
                                        Upcoming (Next 7 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {upcomingEvents.length > 0 ? (
                                        <div className="max-h-[300px] space-y-2 overflow-y-auto">
                                            {upcomingEvents.slice(0, 5).map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="cursor-pointer rounded-lg border border-amber-200 p-3 transition-all hover:shadow-md"
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                                        <Badge className="border border-amber-200 bg-white text-[10px] text-amber-700">
                                                            {new Date(event.start).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-600">
                                                        Session {event.extendedProps.session_number}/{event.extendedProps.total_sessions}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {event.extendedProps.learner || 'No learner'} • {event.extendedProps.tutor || 'No tutor'}
                                                    </p>
                                                </div>
                                            ))}
                                            {upcomingEvents.length > 5 && (
                                                <Button variant="link" className="w-full text-xs text-amber-600">
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
