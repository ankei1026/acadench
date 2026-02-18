import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    ArrowLeft,
    GraduationCap,
    User,
    Calendar,
    BookOpen,
    MapPin,
    School,
    Users,
    Sparkles,
    Heart,
    Cake,
    Award,
    Upload,
    X,
    Phone,
    AlertCircle,
    Home,
    HeartPulse,
    Church,
    Star,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Learners',
        href: '/parent/learners',
    },
    {
        title: 'Create Learner',
        href: '/parent/learners/create',
    },
];

// School levels from the model
const SCHOOL_LEVELS = [
    { value: 'pre-school', label: 'Pre-School' },
    { value: 'pre-kindergarten', label: 'Pre-Kindergarten' },
    { value: 'kindergarten', label: 'Kindergarten' },
    { value: 'elementary', label: 'Elementary' },
];

// Gender options from the model
const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

export default function CreateLearner() {
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        nickname: '',
        date_of_birth: '',
        gender: '',
        photo: null as File | null,
        allergies: '',
        medical_condition: '',
        religion: '',
        school_level: '',
        is_special_child: false,
        school_name: '',
        father_name: '',
        mother_name: '',
        guardian_name: '',
        emergency_contact_primary: '',
        emergency_contact_secondary: '',
        special_request: '',
    });

    // Check if school name should be shown (Kindergarten or Elementary)
    const showSchoolName = ['kindergarten', 'elementary'].includes(data.school_level);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Submit the form to the learners store route.
        // Use `forceFormData: true` so files are sent correctly; do NOT pass a FormData
        // instance as the first argument to `post()` (that becomes the URL and breaks `new URL()`).
        post('/parent/learners', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Learner created successfully!', {
                    description: `${data.name} has been added to your learners.`,
                    duration: 5000,
                });

                // Reset form after successful submission
                reset();
                setPhotoPreview(null);
                setPhotoError(null);
            },
            onError: (errors) => {
                toast.error('Failed to create learner', {
                    description: 'Please check the form for errors.',
                    duration: 5000,
                });
                console.log(errors);
            },
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPhotoError(null);

        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setPhotoError('File size must be less than 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setPhotoError('File must be an image');
                return;
            }

            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setData('photo', null);
        setPhotoPreview(null);
        setPhotoError(null);
        // Reset the file input
        const fileInput = document.getElementById('photo') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Learner" />
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
                                    Create New Learner
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Add a new learner to your account</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                                <Sparkles className="mr-2 h-4 w-4" />
                                New Learner
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/parent/learners')}
                        className="flex items-center gap-2 hover:bg-amber-100/50 hover:text-amber-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Learners
                    </Button>
                </div>

                {/* Main Form Container */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
                            {/* Form Section - Left Column (2/3) */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Basic Information */}
                                <Card className="overflow-hidden border border-gray-200 shadow-sm">
                                    <CardHeader className="border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-gray-900">Basic Information</CardTitle>
                                                <CardDescription className="text-gray-600">Enter the learner's personal details</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
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
                                                    placeholder="e.g., Juan Dela Cruz"
                                                    className={`border-gray-200 pl-10 transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                        errors.name ? 'border-red-500' : ''
                                                    }`}
                                                    required
                                                />
                                            </div>
                                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                        </div>

                                        {/* Nickname */}
                                        <div className="space-y-3">
                                            <Label htmlFor="nickname" className="text-sm font-semibold text-gray-700">
                                                Nickname
                                            </Label>
                                            <div className="relative">
                                                <Star className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                                <Input
                                                    id="nickname"
                                                    value={data.nickname}
                                                    onChange={(e) => setData('nickname', e.target.value)}
                                                    placeholder="e.g., Juanito"
                                                    className="border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Date of Birth & Gender */}
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-3">
                                                <Label htmlFor="date_of_birth" className="text-sm font-semibold text-gray-700">
                                                    Date of Birth <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Cake className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                                    <Input
                                                        id="date_of_birth"
                                                        type="date"
                                                        value={data.date_of_birth}
                                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                                        className={`border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                            errors.date_of_birth ? 'border-red-500' : ''
                                                        }`}
                                                        required
                                                    />
                                                </div>
                                                {errors.date_of_birth && <p className="text-sm text-red-600">{errors.date_of_birth}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                                                    Gender <span className="text-red-500">*</span>
                                                </Label>
                                                <Select value={data.gender} onValueChange={(value) => setData('gender', value)} required>
                                                    <SelectTrigger
                                                        className={`border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                            errors.gender ? 'border-red-500' : ''
                                                        }`}
                                                    >
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-amber-200">
                                                        {GENDER_OPTIONS.map((option) => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                                className="capitalize focus:bg-amber-50 focus:text-amber-900"
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
                                            </div>
                                        </div>

                                        {/* Religion & School Level */}
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-3">
                                                <Label htmlFor="religion" className="text-sm font-semibold text-gray-700">
                                                    Religion
                                                </Label>
                                                <div className="relative">
                                                    <Church className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                                    <Input
                                                        id="religion"
                                                        value={data.religion}
                                                        onChange={(e) => setData('religion', e.target.value)}
                                                        placeholder="e.g., Roman Catholic"
                                                        className="border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="school_level" className="text-sm font-semibold text-gray-700">
                                                    School Level <span className="text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={data.school_level}
                                                    onValueChange={(value) => {
                                                        setData('school_level', value);
                                                        // Clear school name if not Kindergarten or Elementary
                                                        if (!['kindergarten', 'elementary'].includes(value)) {
                                                            setData('school_name', '');
                                                        }
                                                    }}
                                                    required
                                                >
                                                    <SelectTrigger
                                                        className={`border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                            errors.school_level ? 'border-red-500' : ''
                                                        }`}
                                                    >
                                                        <SelectValue placeholder="Select school level" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-amber-200">
                                                        {SCHOOL_LEVELS.map((level) => (
                                                            <SelectItem
                                                                key={level.value}
                                                                value={level.value}
                                                                className="focus:bg-amber-50 focus:text-amber-900"
                                                            >
                                                                {level.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.school_level && <p className="text-sm text-red-600">{errors.school_level}</p>}
                                            </div>
                                        </div>

                                        {/* School Name - Conditional (Kindergarten & Elementary only) */}
                                        {showSchoolName && (
                                            <div className="animate-in space-y-3 duration-300 fade-in slide-in-from-top-2">
                                                <Label htmlFor="school_name" className="text-sm font-semibold text-gray-700">
                                                    School Name
                                                    {data.school_level === 'elementary' && <span className="ml-1 text-red-500">*</span>}
                                                    {data.school_level === 'kindergarten' && (
                                                        <span className="ml-2 text-xs text-gray-500">(Recommended)</span>
                                                    )}
                                                </Label>
                                                <div className="relative">
                                                    <School className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                                    <Input
                                                        id="school_name"
                                                        value={data.school_name}
                                                        onChange={(e) => setData('school_name', e.target.value)}
                                                        placeholder={
                                                            data.school_level === 'elementary'
                                                                ? 'e.g., Soraya Elementary School (required)'
                                                                : 'e.g., Sunshine Kindergarten'
                                                        }
                                                        className={`border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                            errors.school_name ? 'border-red-500' : ''
                                                        }`}
                                                        required={data.school_level === 'elementary'}
                                                    />
                                                </div>
                                                {data.school_level === 'kindergarten' && (
                                                    <p className="text-xs text-gray-500">
                                                        Adding a school name helps us better understand the learner's curriculum.
                                                    </p>
                                                )}
                                                {errors.school_name && <p className="text-sm text-red-600">{errors.school_name}</p>}
                                            </div>
                                        )}

                                        {/* Hint for Pre-School and Pre-Kindergarten */}
                                        {!showSchoolName && data.school_level && (
                                            <div className="animate-in rounded-lg border border-amber-200 bg-amber-50 p-3 duration-300 fade-in">
                                                <div className="flex items-start gap-2">
                                                    <School className="mt-0.5 h-4 w-4 text-amber-600" />
                                                    <div>
                                                        <p className="text-xs font-medium text-amber-800">
                                                            {data.school_level === 'pre-school' ? 'Pre-School Selected' : 'Pre-Kindergarten Selected'}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-amber-700">
                                                            School name is not required for this level. You can add it later if needed.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Medical Information */}
                                <Card className="overflow-hidden border border-gray-200 shadow-sm">
                                    <CardHeader className="border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                                <HeartPulse className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-gray-900">Medical Information</CardTitle>
                                                <CardDescription className="text-gray-600">Health-related details and special needs</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        {/* Special Child Toggle */}
                                        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                                            <div className="flex items-start gap-3">
                                                <Award className="mt-0.5 h-5 w-5 text-amber-600" />
                                                <div>
                                                    <Label htmlFor="is_special_child" className="text-sm font-semibold text-gray-700">
                                                        Special Needs Child
                                                    </Label>
                                                    <p className="mt-1 text-xs text-gray-600">
                                                        Check if the learner requires special attention or has special needs
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                id="is_special_child"
                                                checked={data.is_special_child}
                                                onCheckedChange={(checked) => setData('is_special_child', checked)}
                                                className="data-[state=checked]:bg-amber-600"
                                            />
                                        </div>

                                        {/* Allergies */}
                                        <div className="space-y-3">
                                            <Label htmlFor="allergies" className="text-sm font-semibold text-gray-700">
                                                Allergies
                                            </Label>
                                            <div className="relative">
                                                <AlertCircle className="absolute top-3 left-3 h-4 w-4 text-amber-500" />
                                                <Textarea
                                                    id="allergies"
                                                    value={data.allergies}
                                                    onChange={(e) => setData('allergies', e.target.value)}
                                                    placeholder="List any food or environmental allergies (e.g., peanuts, dust, etc.)"
                                                    className="min-h-[100px] border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Medical Condition */}
                                        <div className="space-y-3">
                                            <Label htmlFor="medical_condition" className="text-sm font-semibold text-gray-700">
                                                Medical Condition
                                            </Label>
                                            <div className="relative">
                                                <Heart className="absolute top-3 left-3 h-4 w-4 text-amber-500" />
                                                <Textarea
                                                    id="medical_condition"
                                                    value={data.medical_condition}
                                                    onChange={(e) => setData('medical_condition', e.target.value)}
                                                    placeholder="Describe any medical conditions (asthma, diabetes, etc.)"
                                                    className="min-h-[100px] border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Parent/Guardian Information */}
                                <Card className="overflow-hidden border border-gray-200 shadow-sm">
                                    <CardHeader className="border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                                <Users className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-gray-900">Parent/Guardian Information</CardTitle>
                                                <CardDescription className="text-gray-600">Emergency contacts and guardian details</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        {/* Father's Name */}
                                        <div className="space-y-3">
                                            <Label htmlFor="father_name" className="text-sm font-semibold text-gray-700">
                                                Father's Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                                <Input
                                                    id="father_name"
                                                    value={data.father_name}
                                                    onChange={(e) => setData('father_name', e.target.value)}
                                                    placeholder="e.g., Juan Dela Cruz Sr."
                                                    className="border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Mother's Name */}
                                        <div className="space-y-3">
                                            <Label htmlFor="mother_name" className="text-sm font-semibold text-gray-700">
                                                Mother's Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                                <Input
                                                    id="mother_name"
                                                    value={data.mother_name}
                                                    onChange={(e) => setData('mother_name', e.target.value)}
                                                    placeholder="e.g., Maria Dela Cruz"
                                                    className="border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Guardian Name */}
                                        <div className="space-y-3">
                                            <Label htmlFor="guardian_name" className="text-sm font-semibold text-gray-700">
                                                Guardian Name
                                            </Label>
                                            <div className="relative">
                                                <Users className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                                <Input
                                                    id="guardian_name"
                                                    value={data.guardian_name}
                                                    onChange={(e) => setData('guardian_name', e.target.value)}
                                                    placeholder="e.g., Pedro Santos (if different from parents)"
                                                    className="border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Emergency Contact Primary */}
                                        <div className="space-y-3">
                                            <Label htmlFor="emergency_contact_primary" className="text-sm font-semibold text-gray-700">
                                                Emergency Contact (Primary) <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                                <Input
                                                    id="emergency_contact_primary"
                                                    value={data.emergency_contact_primary}
                                                    onChange={(e) => setData('emergency_contact_primary', e.target.value)}
                                                    placeholder="e.g., 09171234567"
                                                    className={`border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                                        errors.emergency_contact_primary ? 'border-red-500' : ''
                                                    }`}
                                                    required
                                                />
                                            </div>
                                            {errors.emergency_contact_primary && (
                                                <p className="text-sm text-red-600">{errors.emergency_contact_primary}</p>
                                            )}
                                        </div>

                                        {/* Emergency Contact Secondary */}
                                        <div className="space-y-3">
                                            <Label htmlFor="emergency_contact_secondary" className="text-sm font-semibold text-gray-700">
                                                Emergency Contact (Secondary)
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                                <Input
                                                    id="emergency_contact_secondary"
                                                    value={data.emergency_contact_secondary}
                                                    onChange={(e) => setData('emergency_contact_secondary', e.target.value)}
                                                    placeholder="e.g., 09179876543"
                                                    className="border-gray-200 pl-10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Special Request */}
                                <Card className="overflow-hidden border border-gray-200 shadow-sm">
                                    <CardHeader className="border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                                <Heart className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-gray-900">Special Request</CardTitle>
                                                <CardDescription className="text-gray-600">
                                                    Any additional information or special requests
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <Textarea
                                                id="special_request"
                                                value={data.special_request}
                                                onChange={(e) => setData('special_request', e.target.value)}
                                                placeholder="Please share any specific requirements, preferences, or additional information about the learner..."
                                                rows={5}
                                                className="resize-none border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                            />
                                            <p className="text-xs text-gray-500">
                                                This can include dietary restrictions, learning preferences, or any other special requests.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Photo Preview and Summary */}
                            <div className="space-y-6 lg:col-span-1">
                                {/* Photo Upload */}
                                <Card className="sticky top-6 overflow-hidden border border-gray-200 shadow-sm">
                                    <CardHeader className="border-b border-gray-100">
                                        <CardTitle className="text-gray-900">Learner Photo</CardTitle>
                                        <CardDescription className="text-gray-600">Upload a photo of the learner</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            {photoPreview ? (
                                                <div className="relative">
                                                    <div className="relative h-48 w-full overflow-hidden rounded-lg border-2 border-amber-200">
                                                        <img src={photoPreview} alt="Learner preview" className="h-full w-full object-cover" />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={removePhoto}
                                                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full border-red-200 bg-red-50 p-0 text-red-600 hover:bg-red-100"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 p-6">
                                                    <Upload className="mb-2 h-8 w-8 text-amber-500" />
                                                    <p className="text-sm font-medium text-gray-900">Click to upload photo</p>
                                                    <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                                    <Input
                                                        id="photo"
                                                        name="photo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoChange}
                                                        className="absolute inset-0 cursor-pointer opacity-0 h-full"
                                                    />
                                                </div>
                                            )}
                                            {photoError && <p className="text-center text-sm text-red-600">{photoError}</p>}
                                            <p className="text-center text-xs text-gray-500">Recommended: Square image, at least 300x300px</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Summary Card */}
                                <Card className="overflow-hidden border border-gray-200 bg-gradient-to-br from-amber-50/30 to-orange-50/30 shadow-sm">
                                    <CardHeader className="border-b border-gray-100">
                                        <CardTitle className="text-gray-900">Learner Summary</CardTitle>
                                        <CardDescription className="text-gray-600">Preview of learner information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {data.name ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-md">
                                                        <span className="text-lg font-bold text-white">{data.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{data.name}</p>
                                                        {data.nickname && <p className="text-sm text-gray-600">"{data.nickname}"</p>}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 pt-2">
                                                    {data.date_of_birth && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Cake className="h-4 w-4 text-amber-500" />
                                                            <span className="text-gray-700">
                                                                {new Date(data.date_of_birth).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {data.gender && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-4 w-4 text-amber-500" />
                                                            <span className="text-gray-700 capitalize">{data.gender}</span>
                                                        </div>
                                                    )}
                                                    {data.school_level && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <BookOpen className="h-4 w-4 text-amber-500" />
                                                            <span className="text-gray-700">
                                                                {SCHOOL_LEVELS.find((l) => l.value === data.school_level)?.label || data.school_level}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {showSchoolName && data.school_name && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <School className="h-4 w-4 text-amber-500" />
                                                            <span className="text-gray-700">{data.school_name}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {data.is_special_child && (
                                                    <Badge className="border-amber-200 bg-amber-100 text-amber-800">
                                                        <Award className="mr-1 h-3 w-3" />
                                                        Special Needs
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-100 to-orange-100">
                                                    <GraduationCap className="h-8 w-8 text-amber-500" />
                                                </div>
                                                <p className="mt-4 font-medium text-gray-600">No learner information yet</p>
                                                <p className="mt-1 text-sm text-gray-500">Fill in the form to see a preview</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Form Actions - Inside Container */}
                        <div className="flex justify-end gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50/50 px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/parent/learners')}
                                disabled={processing}
                                className="border-gray-200 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="min-w-[150px] bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transition-all duration-200 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <span className="mr-2">Creating...</span>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    </>
                                ) : (
                                    <>
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        Create Learner
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
