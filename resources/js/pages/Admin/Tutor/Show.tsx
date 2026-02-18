import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, BookOpen, Mail, Phone, Globe, FileText, User, Link2 } from 'lucide-react';

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
    portfolio_link: string | null; // Added portfolio_link
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tutor: ${tutor.user?.name || 'Details'}`} />

            <div className="p-6">
                <div className="mb-6">
                    <Link href="/admin/tutors">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Tutors
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Profile Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="text-center">
                            <div className="mb-4 flex justify-center">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={tutor.photo || undefined} alt={tutor.user?.name} />
                                    <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-3xl text-white">
                                        {tutor.user?.name?.charAt(0).toUpperCase() || 'T'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-xl">{tutor.user?.name}</CardTitle>
                            <div className="mt-2">
                                <Badge className={tutor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                    {tutor.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <User className="h-4 w-4 text-amber-500" />
                                <span className="text-gray-600">Tutor ID:</span>
                                <span className="font-mono font-medium">{tutor.tutor_id}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-blue-500" />
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{tutor.user?.email}</span>
                            </div>
                            {tutor.number && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-green-500" />
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="font-medium">{tutor.number}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Details Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Tutor Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Subject</label>
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                                        <BookOpen className="h-4 w-4 text-amber-500" />
                                        <span className="font-medium">{tutor.subject || 'Not specified'}</span>
                                    </div>
                                </div>

                                {tutor.specializations && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Specializations</label>
                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <span>{tutor.specializations}</span>
                                        </div>
                                    </div>
                                )}

                                {tutor.rate_per_hour && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Rate per Hour</label>
                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <span className="font-medium">₱{tutor.rate_per_hour}</span>
                                        </div>
                                    </div>
                                )}

                                {tutor.mop && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Mode of Payment</label>
                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <span>{tutor.mop}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Portfolio Link Section - NEW */}
                            {tutor.portfolio_link && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Portfolio Link</label>
                                    <a
                                        href={tutor.portfolio_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-2 rounded-lg bg-blue-50 p-3 transition-colors hover:bg-blue-100"
                                    >
                                        <Link2 className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
                                        <span className="truncate text-blue-600 group-hover:text-blue-700 group-hover:underline">
                                            {tutor.portfolio_link}
                                        </span>
                                        <Globe className="ml-auto h-3 w-3 text-blue-400" />
                                    </a>
                                </div>
                            )}

                            {tutor.bio && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Bio</label>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="whitespace-pre-wrap">{tutor.bio}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
