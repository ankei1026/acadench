import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft,
    Award,
    BookOpen,
    Cake,
    GraduationCap,
    Phone,
    School,
    User,
    HeartPulse,
    Church,
    Users,
} from 'lucide-react';

type Learner = {
    learner_id: string;
    name: string;
    nickname?: string | null;
    display_name: string;
    photo?: string | null;
    date_of_birth?: string | null;
    age?: number | null;
    gender?: string | null;
    allergies?: string | null;
    medical_condition?: string | null;
    religion?: string | null;
    school_level?: string | null;
    school_name?: string | null;
    is_special_child?: boolean | null;
    father_name?: string | null;
    mother_name?: string | null;
    guardian_name?: string | null;
    emergency_contact_primary?: string | null;
    emergency_contact_secondary?: string | null;
    special_request?: string | null;
    created_at?: string | null;
};

type ShowProps = {
    learner: Learner;
    schoolLevels: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Learners',
        href: '/parent/learners',
    },
    {
        title: 'Learner Details',
        href: '#',
    },
];

export default function LearnerShow({ learner, schoolLevels }: ShowProps) {
    const schoolLabel = learner.school_level ? schoolLevels[learner.school_level] ?? learner.school_level : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Learner - ${learner.display_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    {learner.display_name}
                                </h1>
                                <p className="text-gray-600">Learner ID: {learner.learner_id}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {learner.is_special_child && (
                                <Badge className="border-amber-200 bg-amber-100 text-amber-800">
                                    <Award className="mr-1 h-3 w-3" />
                                    Special Needs
                                </Badge>
                            )}
                            {schoolLabel && (
                                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                    {schoolLabel}
                                </Badge>
                            )}
                            {learner.school_name && (
                                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                    {learner.school_name}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <Button asChild variant="ghost" className="hover:bg-amber-100/50 hover:text-amber-700">
                        <Link href="/parent/learners">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Learners
                        </Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                        <Link href={`/parent/learner/${learner.learner_id}/edit`}>Edit Learner</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* Basic Information */}
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="text-gray-900">Basic Information</CardTitle>
                                <CardDescription className="text-gray-600">Personal details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase text-gray-500">Full Name</p>
                                        <p className="font-semibold text-gray-900">{learner.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase text-gray-500">Nickname</p>
                                        <p className="text-gray-900">{learner.nickname || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase text-gray-500">Date of Birth</p>
                                        <p className="text-gray-900">
                                            {learner.date_of_birth
                                                ? new Date(learner.date_of_birth).toLocaleDateString('en-US', {
                                                      year: 'numeric',
                                                      month: 'long',
                                                      day: 'numeric',
                                                  })
                                                : '—'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase text-gray-500">Age</p>
                                        <p className="text-gray-900">{learner.age ?? '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase text-gray-500">Gender</p>
                                        <p className="text-gray-900 capitalize">{learner.gender || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase text-gray-500">Religion</p>
                                        <p className="text-gray-900">{learner.religion || '—'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <BookOpen className="h-4 w-4 text-amber-500" />
                                        <span>{schoolLabel || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <School className="h-4 w-4 text-amber-500" />
                                        <span>{learner.school_name || '—'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Medical Information */}
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="text-gray-900">Medical Information</CardTitle>
                                <CardDescription className="text-gray-600">Health details and special needs</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <HeartPulse className="h-4 w-4 text-amber-500" />
                                        <span className="font-medium">Special Needs:</span>
                                        <span>{learner.is_special_child ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-gray-500">Allergies</p>
                                        <p className="text-gray-900">{learner.allergies || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-gray-500">Medical Conditions</p>
                                        <p className="text-gray-900">{learner.medical_condition || '—'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guardian Information */}
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="text-gray-900">Parent/Guardian Information</CardTitle>
                                <CardDescription className="text-gray-600">Emergency contacts and guardians</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase text-gray-500">Father's Name</p>
                                    <p className="text-gray-900">{learner.father_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500">Mother's Name</p>
                                    <p className="text-gray-900">{learner.mother_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500">Guardian Name</p>
                                    <p className="text-gray-900">{learner.guardian_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500">Primary Contact</p>
                                    <p className="text-gray-900">{learner.emergency_contact_primary || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-gray-500">Secondary Contact</p>
                                    <p className="text-gray-900">{learner.emergency_contact_secondary || '—'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Special Request */}
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="text-gray-900">Special Requests</CardTitle>
                                <CardDescription className="text-gray-600">Additional details</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-gray-900">{learner.special_request || '—'}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="text-gray-900">Learner Photo</CardTitle>
                                <CardDescription className="text-gray-600">Profile image</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-64 w-full overflow-hidden rounded-lg border border-amber-200 bg-amber-50">
                                    {learner.photo ? (
                                        <img src={learner.photo} alt={learner.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-amber-700">
                                            <GraduationCap className="h-8 w-8" />
                                            <span className="text-sm">No photo available</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="text-gray-900">Quick Info</CardTitle>
                                <CardDescription className="text-gray-600">Summary</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-6 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-amber-500" />
                                    <span>{learner.display_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Cake className="h-4 w-4 text-amber-500" />
                                    <span>{learner.date_of_birth || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Church className="h-4 w-4 text-amber-500" />
                                    <span>{learner.religion || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-amber-500" />
                                    <span>{learner.emergency_contact_primary || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-amber-500" />
                                    <span>{learner.guardian_name || learner.father_name || learner.mother_name || '—'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
