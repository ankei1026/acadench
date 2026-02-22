import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ArrowLeft, BookOpen, Mail, Phone, Globe, FileText, User, Link2,
    GraduationCap, Briefcase, Heart, MapPin, Star, BrainCircuit,
    Calendar, Users, Home
} from 'lucide-react';

interface Tutor {
    id: number;
    tutor_id: string;
    subject: string;
    specializations: string | null;
    rate_per_hour: string | null;
    bio: string | null;
    photo: string | null;
    mop: string | null;
    number: string | null;
    status: string;
    portfolio_link: string | null;

    // Personal Information
    full_name: string | null;
    email: string | null;
    birthdate: string | null;
    age: string | null;
    gender: string | null;
    home_address: string | null;
    facebook_link: string | null;
    contact_number: string | null;
    mother_name: string | null;
    father_name: string | null;
    living_status: string | null;

    // Educational Background
    high_school: string | null;
    college_school: string | null;
    college_course: string | null;
    is_licensed_teacher: boolean;
    license_date: string | null;

    // Teaching Experience
    employment_status: string | null;
    current_employer: string | null;
    working_hours: string | null;
    tutoring_experience_levels: string[];
    tutoring_experience_duration: string | null;
    has_school_teaching_experience: boolean;
    school_teaching_experience_duration: string | null;
    previous_clients: string | null;

    // Preferences and Skills
    favorite_subject_to_teach: string | null;
    easiest_subject_to_teach: string | null;
    most_difficult_subject_to_teach: string | null;
    easier_school_level_to_teach: string | null;
    harder_school_level_to_teach: string | null;
    reasons_love_teaching: string[];
    work_preference: string | null;
    class_size_preference: string | null;
    teaching_values: string[];
    application_reasons: string[];
    outside_activities: string[];

    // Logistics
    distance_from_hub_minutes: number;
    distance_from_work_minutes: number;
    transportation_mode: string | null;

    // Ratings and Preferences
    enjoy_playing_with_kids_rating: number;
    preferred_toys_games: string[];
    annoyances: string[];
    need_job_rating: number;
    public_speaking_rating: number;
    penmanship_rating: number;
    creativity_rating: number;
    english_proficiency_rating: number;
    preferred_teaching_language: string | null;

    // Technology and Teaching Methods
    edtech_opinion: string | null;
    needs_phone_while_teaching: boolean;
    phone_usage_reason: string | null;
    teaching_difficulty_approach: string | null;
    discipline_approach: string | null;
    approves_late_fine_reward: boolean;
    late_fine_reason: string | null;
    expected_tenure: string | null;

    // Commitment
    preferred_workdays: string[];
    preferred_workdays_frequency: string | null;
    preferred_schedule: string | null;

    // Work Environment Preferences
    cleanliness_importance_rating: number;
    organization_importance_rating: number;
    shared_environment_comfort_rating: number;
    teaching_style_preference: string | null;
    ok_with_team_meetings: boolean;
    ok_with_parent_meetings: boolean;
    recording_comfort: string | null;
    ok_with_media_usage: boolean;

