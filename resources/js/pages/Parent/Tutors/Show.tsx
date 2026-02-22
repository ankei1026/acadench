import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Mail, Phone, BookOpen, ExternalLink, Star, Briefcase,
    Award, User, GraduationCap, Users, Calendar, MapPin,
    Home, BrainCircuit, Globe, FileText, Link2, HeartHandshake,
    School, Clock, Sparkles, Users2, BookMarked, Lightbulb,
    Heart, Target, ThumbsUp, MessageSquare, Shield, PenTool,
    Monitor, Wifi, Coffee, Smile, Zap, Gamepad2, AlertCircle,
    DollarSign, CheckCircle, XCircle, Music, Palette, BookText,
    Languages, Baby, Dog, Cat, Sun, Moon, Sunrise, Sunset,
    Activity, Compass, Cpu, Smartphone, Tablet, Headphones,
    Video, Camera, Mic, Volume2, VolumeX, Disc, Film
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TutorProfile {
    // Basic Info
    tutor_id: string;
    name: string;
    email: string | null;
    subject: string | null;
    bio: string | null;
    photo: string | null;
    rate_per_hour: number | null;
    specializations: string[];
    portfolio_link: string | null;
    number: string | null;

    // Personal Information
    full_name: string | null;
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
    distance_from_hub_minutes: number | null;
    distance_from_work_minutes: number | null;
    transportation_mode: string | null;

    // Ratings
    enjoy_playing_with_kids_rating: number;
    preferred_toys_games: string[];
    annoyances: string[];
    need_job_rating: number;
    public_speaking_rating: number;
    penmanship_rating: number;
    creativity_rating: number;
    english_proficiency_rating: number;
    preferred_teaching_language: string | null;

    // Technology and Methods
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

    // Work Environment
    cleanliness_importance_rating: number;
    organization_importance_rating: number;
    shared_environment_comfort_rating: number;
    teaching_style_preference: string | null;
    ok_with_team_meetings: boolean;
    ok_with_parent_meetings: boolean;
    recording_comfort: string | null;
    ok_with_media_usage: boolean;

    // Application data (if available)
    application?: {
        full_name: string;
        age: string;
        gender: string;
        experience_levels: string[];
        experience_duration: string;
        employment_status: string;
        favorite_subject: string;
        work_preference: string;
        class_size_preference: string;
        is_licensed_teacher: boolean;
        has_school_experience: boolean;
        public_speaking_rating: number;
        creativity_rating: number;
        english_proficiency_rating: number;
        enjoy_kids_rating: number;
        high_school?: string;
        college_school?: string;
        college_course?: string;
        reasons_love_teaching?: string[];
        teaching_values?: string[];
        preferred_workdays?: string[];
        transportation_mode?: string;
        distance_from_hub_minutes?: number;
    };
}

interface TutorShowPageProps {
    tutor: TutorProfile;
}

