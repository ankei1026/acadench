import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, GraduationCap, User, Mail, Lock, BookOpen, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutors',
        href: '/admin/tutors',
    },
    {
        title: 'Create Tutor',
        href: '/admin/tutors/create',
    },
];

export default function TutorCreate() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        subject: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/tutors', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tutor created successfully!', {
                    description: `${data.name} has been added as a tutor.`,
                    duration: 5000,
                });

                // Reset form after successful submission
                setData({
                    name: '',
                    email: '',
                    password: '',
                    subject: '',
                });
            },
            onError: (errors) => {
                toast.error('Failed to create tutor', {
                    description: 'Please check the form for errors.',
                    duration: 5000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Tutor" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Create New Tutor
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Add a new tutor to your learning center</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                                <Sparkles className="mr-2 h-4 w-4" />
                                New Tutor
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/admin/tutors')}
                        className="flex items-center gap-2 hover:bg-amber-100/50 hover:text-amber-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tutors
                    </Button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Form Section */}
                    <div className="lg:col-span-3">
                        <Card className="overflow-hidden border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-gray-900">Tutor Information</CardTitle>
                                        <CardDescription className="text-gray-600">Fill in the tutor's basic information</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Full Name */}
                                    <div className="space-y-3">
                                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                            Full Name <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., John Doe"
                                                className={`border-gray-200 pl-10 transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                    errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    {/* Email Address */}
                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                            Email Address <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="tutor@example.com"
                                                className={`border-gray-200 pl-10 transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                    errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                                            Subject <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <BookOpen className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                            <Input
                                                id="subject"
                                                value={data.subject}
                                                onChange={(e) => setData('subject', e.target.value)}
                                                placeholder="e.g., Mathematics"
                                                className={`border-gray-200 pl-10 transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                    errors.subject ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                                }`}
                                                required
                                            />
                                        </div>
                                        {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-3">
                                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                            Password <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter password (min 8 characters)"
                                                className={`border-gray-200 pl-10 pr-10 transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                                }`}
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit('/admin/tutors')}
                                            disabled={processing}
                                            className="border-gray-200 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transition-all duration-200 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="mr-2">Creating...</span>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                </>
                                            ) : (
                                                <>
                                                    <GraduationCap className="mr-2 h-4 w-4" />
                                                    Create Tutor
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