    user: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface Props {
    tutor: Tutor;
}

export default function TutorShow({ tutor }: Props) {
    const breadcrumbs = [
        { title: 'Tutors', href: '/admin/tutors' },
        { title: tutor.user?.name || 'Tutor Details', href: '#' },
    ];

    const formatEnum = (value: string | null | undefined) => {
        return value ? value.replace(/_/g, ' ') : '—';
    };

    const safeArray = <T,>(value: T[] | null | undefined): T[] => {
        return Array.isArray(value) ? value : [];
    };

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

    const InfoRow = ({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) => (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 font-medium text-gray-900 break-words">{value || '—'}</div>
        </div>
    );

    const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
        <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5 shadow-sm">
                <Icon className="h-5 w-5 text-white" />
            </div>
            <h2 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-xl font-bold text-transparent">{title}</h2>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tutor: ${tutor.user?.name || 'Details'}`} />

            <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4 md:p-6">
                {/* Back Button */}
                <div className="mb-4">
                    <Link href="/admin/tutors">
                        <Button variant="ghost" className="gap-2 hover:bg-amber-100/50 hover:text-amber-700">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Tutors
                        </Button>
                    </Link>
                </div>

                {/* Two Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar - Sticky */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="sticky top-6">
                            <Card className="border-amber-200 bg-white shadow-lg overflow-hidden">
                                {/* Profile Header with Gradient */}
                                <div className="px-6 text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="rounded-full border-4 border-white/50 shadow-xl overflow-hidden">
                                            <Avatar className="h-28 w-28">
                                                <AvatarImage src={tutor.photo || undefined} alt={tutor.user?.name} />
                                                <AvatarFallback className="bg-gradient-to-r from-amber-600 to-orange-600 text-3xl text-black">
                                                    {tutor.user?.name?.charAt(0).toUpperCase() || 'T'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-black">{tutor.user?.name}</h3>
                                </div>

                                {/* Contact Info */}
                                <CardContent className="px-5 space-y-4">
                                    <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
                                        <User className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold uppercase text-gray-500">Tutor ID</p>
                                            <p className="font-mono font-bold text-amber-700 break-all">{tutor.tutor_id}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                                        <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold uppercase text-gray-500">Email</p>
                                            <p className="font-medium text-blue-700 break-all">{tutor.user?.email}</p>
                                        </div>
                                    </div>

                                    {tutor.number && (
                                        <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
                                            <Phone className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold uppercase text-gray-500">Phone</p>
                                                <p className="font-medium text-green-700 break-all">{tutor.number}</p>
                                            </div>
                                        </div>
                                    )}

                                    {tutor.portfolio_link && (
                                        <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3">
                                            <Globe className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold uppercase text-gray-500">Portfolio</p>
                                                <a
                                                    href={tutor.portfolio_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-purple-700 hover:underline break-all text-sm"
                                                >
                                                    {tutor.portfolio_link}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Content - Scrollable */}
                    <div className="flex-1 pr-2">
                        <div className="space-y-6">
                            {/* Profile & Basic Info */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Profile & Basic Information" icon={BookOpen} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="Subject" value={tutor.subject || 'Not specified'} />
                                        <InfoRow label="Specializations" value={tutor.specializations} />
                                        <InfoRow label="Bio" value={tutor.bio} fullWidth />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Personal Information */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Personal Information" icon={User} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="Full Name" value={tutor.full_name} />
                                        <InfoRow label="Email" value={tutor.email} />
                                        <InfoRow label="Birthdate" value={tutor.birthdate} />
                                        <InfoRow label="Age" value={tutor.age} />
                                        <InfoRow label="Gender" value={formatEnum(tutor.gender)} />
                                        <InfoRow label="Contact Number" value={tutor.number} />
                                        <InfoRow label="Living Status" value={formatEnum(tutor.living_status)} />
                                        <InfoRow label="Home Address" value={tutor.home_address} fullWidth />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Family Information */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Family Information" icon={Home} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="Mother's Name" value={tutor.mother_name} />
                                        <InfoRow label="Father's Name" value={tutor.father_name} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Educational Background */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Educational Background" icon={GraduationCap} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="High School" value={tutor.high_school} />
                                        <InfoRow label="College/University" value={tutor.college_school} />
                                        <InfoRow label="College Course" value={tutor.college_course} />
                                        <InfoRow label="Licensed Teacher" value={tutor.is_licensed_teacher ? '✓ Yes' : '✗ No'} />
                                        {tutor.license_date && <InfoRow label="License Date" value={tutor.license_date} />}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Teaching Experience */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Teaching Experience" icon={Briefcase} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="Employment Status" value={formatEnum(tutor.employment_status)} />
                                        <InfoRow label="Current Employer" value={tutor.current_employer} />
                                        <InfoRow label="Working Hours" value={tutor.working_hours} />
                                        <InfoRow label="Tutoring Duration" value={tutor.tutoring_experience_duration} />
                                        <InfoRow label="School Teaching Experience" value={tutor.has_school_teaching_experience ? '✓ Yes' : '✗ No'} />
                                        <InfoRow label="School Teaching Duration" value={tutor.school_teaching_experience_duration} />
                                        <InfoRow label="Tutoring Experience Levels" value={safeArray(tutor.tutoring_experience_levels).length > 0 ? safeArray(tutor.tutoring_experience_levels).join(', ') : undefined} fullWidth />
                                        <InfoRow label="Previous Clients" value={tutor.previous_clients} fullWidth />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Teaching Preferences & Skills */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Teaching Preferences & Skills" icon={Heart} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="Favorite Subject" value={tutor.favorite_subject_to_teach} />
                                        <InfoRow label="Easiest Subject" value={tutor.easiest_subject_to_teach} />
                                        <InfoRow label="Most Difficult Subject" value={tutor.most_difficult_subject_to_teach} />
                                        <InfoRow label="Easier School Level" value={tutor.easier_school_level_to_teach} />
                                        <InfoRow label="Harder School Level" value={tutor.harder_school_level_to_teach} />
                                        <InfoRow label="Work Preference" value={formatEnum(tutor.work_preference)} />
                                        <InfoRow label="Class Size Preference" value={formatEnum(tutor.class_size_preference)} />
                                        <InfoRow label="Reasons for Loving Teaching" value={safeArray(tutor.reasons_love_teaching).length > 0 ? safeArray(tutor.reasons_love_teaching).join(', ') : undefined} fullWidth />
                                        <InfoRow label="Teaching Values" value={safeArray(tutor.teaching_values).length > 0 ? safeArray(tutor.teaching_values).join(', ') : undefined} fullWidth />
                                        <InfoRow label="Application Reasons" value={safeArray(tutor.application_reasons).length > 0 ? safeArray(tutor.application_reasons).join(', ') : undefined} fullWidth />
                                        <InfoRow label="Outside Activities" value={safeArray(tutor.outside_activities).length > 0 ? safeArray(tutor.outside_activities).join(', ') : undefined} fullWidth />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Logistics */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Logistics" icon={MapPin} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="Distance from Hub" value={tutor.distance_from_hub_minutes ? `${tutor.distance_from_hub_minutes} min` : undefined} />
                                        <InfoRow label="Distance from Work" value={tutor.distance_from_work_minutes ? `${tutor.distance_from_work_minutes} min` : undefined} />
                                        <InfoRow label="Transportation Mode" value={formatEnum(tutor.transportation_mode)} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ratings */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Self-Ratings" icon={Star} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <InfoRow label="Enjoy Playing with Kids" value={<RatingDots rating={tutor.enjoy_playing_with_kids_rating} />} />
                                        <InfoRow label="Need Job" value={<RatingDots rating={tutor.need_job_rating} />} />
                                        <InfoRow label="Public Speaking" value={<RatingDots rating={tutor.public_speaking_rating} />} />
                                        <InfoRow label="Penmanship" value={<RatingDots rating={tutor.penmanship_rating} />} />
                                        <InfoRow label="Creativity" value={<RatingDots rating={tutor.creativity_rating} />} />
                                        <InfoRow label="English Proficiency" value={<RatingDots rating={tutor.english_proficiency_rating} />} />
                                        <InfoRow label="Cleanliness Importance" value={<RatingDots rating={tutor.cleanliness_importance_rating} />} />
                                        <InfoRow label="Organization Importance" value={<RatingDots rating={tutor.organization_importance_rating} />} />
                                        <InfoRow label="Shared Environment Comfort" value={<RatingDots rating={tutor.shared_environment_comfort_rating} />} />
                                        <InfoRow label="Preferred Toys/Games" value={safeArray(tutor.preferred_toys_games).length > 0 ? safeArray(tutor.preferred_toys_games).join(', ') : undefined} />
                                        <InfoRow label="Annoyances" value={safeArray(tutor.annoyances).length > 0 ? safeArray(tutor.annoyances).join(', ') : undefined} />
                                        <InfoRow label="Preferred Teaching Language" value={tutor.preferred_teaching_language} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Technology & Teaching Methods */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Technology & Teaching Methods" icon={BrainCircuit} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="EdTech Opinion" value={tutor.edtech_opinion} />
                                        <InfoRow label="Needs Phone While Teaching" value={tutor.needs_phone_while_teaching ? '✓ Yes' : '✗ No'} />
                                        <InfoRow label="Phone Usage Reason" value={tutor.phone_usage_reason} />
                                        <InfoRow label="Teaching Difficulty Approach" value={formatEnum(tutor.teaching_difficulty_approach)} />
                                        <InfoRow label="Discipline Approach" value={formatEnum(tutor.discipline_approach)} />
                                        <InfoRow label="Approves Late Fine & Reward" value={tutor.approves_late_fine_reward ? '✓ Yes' : '✗ No'} />
                                        <InfoRow label="Late Fine Reason" value={tutor.late_fine_reason} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Commitment */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Commitment" icon={Calendar} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="Expected Tenure" value={formatEnum(tutor.expected_tenure)} />
                                        <InfoRow label="Work Frequency" value={formatEnum(tutor.preferred_workdays_frequency)} />
                                        <InfoRow label="Preferred Schedule" value={formatEnum(tutor.preferred_schedule)} />
                                        <InfoRow label="Preferred Workdays" value={safeArray(tutor.preferred_workdays).length > 0 ? safeArray(tutor.preferred_workdays).join(', ') : undefined} fullWidth />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Work Environment Preferences */}
                            <Card className="border-amber-200 shadow-md">
                                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                    <SectionHeader title="Work Environment Preferences" icon={Users} />
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow label="Teaching Style Preference" value={formatEnum(tutor.teaching_style_preference)} />
                                        <InfoRow label="OK with Team Meetings" value={tutor.ok_with_team_meetings ? '✓ Yes' : '✗ No'} />
                                        <InfoRow label="OK with Parent Meetings" value={tutor.ok_with_parent_meetings ? '✓ Yes' : '✗ No'} />
                                        <InfoRow label="Recording Comfort" value={formatEnum(tutor.recording_comfort)} />
                                        <InfoRow label="OK with Media Usage" value={tutor.ok_with_media_usage ? '✓ Yes' : '✗ No'} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
