import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    ArrowLeft,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    User,
    BookOpen,
    Heart,
    Star,
    MapPin,
    Briefcase,
    GraduationCap,
    Users,
    Calendar,
    Award,
    Sparkles,
    BrainCircuit,
    Home,
    FileText,
    Bell,
    Mail,
} from 'lucide-react';
import { formatDateTime } from '@/lib/dateTimeFormat';
import { toast } from 'sonner';
import { useState } from 'react';

interface TutorApplicationShowProps {
    application: {
        id: string;
        full_name: string;
        email: string;
        phone: string;
        birthdate: string;
        age: string;
        gender: string;
        home_address: string;
        contact_number: string;
        facebook_link: string;
        mother_name: string;
        father_name: string;
        living_status: string;
        high_school: string;
        college_school: string;
        college_course: string;
        is_licensed_teacher: boolean;
        license_date: string | null;
        employment_status: string;
        current_employer: string;
        working_hours: string;
        tutoring_experience_levels: string[];
        tutoring_experience_duration: string;
        has_school_teaching_experience: boolean;
        school_teaching_experience_duration: string;
        previous_clients: string;
        favorite_subject_to_teach: string;
        easiest_subject_to_teach: string;
        most_difficult_subject_to_teach: string;
        easier_school_level_to_teach: string;
        harder_school_level_to_teach: string;
        reasons_love_teaching: string[];
        work_preference: string;
        class_size_preference: string;
        teaching_values: string[];
        application_reasons: string[];
        outside_activities: string[];
        distance_from_hub_minutes: number;
        distance_from_work_minutes: number;
        transportation_mode: string;
        enjoy_playing_with_kids_rating: number;
        preferred_toys_games: string[];
        annoyances: string[];
        need_job_rating: number;
        public_speaking_rating: number;
        penmanship_rating: number;
        creativity_rating: number;
        english_proficiency_rating: number;
        preferred_teaching_language: string;
        edtech_opinion: string;
        needs_phone_while_teaching: boolean;
        phone_usage_reason: string | null;
        teaching_difficulty_approach: string;
        discipline_approach: string;
        approves_late_fine_reward: boolean;
        late_fine_reason: string | null;
        expected_tenure: string;
        preferred_workdays: string[];
        preferred_workdays_frequency: string;
        preferred_schedule: string;
        cleanliness_importance_rating: number;
        organization_importance_rating: number;
        shared_environment_comfort_rating: number;
        teaching_style_preference: string;
        ok_with_team_meetings: boolean;
        ok_with_parent_meetings: boolean;
        recording_comfort: string;
        ok_with_media_usage: boolean;
        subject: string;
        document_path: string | null;
        status: 'pending' | 'approved' | 'rejected';
        created_at: string;
        notes: string | null;
    };
}

const statusConfig = {
    pending: {
        label: 'Pending Review',
        icon: Clock,
        color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle,
        color: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        color: 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-800 border border-rose-200',
    },
};

