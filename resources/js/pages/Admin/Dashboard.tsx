import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
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
    UserPlus,
    CheckCircle,
    XCircle,
    Clock3,
    RotateCcw,
    Edit,
    Save,
    UserCheck,
    UserX,
    MoreHorizontal,
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface Tutor {
    id: string;
    name: string;
    email?: string;
}

interface DashboardProps {
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
    availableTutors?: Array<{
        tutor_id: string;
        name: string;
        email?: string;
    }>;
}

export default function Dashboard({ calendarEvents = [], stats, availableTutors = [] }: DashboardProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
    const [currentTime, setCurrentTime] = useState(new Date());

    // State for modals
    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
    const [selectedTutorId, setSelectedTutorId] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [sessionNotes, setSessionNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>([]);
    const [showTutorSubstitutionModal, setShowTutorSubstitutionModal] = useState(false);
    const [maxTutorCapacity, setMaxTutorCapacity] = useState<number>(1);

    const [isSubstituting, setIsSubstituting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const calendarRef = useRef<any>(null);

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Calculate real stats or use provided ones
    const displayStats = stats || {
        totalBookings: 0,
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

    // Handle view change
    const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
        setCalendarView(view);
        if (calendarRef.current && calendarRef.current.getApi) {
            calendarRef.current.getApi().changeView(view);
        }
    };

    // Helper function to get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

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

    // Handle tutor substitution
    const handleTutorSubstitution = () => {
        if (!selectedEvent || selectedTutorIds.length === 0) return;

        // Check capacity
        if (selectedTutorIds.length > maxTutorCapacity) {
            toast.error(`Cannot assign more than ${maxTutorCapacity} tutor(s) for this program`);
            return;
        }

        setIsSubstituting(true);

        router.post(
            '/admin/sessions/substitute-tutor',
            {
                session_id: selectedEvent.extendedProps.session_id,
                tutor_ids: selectedTutorIds,
            },
            {
                onSuccess: () => {
                    toast.success('Tutors assigned successfully');
                    setShowTutorSubstitutionModal(false);
                    setSelectedTutorIds([]);
                    setIsSubstituting(false);
                    router.reload({ only: ['calendarEvents'] });
                },
                onError: (errors) => {
                    toast.error(errors.tutor_ids || errors.session_id || 'Failed to assign tutors');
                    console.error(errors);
                    setIsSubstituting(false);
                },
            },
        );
    };

    // Handle status update
    const handleStatusUpdate = () => {
        if (!selectedEvent || !selectedStatus) return;

        setIsUpdatingStatus(true);

        router.post(
            '/admin/sessions/update-status',
            {
                session_id: selectedEvent.extendedProps.session_id,
                status: selectedStatus,
                notes: sessionNotes,
            },
            {
                onSuccess: () => {
                    toast.success('Session status updated successfully');
                    setShowStatusUpdateModal(false);
                    setSelectedStatus('');
                    setSessionNotes('');
                    setIsUpdatingStatus(false);
                    router.reload({ only: ['calendarEvents'] });
                },
                onError: (errors) => {
                    toast.error(errors.status || errors.session_id || 'Failed to update session status');
                    console.error(errors);
                    setIsUpdatingStatus(false);
                },
            },
        );
    };

    // Open tutor substitution modal
    const openTutorSubstitution = (event: any) => {
        setSelectedEvent(event);
        // Pre-select current tutors
        const currentTutorIds = event.extendedProps.tutors?.map((t: any) => t.id) || [];
        setSelectedTutorIds(currentTutorIds);
        setMaxTutorCapacity(event.extendedProps.tutor_capacity || 1);
        setShowTutorSubstitutionModal(true);
    };

    const toggleTutorSelection = (tutorId: string) => {
        setSelectedTutorIds((prev) => {
            if (prev.includes(tutorId)) {
                return prev.filter((id) => id !== tutorId);
            } else {
                if (prev.length >= maxTutorCapacity) {
                    toast.warning(`Maximum ${maxTutorCapacity} tutor(s) allowed for this program`);
                    return prev;
                }
                return [...prev, tutorId];
            }
        });
    };

    // Open status update modal
    const openStatusUpdate = (event: any) => {
        setSelectedEvent(event);
        setSelectedStatus(event.extendedProps.status || 'pending');
        setSessionNotes(event.extendedProps.notes || '');
        setShowStatusUpdateModal(true);
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

                {/* Stats Grid */}
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
                                            <Badge className={getStatusBadgeClass(event.extendedProps.status)}>
                                                {event.extendedProps.session_number}/{event.extendedProps.total_sessions}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-600">
                                            <span className="font-medium">Learner:</span> {event.extendedProps.learner || 'TBA'}
                                        </p>
                                        <div className="text-xs text-gray-600">
                                            <span className="font-medium">Tutor{event.extendedProps.tutor_count > 1 ? 's' : ''}:</span>{' '}
                                            {event.extendedProps.tutor_count > 1 ? (
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

                                        // Get gradient based on status
                                        const getStatusGradient = (status: string) => {
                                            switch (status) {
                                                case 'completed':
                                                    return 'from-green-500 to-emerald-500';
                                                case 'ongoing':
                                                    return 'from-blue-500 to-cyan-500';
                                                case 'cancelled':
                                                    return 'from-red-500 to-rose-500';
                                                default:
                                                    return 'from-amber-500 to-orange-500';
                                            }
                                        };

                                        return (
                                            <div
                                                className={`flex flex-col overflow-hidden rounded bg-gradient-to-r ${getStatusGradient(status)} p-1 text-xs text-white shadow-sm`}
                                            >
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
                            <Card className="border border-amber-200 bg-white shadow-sm">
                                <CardHeader className="border-b border-amber-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-amber-800">
                                            <CalendarClock className="h-5 w-5 text-amber-500" />
                                            Session Details
                                        </CardTitle>
                                        {selectedEvent && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => openTutorSubstitution(selectedEvent)}>
                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                        Substitute Tutor
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openStatusUpdate(selectedEvent)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Update Status
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
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
                                                {selectedEvent.extendedProps.status && (
                                                    <Badge className={`mt-2 ${getStatusBadgeClass(selectedEvent.extendedProps.status)}`}>
                                                        {selectedEvent.extendedProps.status.charAt(0).toUpperCase() +
                                                            selectedEvent.extendedProps.status.slice(1)}
                                                    </Badge>
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

                                                <div className="flex items-start gap-3 rounded-lg border border-amber-100 p-3">
                                                    <div className="rounded-full bg-amber-100 p-2">
                                                        <BookOpen className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <p className="text-xs text-gray-500">
                                                                Tutor{selectedEvent.extendedProps.tutor_count > 1 ? 's' : ''}
                                                            </p>
                                                            {selectedEvent.extendedProps.tutor_capacity && (
                                                                <Badge className="bg-amber-50 text-[10px] text-amber-700">
                                                                    {selectedEvent.extendedProps.tutor_count || 0}/
                                                                    {selectedEvent.extendedProps.tutor_capacity} assigned
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {selectedEvent.extendedProps.tutors && selectedEvent.extendedProps.tutors.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {selectedEvent.extendedProps.tutors.map((tutor: Tutor, index: number) => (
                                                                    <div key={tutor.id} className="flex items-center gap-2">
                                                                        <Avatar className="h-6 w-6">
                                                                            <AvatarFallback className="bg-gradient-to-r from-amber-400 to-orange-400 text-[10px] text-white">
                                                                                {getInitials(tutor.name)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-900">{tutor.name}</p>
                                                                            {tutor.email && (
                                                                                <p className="text-[10px] text-gray-500">{tutor.email}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500">No tutors assigned</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 rounded-lg border border-amber-100 p-3">
                                                    <div className="rounded-full bg-amber-100 p-2">
                                                        <Target className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Program</p>
                                                        <p className="font-medium text-gray-900">{selectedEvent.extendedProps.program || '—'}</p>
                                                        {selectedEvent.extendedProps.program_type && (
                                                            <Badge className="mt-1 bg-amber-50 text-[10px] text-amber-700">
                                                                {selectedEvent.extendedProps.program_type}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {selectedEvent.extendedProps.notes && (
                                                    <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                                                        <p className="text-xs font-medium text-amber-800">Notes</p>
                                                        <p className="mt-1 text-sm text-gray-700">{selectedEvent.extendedProps.notes}</p>
                                                    </div>
                                                )}
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
                                                        <Badge className={getStatusBadgeClass(event.extendedProps.status)}>
                                                            {new Date(event.start).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-600">
                                                        Session {event.extendedProps.session_number}/{event.extendedProps.total_sessions}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-gray-500">{event.extendedProps.learner || 'No learner'}</p>
                                                        <div className="flex items-center gap-1">
                                                            {event.extendedProps.tutor_count > 1 ? (
                                                                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                                                    <Users className="h-3 w-3" />
                                                                    {event.extendedProps.tutor_count} tutors
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-gray-500">
                                                                    {event.extendedProps.tutor || 'No tutor'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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

            {/* Tutor Substitution Modal */}
            <Dialog open={showTutorSubstitutionModal} onOpenChange={setShowTutorSubstitutionModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Session Tutors</DialogTitle>
                        <DialogDescription>
                            Select up to {maxTutorCapacity} tutor{maxTutorCapacity > 1 ? 's' : ''} for this session.
                            {selectedEvent?.extendedProps.tutor_capacity && (
                                <Badge className="ml-2 bg-amber-100 text-amber-700">
                                    {selectedTutorIds.length}/{maxTutorCapacity} selected
                                </Badge>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Current Tutor(s)</Label>
                            <div className="mt-1 space-y-1">
                                {selectedEvent?.extendedProps.tutors && selectedEvent.extendedProps.tutors.length > 0 ? (
                                    selectedEvent.extendedProps.tutors.map((tutor: any) => (
                                        <div key={tutor.id} className="flex items-center gap-2 text-sm">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="bg-gradient-to-r from-amber-400 to-orange-400 text-[10px] text-white">
                                                    {getInitials(tutor.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-gray-700">{tutor.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No tutors assigned</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>Select Tutor(s)</Label>
                            <p className="mb-2 text-xs text-gray-500">Click to select/deselect tutors (max {maxTutorCapacity})</p>
                            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-amber-200 p-2">
                                {availableTutors.length > 0 ? (
                                    availableTutors.map((tutor) => {
                                        const isSelected = selectedTutorIds.includes(tutor.tutor_id);
                                        const isDisabled = !isSelected && selectedTutorIds.length >= maxTutorCapacity;

                                        return (
                                            <div
                                                key={tutor.tutor_id}
                                                className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-all ${isSelected ? 'border-amber-300 bg-amber-100' : 'hover:bg-amber-50'} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} `}
                                                onClick={() => !isDisabled && toggleTutorSelection(tutor.tutor_id)}
                                            >
                                                <div className="flex h-5 w-5 items-center justify-center">
                                                    {isSelected ? (
                                                        <CheckCircle className="h-5 w-5 text-amber-600" />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                                    )}
                                                </div>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-gradient-to-r from-amber-400 to-orange-400 text-xs text-white">
                                                        {getInitials(tutor.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{tutor.name}</p>
                                                    {tutor.email && <p className="text-xs text-gray-500">{tutor.email}</p>}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="py-4 text-center text-sm text-gray-500">No tutors available</p>
                                )}
                            </div>
                        </div>

                        {selectedTutorIds.length > 0 && (
                            <div className="rounded-lg bg-amber-50 p-3">
                                <p className="text-xs font-medium text-amber-800">Selected Tutors ({selectedTutorIds.length})</p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {selectedTutorIds.map((tutorId) => {
                                        const tutor = availableTutors.find((t) => t.tutor_id === tutorId);
                                        return tutor ? (
                                            <Badge key={tutorId} className="bg-amber-100 text-amber-700">
                                                {tutor.name}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTutorSubstitutionModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleTutorSubstitution} disabled={selectedTutorIds.length === 0 || isSubstituting}>
                            {isSubstituting ? 'Saving...' : `Assign ${selectedTutorIds.length} Tutor(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Update Modal */}
            {/* Status Update Modal */}
            <Dialog open={showStatusUpdateModal} onOpenChange={setShowStatusUpdateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Session Status</DialogTitle>
                        <DialogDescription>Change the status of this session and add optional notes.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={sessionNotes}
                                onChange={(e) => setSessionNotes(e.target.value)}
                                placeholder="Add any notes about this session..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStatusUpdateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleStatusUpdate} disabled={!selectedStatus || isUpdatingStatus}>
                            {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