export default function TutorShow({ tutor }: TutorShowPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tutors',
            href: '/parent/tutors',
        },
        {
            title: tutor.name,
            href: `/parent/tutors/${tutor.tutor_id}`,
        },
    ];

    const formatEnum = (value: string | null | undefined) => {
        if (!value) return '—';
        return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatBoolean = (value: boolean | null | undefined) => {
        if (value === null || value === undefined) return '—';
        return value ? '✓ Yes' : '✗ No';
    };

    const safeArray = <T,>(value: T[] | null | undefined): T[] => {
        return Array.isArray(value) ? value : [];
    };

    const RatingDots = ({ rating, label, color = 'amber' }: { rating: number; label?: string; color?: string }) => {
        const getColor = (index: number) => {
            if (index < rating) {
                return color === 'amber' ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-blue-400 to-blue-500';
            }
            return 'bg-gray-200';
        };

        return (
            <div className="space-y-1">
                {label && <p className="text-sm font-medium text-gray-600">{label}</p>}
                <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-3 w-3 rounded-full ${getColor(i)} transition-all duration-200 ${i < rating ? 'scale-110' : ''}`}
                            title={`${rating}/5`}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const InfoRow = ({ label, value, fullWidth = false, icon: Icon }: { label: string; value: React.ReactNode; fullWidth?: boolean; icon?: any }) => (
        <div className={fullWidth ? 'md:col-span-2' : ''}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
            </p>
            <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 font-medium text-gray-900 break-words">
                {value || '—'}
            </div>
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

    const TagList = ({ items, icon: Icon, color = 'amber' }: { items: string[]; icon?: any; color?: string }) => {
        if (!items.length) return null;

        const colorClasses = {
            amber: 'bg-amber-50 text-amber-700 border-amber-200',
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            green: 'bg-green-50 text-green-700 border-green-200',
            purple: 'bg-purple-50 text-purple-700 border-purple-200',
            pink: 'bg-pink-50 text-pink-700 border-pink-200',
        };

        return (
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <Badge
                        key={index}
                        variant="outline"
                        className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.amber} px-3 py-1.5 text-sm`}
                    >
                        {/* {icon && <icon className="h-3 w-3 mr-1" />} */}
                        {item}
                    </Badge>
                ))}
            </div>
        );
    };

    // Combine tutor data with application data (application takes precedence if available)
    const displayData = {
        ...tutor,
        ...(tutor.application || {}),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tutor.name} />

            <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4 md:p-6">
                {/* Back Button */}
                <div className="mb-4">
                    <Link href="/parent/tutors">
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
                                <div className="px-6 text-center pt-6">
                                    <div className="flex justify-center mb-4">
                                        <div className="rounded-full border-4 border-white/50 shadow-xl overflow-hidden">
                                            <Avatar className="h-28 w-28">
                                                <AvatarImage src={tutor.photo || undefined} alt={tutor.name} />
                                                <AvatarFallback className="bg-gradient-to-r from-amber-600 to-orange-600 text-3xl text-black">
                                                    {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-black">{tutor.name}</h3>
                                    {tutor.subject && (
                                        <Badge className="mt-2 border-amber-200 bg-amber-100 text-amber-700">
                                            {tutor.subject}
                                        </Badge>
                                    )}
                                    {tutor.rate_per_hour && (
                                        <div className="mt-2 text-lg font-bold text-amber-600">
                                            ₱{Number(tutor.rate_per_hour).toFixed(2)}/hour
                                        </div>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <CardContent className="px-5 space-y-4 mt-4">
                                    <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
                                        <User className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold uppercase text-gray-500">Tutor ID</p>
                                            <p className="font-mono font-bold text-amber-700 break-all">{tutor.tutor_id}</p>
                                        </div>
                                    </div>

                                    {tutor.email && (
                                        <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                                            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold uppercase text-gray-500">Email</p>
                                                <a href={`mailto:${tutor.email}`} className="font-medium text-blue-700 hover:underline break-all">
                                                    {tutor.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {tutor.number && (
                                        <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
                                            <Phone className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold uppercase text-gray-500">Number</p>
                                                <a href={`tel:${tutor.number}`} className="font-medium text-green-700 hover:underline break-all">
                                                    {tutor.number}
                                                </a>
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

                                    {tutor.facebook_link && (
                                        <div className="flex items-start gap-3 rounded-lg bg-indigo-50 p-3">
                                            <Link2 className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold uppercase text-gray-500">Facebook</p>
                                                <a
                                                    href={tutor.facebook_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-indigo-700 hover:underline break-all text-sm"
                                                >
                                                    {tutor.facebook_link}
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
                            {/* About & Bio */}
                            {tutor.bio && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="About Me" icon={FileText} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{tutor.bio}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Personal Information */}
                            {(tutor.full_name || tutor.age || tutor.gender || tutor.home_address || tutor.living_status || tutor.birthdate) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Personal Information" icon={User} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tutor.full_name && <InfoRow label="Full Name" value={tutor.full_name} icon={User} />}
                                            {tutor.age && <InfoRow label="Age" value={tutor.age} icon={Calendar} />}
                                            {tutor.birthdate && <InfoRow label="Birthdate" value={tutor.birthdate} icon={Calendar} />}
                                            {tutor.gender && <InfoRow label="Gender" value={formatEnum(tutor.gender)} icon={Users} />}
                                            {tutor.living_status && <InfoRow label="Living Status" value={formatEnum(tutor.living_status)} icon={Home} />}
                                            {tutor.home_address && <InfoRow label="Home Address" value={tutor.home_address} icon={MapPin} fullWidth />}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Family Information */}
                            {(tutor.mother_name || tutor.father_name) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Family Information" icon={Heart} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tutor.mother_name && <InfoRow label="Mother's Name" value={tutor.mother_name} icon={Heart} />}
                                            {tutor.father_name && <InfoRow label="Father's Name" value={tutor.father_name} icon={Heart} />}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Specializations */}
                            {tutor.specializations && tutor.specializations.length > 0 && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Specializations" icon={BookMarked} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <TagList items={tutor.specializations} color="amber" />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Educational Background */}
                            {(tutor.high_school || tutor.college_school || tutor.college_course || tutor.is_licensed_teacher) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Educational Background" icon={GraduationCap} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tutor.high_school && <InfoRow label="High School" value={tutor.high_school} icon={School} />}
                                            {tutor.college_school && <InfoRow label="College/University" value={tutor.college_school} icon={GraduationCap} />}
                                            {tutor.college_course && <InfoRow label="College Course" value={tutor.college_course} icon={BookText} />}
                                            {tutor.license_date && <InfoRow label="License Date" value={tutor.license_date} icon={Award} />}
                                        </div>
                                        {tutor.is_licensed_teacher && (
                                            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3">
                                                <Award className="h-5 w-5 text-green-600" />
                                                <span className="font-medium text-green-700">Licensed Teacher</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Teaching Experience */}
                            {(tutor.tutoring_experience_duration || tutor.employment_status || tutor.tutoring_experience_levels?.length > 0 || tutor.has_school_teaching_experience) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Teaching Experience" icon={Briefcase} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tutor.tutoring_experience_duration && (
                                                <InfoRow label="Tutoring Experience" value={formatEnum(tutor.tutoring_experience_duration)} icon={Clock} />
                                            )}
                                            {tutor.employment_status && (
                                                <InfoRow label="Employment Status" value={formatEnum(tutor.employment_status)} icon={Briefcase} />
                                            )}
                                            {tutor.current_employer && (
                                                <InfoRow label="Current Employer" value={tutor.current_employer} icon={Users} />
                                            )}
                                            {tutor.working_hours && (
                                                <InfoRow label="Working Hours" value={tutor.working_hours} icon={Clock} />
                                            )}
                                            {tutor.school_teaching_experience_duration && (
                                                <InfoRow label="School Teaching Experience" value={tutor.school_teaching_experience_duration} icon={School} />
                                            )}
                                            {tutor.previous_clients && (
                                                <InfoRow label="Previous Clients" value={tutor.previous_clients} icon={Users2} fullWidth />
                                            )}
                                        </div>

                                        {tutor.tutoring_experience_levels && tutor.tutoring_experience_levels.length > 0 && (
                                            <div className="mt-4">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Experience Levels</p>
                                                <TagList items={tutor.tutoring_experience_levels} color="blue" />
                                            </div>
                                        )}

                                        {tutor.has_school_teaching_experience && (
                                            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3">
                                                <School className="h-5 w-5 text-green-600" />
                                                <span className="font-medium text-green-700">Has School Teaching Experience</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Teaching Preferences & Skills */}
                            {(tutor.favorite_subject_to_teach || tutor.easiest_subject_to_teach || tutor.most_difficult_subject_to_teach ||
                              tutor.easier_school_level_to_teach || tutor.harder_school_level_to_teach || tutor.work_preference ||
                              tutor.class_size_preference) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Teaching Preferences" icon={Target} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tutor.favorite_subject_to_teach && (
                                                <InfoRow label="Favorite Subject to Teach" value={tutor.favorite_subject_to_teach} icon={Star} />
                                            )}
                                            {tutor.easiest_subject_to_teach && (
                                                <InfoRow label="Easiest Subject to Teach" value={tutor.easiest_subject_to_teach} icon={Smile} />
                                            )}
                                            {tutor.most_difficult_subject_to_teach && (
                                                <InfoRow label="Most Difficult Subject" value={tutor.most_difficult_subject_to_teach} icon={Zap} />
                                            )}
                                            {tutor.easier_school_level_to_teach && (
                                                <InfoRow label="Easier School Level" value={formatEnum(tutor.easier_school_level_to_teach)} icon={Baby} />
                                            )}
                                            {tutor.harder_school_level_to_teach && (
                                                <InfoRow label="Harder School Level" value={formatEnum(tutor.harder_school_level_to_teach)} icon={Users} />
                                            )}
                                            {tutor.work_preference && (
                                                <InfoRow label="Work Preference" value={formatEnum(tutor.work_preference)} icon={Briefcase} />
                                            )}
                                            {tutor.class_size_preference && (
                                                <InfoRow label="Class Size Preference" value={formatEnum(tutor.class_size_preference)} icon={Users2} />
                                            )}
                                            {tutor.preferred_teaching_language && (
                                                <InfoRow label="Preferred Teaching Language" value={tutor.preferred_teaching_language} icon={Languages} />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Teaching Philosophy */}
                            {(tutor.reasons_love_teaching?.length > 0 || tutor.teaching_values?.length > 0 || tutor.application_reasons?.length > 0) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Teaching Philosophy" icon={Lightbulb} />
                                    </CardHeader>
                                    <CardContent className="pt-5 space-y-6">
                                        {tutor.reasons_love_teaching && tutor.reasons_love_teaching.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Reasons for Loving Teaching</p>
                                                <TagList items={tutor.reasons_love_teaching} icon={Heart} color="pink" />
                                            </div>
                                        )}
                                        {tutor.teaching_values && tutor.teaching_values.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Teaching Values</p>
                                                <TagList items={tutor.teaching_values} icon={Shield} color="purple" />
                                            </div>
                                        )}
                                        {tutor.application_reasons && tutor.application_reasons.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Reasons for Applying</p>
                                                <TagList items={tutor.application_reasons} icon={Target} color="blue" />
                                            </div>
                                        )}
                                        {tutor.outside_activities && tutor.outside_activities.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Outside Activities</p>
                                                <TagList items={tutor.outside_activities} icon={Activity} color="green" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Ratings */}
                            {(tutor.enjoy_playing_with_kids_rating > 0 || tutor.public_speaking_rating > 0 || tutor.creativity_rating > 0 ||
                              tutor.english_proficiency_rating > 0 || tutor.penmanship_rating > 0 || tutor.need_job_rating > 0) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Skills & Ratings" icon={Star} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {tutor.enjoy_playing_with_kids_rating > 0 && (
                                                <RatingDots rating={tutor.enjoy_playing_with_kids_rating} label="Enjoys Playing with Kids" />
                                            )}
                                            {tutor.public_speaking_rating > 0 && (
                                                <RatingDots rating={tutor.public_speaking_rating} label="Public Speaking" />
                                            )}
                                            {tutor.creativity_rating > 0 && (
                                                <RatingDots rating={tutor.creativity_rating} label="Creativity" />
                                            )}
                                            {tutor.english_proficiency_rating > 0 && (
                                                <RatingDots rating={tutor.english_proficiency_rating} label="English Proficiency" />
                                            )}
                                            {tutor.penmanship_rating > 0 && (
                                                <RatingDots rating={tutor.penmanship_rating} label="Penmanship" />
                                            )}
                                            {tutor.need_job_rating > 0 && (
                                                <RatingDots rating={tutor.need_job_rating} label="Need for Job" color="blue" />
                                            )}
                                            {tutor.cleanliness_importance_rating > 0 && (
                                                <RatingDots rating={tutor.cleanliness_importance_rating} label="Cleanliness Importance" />
                                            )}
                                            {tutor.organization_importance_rating > 0 && (
                                                <RatingDots rating={tutor.organization_importance_rating} label="Organization Importance" />
                                            )}
                                            {tutor.shared_environment_comfort_rating > 0 && (
                                                <RatingDots rating={tutor.shared_environment_comfort_rating} label="Shared Environment Comfort" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Preferences & Interests */}
                            {(tutor.preferred_toys_games?.length > 0 || tutor.annoyances?.length > 0) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Preferences & Interests" icon={HeartHandshake} />
                                    </CardHeader>
                                    <CardContent className="pt-5 space-y-6">
                                        {tutor.preferred_toys_games && tutor.preferred_toys_games.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Preferred Toys & Games</p>
                                                <TagList items={tutor.preferred_toys_games} icon={Gamepad2} color="green" />
                                            </div>
                                        )}
                                        {tutor.annoyances && tutor.annoyances.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Annoyances</p>
                                                <TagList items={tutor.annoyances} icon={AlertCircle} color="red" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Technology & Teaching Methods */}
                            {(tutor.edtech_opinion || tutor.needs_phone_while_teaching || tutor.teaching_difficulty_approach ||
                              tutor.discipline_approach || tutor.approves_late_fine_reward) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Teaching Methods & Technology" icon={Monitor} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tutor.edtech_opinion && (
                                                <InfoRow label="EdTech Opinion" value={tutor.edtech_opinion} icon={Cpu} fullWidth />
                                            )}
                                            {tutor.teaching_difficulty_approach && (
                                                <InfoRow label="Teaching Difficulty Approach" value={formatEnum(tutor.teaching_difficulty_approach)} icon={Compass} />
                                            )}
                                            {tutor.discipline_approach && (
                                                <InfoRow label="Discipline Approach" value={formatEnum(tutor.discipline_approach)} icon={Shield} />
                                            )}
                                            {tutor.recording_comfort && (
                                                <InfoRow label="Recording Comfort" value={formatEnum(tutor.recording_comfort)} icon={Video} />
                                            )}
                                            {tutor.phone_usage_reason && (
                                                <InfoRow label="Phone Usage Reason" value={tutor.phone_usage_reason} icon={Smartphone} fullWidth />
                                            )}
                                            {tutor.late_fine_reason && (
                                                <InfoRow label="Late Fine Reason" value={tutor.late_fine_reason} icon={AlertCircle} fullWidth />
                                            )}
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {tutor.needs_phone_while_teaching !== undefined && (
                                                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
                                                    {tutor.needs_phone_while_teaching ? (
                                                        <>
                                                            <Smartphone className="h-5 w-5 text-blue-600" />
                                                            <span className="font-medium text-blue-700">Needs phone while teaching</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Tablet className="h-5 w-5 text-gray-600" />
                                                            <span className="font-medium text-gray-700">Doesn't need phone while teaching</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {tutor.approves_late_fine_reward !== undefined && (
                                                <div className="flex items-center gap-2 rounded-lg bg-purple-50 p-3">
                                                    {tutor.approves_late_fine_reward ? (
                                                        <>
                                                            <ThumbsUp className="h-5 w-5 text-purple-600" />
                                                            <span className="font-medium text-purple-700">Approves late fine & reward system</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ThumbsUp className="h-5 w-5 text-gray-600" />
                                                            <span className="font-medium text-gray-700">Doesn't approve late fine & reward</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {tutor.ok_with_team_meetings !== undefined && (
                                                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                                                    {tutor.ok_with_team_meetings ? (
                                                        <>
                                                            <Users className="h-5 w-5 text-green-600" />
                                                            <span className="font-medium text-green-700">OK with team meetings</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Users className="h-5 w-5 text-gray-600" />
                                                            <span className="font-medium text-gray-700">Not OK with team meetings</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {tutor.ok_with_parent_meetings !== undefined && (
                                                <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3">
                                                    {tutor.ok_with_parent_meetings ? (
                                                        <>
                                                            <Users className="h-5 w-5 text-orange-600" />
                                                            <span className="font-medium text-orange-700">OK with parent meetings</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Users className="h-5 w-5 text-gray-600" />
                                                            <span className="font-medium text-gray-700">Not OK with parent meetings</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {tutor.ok_with_media_usage !== undefined && (
                                                <div className="flex items-center gap-2 rounded-lg bg-pink-50 p-3">
                                                    {tutor.ok_with_media_usage ? (
                                                        <>
                                                            <Camera className="h-5 w-5 text-pink-600" />
                                                            <span className="font-medium text-pink-700">OK with media usage</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Camera className="h-5 w-5 text-gray-600" />
                                                            <span className="font-medium text-gray-700">Not OK with media usage</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Availability & Logistics */}
                            {(tutor.preferred_workdays?.length > 0 || tutor.preferred_schedule || tutor.preferred_workdays_frequency ||
                              tutor.expected_tenure || tutor.distance_from_hub_minutes || tutor.transportation_mode) && (
                                <Card className="border-amber-200 shadow-md">
                                    <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 py-4">
                                        <SectionHeader title="Availability & Logistics" icon={Calendar} />
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tutor.preferred_schedule && (
                                                <InfoRow label="Preferred Schedule" value={formatEnum(tutor.preferred_schedule)} icon={Clock} />
                                            )}
                                            {tutor.preferred_workdays_frequency && (
                                                <InfoRow label="Work Frequency" value={formatEnum(tutor.preferred_workdays_frequency)} icon={Calendar} />
                                            )}
                                            {tutor.expected_tenure && (
                                                <InfoRow label="Expected Tenure" value={formatEnum(tutor.expected_tenure)} icon={Clock} />
                                            )}
                                            {tutor.transportation_mode && (
                                                <InfoRow label="Transportation Mode" value={formatEnum(tutor.transportation_mode)} icon={MapPin} />
                                            )}
                                            {tutor.distance_from_hub_minutes && (
                                                <InfoRow label="Distance from Hub" value={`${tutor.distance_from_hub_minutes} minutes`} icon={MapPin} />
                                            )}
                                            {tutor.distance_from_work_minutes && (
                                                <InfoRow label="Distance from Work" value={`${tutor.distance_from_work_minutes} minutes`} icon={MapPin} />
                                            )}
                                        </div>

                                        {tutor.preferred_workdays && tutor.preferred_workdays.length > 0 && (
                                            <div className="mt-4">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Preferred Work Days</p>
                                                <TagList items={tutor.preferred_workdays} icon={Sun} color="amber" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
