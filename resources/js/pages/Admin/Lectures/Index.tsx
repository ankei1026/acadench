import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Video, Link as LinkIcon, BookOpen, User, Plus, Pencil, Trash2, ExternalLink, Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatDate } from '@/lib/dateTimeFormat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LectureRow {
    lecture_id: string;
    name: string;
    platform: string;
    platform_link: string;
    created_at: string | null;
    program?: {
        prog_id: string;
        name: string;
        prog_type: string;
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
            name: string;
            nickname: string | null;
            photo: string | null;
        } | null;
        parent?: {
            name: string;
        } | null;
        tutor?: {
            tutor_id: string;
            first_name: string;
            last_name: string;
        } | null;
    } | null;
}

interface AvailableBooking {
    book_id: string;
    prog_type: string;
    program_name: string;
    learner_name: string;
    parent_name: string;
    book_date: string | null;
    session_count: number;
    notes: string | null;
}

interface AvailableTutor {
    tutor_id: string;
    name: string;
}

interface AdminLecturesPageProps {
    lectures: LectureRow[];
    available_bookings: AvailableBooking[];
    available_tutors: AvailableTutor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Lectures',
        href: '/admin/lectures',
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
        Mon: 'Monday',
        Tue: 'Tuesday',
        Wed: 'Wednesday',
        Thu: 'Thursday',
        Fri: 'Friday',
        Sat: 'Saturday',
        Sun: 'Sunday',
    };
    const dayArray = Array.isArray(days) ? days : [days];
    return dayArray.map((day) => dayMap[day] || day).join(', ');
};