const sectionConfig = {
    personal: { icon: User, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    family: { icon: Home, color: 'from-amber-500 to-orange-500', bg: 'bg-orange-50' },
    education: { icon: GraduationCap, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    experience: { icon: Briefcase, color: 'from-amber-500 to-orange-500', bg: 'bg-orange-50' },
    preferences: { icon: Heart, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    logistics: { icon: MapPin, color: 'from-amber-500 to-orange-500', bg: 'bg-orange-50' },
    ratings: { icon: Star, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    technology: { icon: BrainCircuit, color: 'from-amber-500 to-orange-500', bg: 'bg-orange-50' },
    commitment: { icon: Calendar, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    environment: { icon: Users, color: 'from-amber-500 to-orange-500', bg: 'bg-orange-50' },
    details: { icon: FileText, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
};

export default function TutorApplicationShow({ application }: TutorApplicationShowProps) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const formatEnum = (value: string | null | undefined) => {
        return value ? value.replace(/_/g, ' ') : '—';
    };

    const safeArray = <T,>(value: T[] | null | undefined): T[] => {
        return Array.isArray(value) ? value : [];
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tutor Applications',
            href: '/admin/tutor-applications',
        },
        {
            title: application.full_name,
            href: `/admin/tutor-applications/${application.id}`,
        },
    ];

    const handleDownload = async () => {
        try {
            const response = await fetch(`/admin/tutor-applications/${application.id}/download`);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${application.full_name}_application.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Document downloaded successfully!');
        } catch (error) {
            toast.error('Failed to download document');
        }
    };

    const handleApprove = () => {
        setIsApproving(true);
        router.patch(
            `/admin/tutor-applications/${application.id}/approve`,
            {},
            {
                onSuccess: () => {
                    setIsApproving(false);
                    toast.success('Application approved successfully!', {
                        description: `${application.full_name} has been approved as a tutor.`,
                        duration: 5000,
                    });
                },
                onError: () => {
                    setIsApproving(false);
                    toast.error('Failed to approve application', {
                        description: 'Please try again or contact support.',
                        duration: 5000,
                    });
                },
            },
        );
    };

    const handleReject = () => {
        setIsRejecting(true);
        router.patch(
            `/admin/tutor-applications/${application.id}/reject`,
            {},
            {
                onSuccess: () => {
                    setIsRejecting(false);
                    toast.error('Application rejected', {
                        description: `${application.full_name}'s application has been rejected.`,
                        duration: 5000,
                    });
                },
                onError: () => {
                    setIsRejecting(false);
                    toast.error('Failed to reject application', {
                        description: 'Please try again or contact support.',
                        duration: 5000,
                    });
                },
            },
        );
    };

    const statusConfig_ = statusConfig[application.status];
    const StatusIcon = statusConfig_.icon;

    const { date, time } = formatDateTime(application.created_at);

    const RatingDots = ({ rating, color = 'amber' }: { rating: number; color?: string }) => {
        const getColor = (index: number) => {
            if (index < rating) {
                return color === 'amber' ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-blue-400 to-blue-500';
            }
            return 'bg-gray-200';
        };

        return (
            <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-3 w-3 rounded-full ${getColor(i)} transition-all duration-200 ${i < rating ? 'scale-110' : ''}`} />
                ))}
            </div>
        );
    };

    const SectionHeader = ({ title, icon: Icon, color = 'from-amber-500 to-orange-500' }: { title: string; icon: any; color?: string }) => (
        <div className="mb-6 flex items-center gap-3">
            <div className={`rounded-lg bg-gradient-to-r ${color} p-2.5 shadow-sm`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <h2 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-2xl font-bold text-transparent">{title}</h2>
        </div>
    );

    const InfoRow = ({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) => (
        <div className={fullWidth ? 'md:col-span-2 lg:col-span-3' : ''}>
            <p className="mb-1 text-sm text-gray-600">{label}</p>
            <div className="font-semibold text-gray-900">{value || '—'}</div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${application.full_name} - Application Details`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/tutor-applications')}
                                className="flex items-center gap-2 hover:bg-amber-100/50 hover:text-amber-700"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Applications
                            </Button>
                            <div className="flex items-center gap-3">
                                <Badge className={`${statusConfig_.color} px-4 py-2 text-sm font-medium shadow-sm`}>
                                    <StatusIcon className="mr-2 h-4 w-4" />
                                    {statusConfig_.label}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900">{application.full_name}</h1>
                                </div>
                                <p className="ml-2 text-gray-600">
                                    Applied on {date} at {time}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {application.status === 'pending' && (
                                    <>
                                        {/* Approve Dialog */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md hover:from-emerald-600 hover:to-green-600"
                                                    disabled={isApproving || isRejecting}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    {isApproving ? 'Approving...' : 'Approve'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="border-amber-200">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-2xl font-bold text-transparent">
                                                        Approve Application
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="pt-2 text-gray-600">
                                                        You are about to approve{' '}
                                                        <span className="font-semibold text-gray-900">{application.full_name}</span>'s tutor
                                                        application. This will:
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="gap-3">
                                                    <AlertDialogCancel className="border-gray-200 hover:bg-gray-50 hover:text-gray-900">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleApprove}
                                                        disabled={isApproving}
                                                        className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                                                    >
                                                        {isApproving ? (
                                                            <>
                                                                <span className="mr-2">Approving...</span>
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                            </>
                                                        ) : (
                                                            'Confirm Approval'
                                                        )}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        {/* Reject Dialog */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    className="bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-md hover:from-rose-600 hover:to-red-600"
                                                    disabled={isApproving || isRejecting}
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    {isRejecting ? 'Rejecting...' : 'Reject'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="border-amber-200">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-2xl font-bold text-transparent">
                                                        Reject Application
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="pt-2 text-gray-600">
                                                        You are about to reject{' '}
                                                        <span className="font-semibold text-gray-900">{application.full_name}</span>'s tutor
                                                        application. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="gap-3">
                                                    <AlertDialogCancel className="border-gray-200 hover:bg-gray-50 hover:text-gray-900">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleReject}
                                                        disabled={isRejecting}
                                                        className="bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600"
                                                    >
                                                        {isRejecting ? (
                                                            <>
                                                                <span className="mr-2">Rejecting...</span>
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                            </>
                                                        ) : (
                                                            'Confirm Rejection'
                                                        )}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                                {application.document_path && (
                                    <Button
                                        onClick={handleDownload}
                                        variant="outline"
                                        className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                        disabled={isApproving || isRejecting}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Resume
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Personal Information */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader title="Personal Information" icon={sectionConfig.personal.icon} color={sectionConfig.personal.color} />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <InfoRow label="Full Name" value={application.full_name} />
                                <InfoRow label="Email" value={application.email} />
                                <InfoRow label="Phone" value={application.phone} />
                                <InfoRow
                                    label="Birthdate"
                                    value={
                                        application.birthdate
                                            ? new Date(application.birthdate).toLocaleDateString(undefined, {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : '—'
                                    }
                                />
                                <InfoRow label="Age" value={application.age} />
                                <InfoRow label="Gender" value={<span className="capitalize">{application.gender}</span>} />
                                <InfoRow label="Contact Number" value={application.contact_number} />
                                <InfoRow label="Living Status" value={<span className="capitalize">{application.living_status}</span>} />
                                <InfoRow label="Home Address" value={application.home_address} fullWidth />
                                <InfoRow
                                    label="Facebook Link"
                                    value={
                                        <a
                                            href={application.facebook_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-600 hover:text-amber-700 hover:underline"
                                        >
                                            {application.facebook_link}
                                        </a>
                                    }
                                    fullWidth
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Family Information */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader title="Family Information" icon={sectionConfig.family.icon} color={sectionConfig.family.color} />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <InfoRow label="Mother's Name" value={application.mother_name} />
                                <InfoRow label="Father's Name" value={application.father_name} />
                            </div>
                        </div>
                    </Card>

                    {/* Educational Background */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader title="Educational Background" icon={sectionConfig.education.icon} color={sectionConfig.education.color} />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <InfoRow label="High School" value={application.high_school} />
                                <InfoRow label="College/University" value={application.college_school} />
                                <InfoRow label="College Course" value={application.college_course} />
                                <InfoRow label="Licensed Teacher" value={application.is_licensed_teacher ? 'Yes' : 'No'} />
                                {application.is_licensed_teacher && application.license_date && (
                                    <InfoRow label="License Date" value={application.license_date} />
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Teaching Experience */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader title="Teaching Experience" icon={sectionConfig.experience.icon} color={sectionConfig.experience.color} />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <InfoRow label="Employment Status" value={<span className="capitalize">{application.employment_status}</span>} />
                                <InfoRow label="Current Employer" value={application.current_employer} />
                                <InfoRow label="Working Hours" value={application.working_hours} />
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">Tutoring Experience Levels</p>
                                    <div className="flex flex-wrap gap-2">
                                        {safeArray(application.tutoring_experience_levels).map((level, idx) => (
                                            <Badge key={idx} variant="secondary" className="border-amber-200 bg-amber-50 text-amber-700">
                                                {level}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <InfoRow label="Tutoring Experience Duration" value={application.tutoring_experience_duration} fullWidth />
                                <InfoRow label="School Teaching Experience" value={application.has_school_teaching_experience ? 'Yes' : 'No'} />
                                <InfoRow label="School Teaching Duration" value={application.school_teaching_experience_duration} />
                                <InfoRow label="Previous Clients" value={application.previous_clients} fullWidth />
                            </div>
                        </div>
                    </Card>

                    {/* Teaching Preferences and Skills */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader
                                title="Teaching Preferences & Skills"
                                icon={sectionConfig.preferences.icon}
                                color={sectionConfig.preferences.color}
                            />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <InfoRow label="Favorite Subject" value={application.favorite_subject_to_teach} />
                                <InfoRow label="Easiest Subject" value={application.easiest_subject_to_teach} />
                                <InfoRow label="Most Difficult Subject" value={application.most_difficult_subject_to_teach} />
                                <InfoRow label="Easier School Level" value={application.easier_school_level_to_teach} />
                                <InfoRow label="Harder School Level" value={application.harder_school_level_to_teach} />
                                <InfoRow label="Work Preference" value={<span className="capitalize">{application.work_preference}</span>} />
                                <InfoRow
                                    label="Class Size Preference"
                                    value={<span className="capitalize">{formatEnum(application.class_size_preference)}</span>}
                                />
                                <div className="md:col-span-2">
                                    <p className="mb-1 text-sm text-gray-600">Reasons for Loving Teaching</p>
                                    <div className="flex flex-wrap gap-2">
                                        {safeArray(application.reasons_love_teaching).map((reason, idx) => (
                                            <Badge key={idx} variant="secondary" className="border-amber-200 bg-amber-50 text-amber-700">
                                                {reason}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="mb-1 text-sm text-gray-600">Teaching Values</p>
                                    <div className="flex flex-wrap gap-2">
                                        {safeArray(application.teaching_values).map((value, idx) => (
                                            <Badge key={idx} variant="secondary" className="border-amber-200 bg-amber-50 text-amber-700">
                                                {value}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="mb-1 text-sm text-gray-600">Application Reasons</p>
                                    <div className="flex flex-wrap gap-2">
                                        {safeArray(application.application_reasons).map((reason, idx) => (
                                            <Badge key={idx} variant="secondary" className="border-amber-200 bg-amber-50 text-amber-700">
                                                {reason}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="mb-1 text-sm text-gray-600">Outside Activities</p>
                                    <div className="flex flex-wrap gap-2">
                                        {safeArray(application.outside_activities).map((activity, idx) => (
                                            <Badge key={idx} variant="secondary" className="border-amber-200 bg-amber-50 text-amber-700">
                                                {activity}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Logistics */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader title="Logistics" icon={sectionConfig.logistics.icon} color={sectionConfig.logistics.color} />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <InfoRow label="Distance from Hub (minutes)" value={`${application.distance_from_hub_minutes} min`} />
                                <InfoRow label="Distance from Work (minutes)" value={`${application.distance_from_work_minutes} min`} />
                                <InfoRow label="Transportation Mode" value={<span className="capitalize">{application.transportation_mode}</span>} />
                            </div>
                        </div>
                    </Card>

                    {/* Ratings */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader title="Self-Ratings" icon={sectionConfig.ratings.icon} color={sectionConfig.ratings.color} />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Enjoy Playing with Kids</p>
                                    <RatingDots rating={application.enjoy_playing_with_kids_rating} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Need Job</p>
                                    <RatingDots rating={application.need_job_rating} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Public Speaking</p>
                                    <RatingDots rating={application.public_speaking_rating} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Penmanship</p>
                                    <RatingDots rating={application.penmanship_rating} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Creativity</p>
                                    <RatingDots rating={application.creativity_rating} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">English Proficiency</p>
                                    <RatingDots rating={application.english_proficiency_rating} />
                                </div>
                                <div className="md:col-span-2 lg:col-span-3">
                                    <p className="mb-1 text-sm text-gray-600">Preferred Toys/Games</p>
                                    <div className="flex flex-wrap gap-2">
                                        {safeArray(application.preferred_toys_games).map((toy, idx) => (
                                            <Badge key={idx} variant="secondary" className="border-amber-200 bg-amber-50 text-amber-700">
                                                {toy}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="mb-1 text-sm text-gray-600">Annoyances</p>
                                    <div className="flex flex-wrap gap-2">
                                        {safeArray(application.annoyances).map((annoyance, idx) => (
                                            <Badge key={idx} variant="secondary" className="border-amber-200 bg-amber-50 text-amber-700">
                                                {annoyance}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <InfoRow label="Preferred Teaching Language" value={application.preferred_teaching_language} />
                            </div>
                        </div>
                    </Card>

                    {/* Technology & Teaching Methods */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader
                                title="Technology & Teaching Methods"
                                icon={sectionConfig.technology.icon}
                                color={sectionConfig.technology.color}
                            />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <InfoRow label="EdTech Opinion" value={<span className="capitalize">{application.edtech_opinion}</span>} />
                                <InfoRow label="Needs Phone While Teaching" value={application.needs_phone_while_teaching ? 'Yes' : 'No'} />
                                {application.needs_phone_while_teaching && application.phone_usage_reason && (
                                    <InfoRow label="Phone Usage Reason" value={application.phone_usage_reason} fullWidth />
                                )}
                                <InfoRow label="Teaching Difficulty Approach" value={application.teaching_difficulty_approach} fullWidth />
                                <InfoRow label="Discipline Approach" value={application.discipline_approach} fullWidth />
                                <InfoRow label="Approves Late Fine & Reward System" value={application.approves_late_fine_reward ? 'Yes' : 'No'} />
                                {application.approves_late_fine_reward && application.late_fine_reason && (
                                    <InfoRow label="Late Fine Reason" value={application.late_fine_reason} fullWidth />
                                )}
                                <InfoRow
                                    label="Expected Tenure"
                                    value={<span className="capitalize">{formatEnum(application.expected_tenure)}</span>}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Commitment */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader title="Commitment" icon={sectionConfig.commitment.icon} color={sectionConfig.commitment.color} />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <p className="mb-1 text-sm text-gray-600">Preferred Workdays</p>
                                    <div className="flex flex-wrap gap-2">
                                        {safeArray(application.preferred_workdays).map((day, idx) => (
                                            <Badge key={idx} variant="secondary" className="border-amber-200 bg-amber-50 text-amber-700">
                                                {day}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <InfoRow
                                    label="Work Frequency"
                                    value={<span className="capitalize">{formatEnum(application.preferred_workdays_frequency)}</span>}
                                />
                                <InfoRow
                                    label="Preferred Schedule"
                                    value={<span className="capitalize">{formatEnum(application.preferred_schedule)}</span>}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Work Environment Preferences */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader
                                title="Work Environment Preferences"
                                icon={sectionConfig.environment.icon}
                                color={sectionConfig.environment.color}
                            />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Cleanliness Importance</p>
                                    <RatingDots rating={application.cleanliness_importance_rating} color="blue" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Organization Importance</p>
                                    <RatingDots rating={application.organization_importance_rating} color="blue" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Shared Environment Comfort</p>
                                    <RatingDots rating={application.shared_environment_comfort_rating} color="blue" />
                                </div>
                                <InfoRow
                                    label="Teaching Style Preference"
                                    value={<span className="capitalize">{application.teaching_style_preference}</span>}
                                />
                                <InfoRow label="OK with Team Meetings" value={application.ok_with_team_meetings ? 'Yes' : 'No'} />
                                <InfoRow label="OK with Parent Meetings" value={application.ok_with_parent_meetings ? 'Yes' : 'No'} />
                                <InfoRow label="Recording Comfort" value={<span className="capitalize">{application.recording_comfort}</span>} />
                                <InfoRow label="OK with Media Usage" value={application.ok_with_media_usage ? 'Yes' : 'No'} />
                            </div>
                        </div>
                    </Card>

                    {/* Application Details */}
                    <Card className="overflow-hidden border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <SectionHeader title="Application Details" icon={sectionConfig.details.icon} color={sectionConfig.details.color} />
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <InfoRow label="Subject Love to Teach" value={application.subject} />
                                <InfoRow label="Applied On" value={`${date} at ${time}`} />
                                {application.notes && <InfoRow label="Admin Notes" value={application.notes} fullWidth />}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
