import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, DollarSign, BookOpen, ExternalLink, Star, Briefcase, Award, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TutorApplication {
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
}

interface TutorProfile {
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
    application?: TutorApplication | null;
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

    const RatingDots = ({ rating }: { rating: number }) => (
        <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={`h-3 w-3 rounded-full transition-all duration-200 ${
                        i < rating ? 'bg-gradient-to-r from-amber-400 to-orange-400 scale-110' : 'bg-gray-200'
                    }`}
                />
            ))}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tutor.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Back Button */}
                <Link href="/parent/tutors">
                    <Button variant="outline" size="sm" className="w-fit">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tutors
                    </Button>
                </Link>

                {/* Hero Profile Card */}
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                            <Avatar className="h-24 w-24 md:h-32 md:w-32">
                                <AvatarImage src={tutor.photo || undefined} alt={tutor.name} />
                                <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-2xl text-white">
                                    {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-3xl font-bold text-gray-900">{tutor.name || 'Unknown Tutor'}</CardTitle>
                                {tutor.subject && <p className="mt-1 text-lg font-semibold text-orange-600">{tutor.subject}</p>}
                                {tutor.rate_per_hour && (
                                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 w-fit">
                                        <DollarSign className="h-5 w-5 text-amber-600" />
                                        <span className="font-bold text-amber-900">${tutor.rate_per_hour.toFixed(2)}/hour</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* About */}
                        {tutor.bio && (
                            <Card className="border-amber-200">
                                <CardHeader>
                                    <CardTitle className="text-xl">About</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{tutor.bio}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Specializations */}
                        {tutor.specializations && tutor.specializations.length > 0 && (
                            <Card className="border-amber-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-amber-600" />
                                        Specializations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {tutor.specializations.map((spec, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700"
                                            >
                                                ✓ {spec}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Teaching Experience - From Application */}
                        {tutor.application && (
                            <>
                                <Card className="border-amber-200">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-amber-600" />
                                            Teaching Experience
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Experience Duration</p>
                                            <p className="font-semibold text-gray-900 capitalize">{tutor.application.experience_duration}</p>
                                        </div>
                                        {tutor.application.employment_status && (
                                            <div>
                                                <p className="text-sm text-gray-600">Current Status</p>
                                                <p className="font-semibold text-gray-900 capitalize">{tutor.application.employment_status}</p>
                                            </div>
                                        )}
                                        {tutor.application.experience_levels && tutor.application.experience_levels.length > 0 && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">Experience Levels</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {tutor.application.experience_levels.map((level, idx) => (
                                                        <span key={idx} className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                                            {level}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="pt-2">
                                            <p className="text-sm text-gray-600">Qualifications</p>
                                            <ul className="mt-2 space-y-1">
                                                {tutor.application.is_licensed_teacher && (
                                                    <li className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Award className="h-4 w-4 text-green-600" />
                                                        Licensed Teacher
                                                    </li>
                                                )}
                                                {tutor.application.has_school_experience && (
                                                    <li className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Award className="h-4 w-4 text-green-600" />
                                                        School Teaching Experience
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Ratings */}
                                <Card className="border-amber-200">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5 text-amber-600" />
                                            Skills & Interests
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {tutor.application.public_speaking_rating > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">Public Speaking</p>
                                                <RatingDots rating={tutor.application.public_speaking_rating} />
                                            </div>
                                        )}
                                        {tutor.application.creativity_rating > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">Creativity</p>
                                                <RatingDots rating={tutor.application.creativity_rating} />
                                            </div>
                                        )}
                                        {tutor.application.english_proficiency_rating > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">English Proficiency</p>
                                                <RatingDots rating={tutor.application.english_proficiency_rating} />
                                            </div>
                                        )}
                                        {tutor.application.enjoy_kids_rating > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">Enjoys Working with Kids</p>
                                                <RatingDots rating={tutor.application.enjoy_kids_rating} />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Preferences */}
                                {(tutor.application.work_preference || tutor.application.class_size_preference) && (
                                    <Card className="border-amber-200">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Heart className="h-5 w-5 text-amber-600" />
                                                Teaching Preferences
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {tutor.application.work_preference && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Preferred Work Setting</p>
                                                    <p className="font-semibold text-gray-900 capitalize">{tutor.application.work_preference}</p>
                                                </div>
                                            )}
                                            {tutor.application.class_size_preference && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Preferred Class Size</p>
                                                    <p className="font-semibold text-gray-900 capitalize">{tutor.application.class_size_preference}</p>
                                                </div>
                                            )}
                                            {tutor.application.favorite_subject && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Favorite Subject to Teach</p>
                                                    <p className="font-semibold text-gray-900">{tutor.application.favorite_subject}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <Card className="border-amber-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {tutor.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 flex-shrink-0 text-amber-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">Email</p>
                                            <a
                                                href={`mailto:${tutor.email}`}
                                                className="text-sm font-medium break-all text-amber-600 hover:underline"
                                            >
                                                {tutor.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {tutor.number && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 flex-shrink-0 text-amber-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">Phone</p>
                                            <a href={`tel:${tutor.number}`} className="text-sm font-medium text-amber-600 hover:underline">
                                                {tutor.number}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Portfolio */}
                        {tutor.portfolio_link && (
                            <Card className="border-amber-200">
                                <CardHeader>
                                    <CardTitle className="text-lg">Portfolio</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={tutor.portfolio_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-white transition-all hover:from-amber-600 hover:to-orange-600"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        View Portfolio
                                    </a>
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