export default function AdminLectures({ lectures, available_bookings, available_tutors }: AdminLecturesPageProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState<LectureRow | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
    } = useForm({
        book_id: '',
        name: '',
        platform: '',
        platform_link: '',
        tutor_id: '',
    });

    const handleCreate = () => {
        post('/admin/lectures', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Lecture created successfully');
                setCreateDialogOpen(false);
                reset();
            },
            onError: () => {
                toast.error('Failed to create lecture');
            },
        });
    };

    const handleEdit = (lecture: LectureRow) => {
        setSelectedLecture(lecture);
        setData({
            book_id: lecture.booking?.book_id || '',
            name: lecture.name,
            platform: lecture.platform || '',
            platform_link: lecture.platform_link || '',
            tutor_id: lecture.booking?.tutor?.tutor_id || '',
        });
        setEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedLecture) return;

        put(`/admin/lectures/${selectedLecture.lecture_id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Lecture updated successfully');
                setEditDialogOpen(false);
                setSelectedLecture(null);
                reset();
            },
            onError: () => {
                toast.error('Failed to update lecture');
            },
        });
    };

    const handleDelete = (lecture: LectureRow) => {
        if (!confirm(`Are you sure you want to delete "${lecture.name}"?`)) return;

        destroy(`/admin/lectures/${lecture.lecture_id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Lecture deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete lecture');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Lectures" />
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
                                    Manage Lectures
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Create and manage online class lectures for paid bookings</p>
                        </div>
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Lecture</DialogTitle>
                                    <DialogDescription>Add a lecture for a paid booking with meeting platform details.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="booking">Select Booking</Label>
                                        <Select
                                            value={data.book_id}
                                            onValueChange={(value) => {
                                                setData('book_id', value);
                                                const booking = available_bookings.find((b) => b.book_id === value);
                                                if (booking) {
                                                    setData('name', booking.program_name);
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a paid booking" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {available_bookings.map((booking) => (
                                                    <SelectItem key={booking.book_id} value={booking.book_id}>
                                                        {booking.program_name} - {booking.learner_name} ({booking.parent_name})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Lecture Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Math Lesson 1"
                                        />
                                    </div>
                                    {data.book_id && available_bookings.find((b) => b.book_id === data.book_id)?.prog_type !== 'hub' ? (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="platform">Platform</Label>
                                                <Select value={data.platform} onValueChange={(value) => setData('platform', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select platform" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Google Meet">Google Meet</SelectItem>
                                                        <SelectItem value="Zoom">Zoom</SelectItem>
                                                        <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                                                        <SelectItem value="Discord">Discord</SelectItem>
                                                        <SelectItem value="Skype">Skype</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="platform_link">Meeting Link</Label>
                                                <Input
                                                    id="platform_link"
                                                    value={data.platform_link}
                                                    onChange={(e) => setData('platform_link', e.target.value)}
                                                    placeholder="https://meet.google.com/..."
                                                />
                                            </div>
                                        </>
                                    ) : null}
                                    <div className="grid gap-2">
                                        <Label htmlFor="tutor">Assign Tutor (Optional)</Label>
                                        <Select value={data.tutor_id} onValueChange={(value) => setData('tutor_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a tutor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {available_tutors.map((tutor) => (
                                                    <SelectItem key={tutor.tutor_id} value={tutor.tutor_id}>
                                                        {tutor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreate}
                                        disabled={processing || !data.book_id || !data.name || (available_bookings.find((b) => b.book_id === data.book_id)?.prog_type !== 'hub' && (!data.platform || !data.platform_link))}
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                    >
                                        {processing ? 'Creating...' : 'Create Lecture'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
                    <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Active</p>
                                <p className="text-2xl font-bold text-gray-900">{lectures.length}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2.5">
                                <BookOpen className="h-5 w-5 text-white" />
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
                                <Card key={lecture.lecture_id} className="border-amber-200 bg-white shadow-md transition-all hover:shadow-lg">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage
                                                        src={lecture.booking?.learner?.photo || undefined}
                                                        alt={lecture.booking?.learner?.name}
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                                        {lecture.booking?.learner?.name?.charAt(0).toUpperCase() || 'L'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-lg font-semibold text-gray-900">{lecture.name}</CardTitle>
                                                    <p className="text-sm text-gray-500">
                                                        {lecture.booking?.learner?.nickname
                                                            ? `${lecture.booking.learner.name} (${lecture.booking.learner.nickname})`
                                                            : lecture.booking?.learner?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(lecture)}
                                                    className="rounded p-1.5 text-amber-600 hover:bg-amber-50"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lecture)}
                                                    className="rounded p-1.5 text-red-600 hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <BookOpen className="h-4 w-4 text-blue-500" />
                                        <span className="text-gray-600">Platform:</span>
                                        <span className="font-medium text-gray-900">{lecture.platform || '—'}</span>
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
                                            <span className="font-medium text-gray-900">{lecture.booking?.session_count || 0}</span>
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
                                                <span className="font-medium text-gray-900">{formatDays(lecture.program.days)}</span>
                                            </div>
                                        )}

                                        {/* Parent */}
                                        {lecture.booking?.parent && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-600">Parent:</span>
                                                <span className="font-medium text-gray-900">{lecture.booking.parent.name}</span>
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
                                                <FileText className="mt-0.5 h-4 w-4 text-gray-400" />
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

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            {lecture.platform_link && lecture.program?.prog_type !== 'hub' ? (
                                                <a
                                                    href={lecture.platform_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2 text-sm font-medium text-white hover:from-amber-600 hover:to-orange-600"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    Join Meeting
                                                </a>
                                            ) : null}
                                        </div>
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
                        <p className="mt-2 text-center text-gray-600">Create lectures for paid online bookings to get started.</p>
                    </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Lecture</DialogTitle>
                            <DialogDescription>Update the lecture details.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Lecture Name</Label>
                                <Input id="edit-name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            </div>
                            {selectedLecture && selectedLecture.program?.prog_type !== 'hub' ? (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-platform">Platform</Label>
                                        <Select value={data.platform} onValueChange={(value) => setData('platform', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select platform" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Google Meet">Google Meet</SelectItem>
                                                <SelectItem value="Zoom">Zoom</SelectItem>
                                                <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                                                <SelectItem value="Discord">Discord</SelectItem>
                                                <SelectItem value="Skype">Skype</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-platform_link">Meeting Link</Label>
                                        <Input
                                            id="edit-platform_link"
                                            value={data.platform_link}
                                            onChange={(e) => setData('platform_link', e.target.value)}
                                        />
                                    </div>
                                </>
                            ) : null}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-tutor">Assign Tutor (Optional)</Label>
                                <Select value={data.tutor_id} onValueChange={(value) => setData('tutor_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a tutor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {available_tutors.map((tutor) => (
                                            <SelectItem key={tutor.tutor_id} value={tutor.tutor_id}>
                                                {tutor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={processing || !data.name || (selectedLecture?.program?.prog_type !== 'hub' && (!data.platform || !data.platform_link))}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                            >
                                {processing ? 'Updating...' : 'Update Lecture'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
