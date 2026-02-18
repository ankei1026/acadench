import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { User, Mail, Phone, BookOpen, Globe, FileText, Save, Camera, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState, useRef } from 'react';

interface Tutor {
    tutor_id: string;
    user_id: string;
    name: string;
    email: string;
    specializations: string | null;
    subject: string | null;
    photo: string | null;
    portfolio_link: string | null;
    bio: string | null;
    status: string | null;
    number: string | null;
}

interface TutorProfilePageProps {
    tutor: Tutor | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutor',
        href: '/tutor/dashboard',
    },
    {
        title: 'Profile',
        href: '/tutor/profile',
    },
];

export default function TutorProfile({ tutor }: TutorProfilePageProps) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(tutor?.photo || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors } = useForm({
        specializations: tutor?.specializations || '',
        subject: tutor?.subject || '',
        portfolio_link: tutor?.portfolio_link || '',
        bio: tutor?.bio || '',
        number: tutor?.number || '',
        photo: null as File | null,
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PUT'); // Add this line
        formData.append('specializations', data.specializations);
        formData.append('subject', data.subject);
        formData.append('portfolio_link', data.portfolio_link);
        formData.append('bio', data.bio);
        formData.append('number', data.number);

        if (data.photo) {
            formData.append('photo', data.photo);
        }

        // Use POST with _method override
        router.post('/tutor/profile', formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Profile updated successfully');
            },
            onError: (errors) => {
                console.error('Errors:', errors);
                toast.error('Failed to update profile');
            },
        });
    };

    if (!tutor) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="My Profile" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/50 p-12">
                        <div className="rounded-full bg-amber-100 p-4">
                            <User className="h-8 w-8 text-amber-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Profile Found</h3>
                        <p className="mt-2 text-center text-gray-600">
                            Your tutor profile has not been created yet. Please contact the administrator.
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    My Profile
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">View and edit your tutor profile</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Profile Card */}
                    <Card className="border-amber-200 lg:col-span-1">
                        <CardHeader className="text-center">
                            <div className="mb-4 flex justify-center">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={tutor.photo || undefined} alt={tutor.name} />
                                    <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-3xl text-white">
                                        {tutor.name?.charAt(0).toUpperCase() || 'T'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-xl">{tutor.name}</CardTitle>
                            <CardDescription>{tutor.email}</CardDescription>
                            <div className="mt-2">
                                <Badge
                                    className={
                                        tutor.status === 'active'
                                            ? 'border-green-200 bg-green-100 text-green-700'
                                            : 'border-gray-200 bg-gray-100 text-gray-700'
                                    }
                                >
                                    {tutor.status || 'N/A'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <User className="h-4 w-4 text-amber-500" />
                                <span className="text-gray-600">Tutor ID:</span>
                                <span className="font-mono font-medium">{tutor.tutor_id}</span>
                            </div>
                            {tutor.subject && (
                                <div className="flex items-center gap-3 text-sm">
                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                    <span className="text-gray-600">Subject:</span>
                                    <span className="font-medium">{tutor.subject}</span>
                                </div>
                            )}
                            {tutor.number && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-purple-500" />
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="font-medium">{tutor.number}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Form */}
                    <Card className="border-amber-200 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Edit Profile</CardTitle>
                            <CardDescription>Update your tutor profile information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Photo Upload */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={photoPreview || undefined} alt={tutor.name} />
                                            <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-2xl text-white">
                                                {tutor.name?.charAt(0).toUpperCase() || 'T'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute right-0 bottom-0 rounded-full bg-amber-500 p-2 text-white shadow-md hover:bg-amber-600"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="photo" className="text-sm font-medium text-gray-700">
                                            Profile Photo
                                        </Label>
                                        <p className="mb-2 text-xs text-gray-500">Upload a new photo (max 2MB, JPG/PNG)</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="photo"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-amber-200 text-amber-700 hover:bg-amber-50"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Choose Photo
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            placeholder="e.g., Mathematics, English"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specializations">Specializations</Label>
                                    <Input
                                        id="specializations"
                                        value={data.specializations}
                                        onChange={(e) => setData('specializations', e.target.value)}
                                        placeholder="e.g., Algebra, Calculus, Creative Writing"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="number">Phone Number</Label>
                                    <Input
                                        id="number"
                                        value={data.number}
                                        onChange={(e) => setData('number', e.target.value)}
                                        placeholder="e.g., +63 912 345 6789"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="portfolio_link">Portfolio Link</Label>
                                    <Input
                                        id="portfolio_link"
                                        value={data.portfolio_link}
                                        onChange={(e) => setData('portfolio_link', e.target.value)}
                                        placeholder="e.g., https://portfolio.example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        placeholder="Tell us about yourself and your teaching experience..."
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
