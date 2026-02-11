import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Clock, BookOpen, Plus, Users, TrendingUp, CalendarDays } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Programs',
        href: '/admin/programs',
    },
    {
        title: 'Create Program',
        href: '/admin/programs/create',
    },
];

// Days of the week for selection
const DAYS_OF_WEEK = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
];

// Program types
const PROGRAM_TYPES = [
    { value: 'pre-kinder', label: 'Pre-Kinder' },
    { value: 'after-school-academic-tutorial', label: 'After School Tutorial' },
    { value: 'special-tutorial', label: 'Special Tutorial' },
    { value: 'art-class', label: 'Art Class' },
    { value: 'reading-writing', label: 'Reading & Writing' },
    { value: 'weekend-academic-tutorial', label: 'Weekend Tutorial' },
];

// Get program type color
const getProgramTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        'pre-kinder': 'bg-amber-100 text-amber-800 border border-amber-200',
        'after-school-academic-tutorial': 'bg-blue-100 text-blue-800 border border-blue-200',
        'special-tutorial': 'bg-violet-100 text-violet-800 border border-violet-200',
        'art-class': 'bg-pink-100 text-pink-800 border border-pink-200',
        'reading-writing': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        'weekend-academic-tutorial': 'bg-teal-100 text-teal-800 border border-teal-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border border-gray-200';
};

export default function CreateProgram() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        prog_type: '',
        days: [] as string[],
        start_time: '09:00',
        end_time: '10:00',
        price: '',
        session_count: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/programs', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Program created successfully!', {
                    description: `"${data.name}" has been added to your programs.`,
                    duration: 5000,
                });

                // Reset form after successful submission
                setData({
                    name: '',
                    prog_type: '',
                    days: [],
                    start_time: '09:00',
                    end_time: '10:00',
                    price: '',
                    session_count: '',
                    description: '',
                });
            },
            onError: (errors) => {
                toast.error('Failed to create program', {
                    description: 'Please check the form for errors.',
                    duration: 5000,
                });
            },
        });
    };

    const handleDayChange = (day: string, checked: boolean) => {
        const newDays = checked ? [...data.days, day] : data.days.filter((d) => d !== day);
        setData('days', newDays);
    };

    // Calculate total cost preview
    const totalCostPreview = data.price && data.session_count ? parseFloat(data.price) * parseInt(data.session_count) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Program" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-3xl font-bold text-gray-900">Create New Program</h1>
                                <p className="text-gray-600">Add a new learning program to your center</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                                    New Program
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                        <Plus className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>Program Details</CardTitle>
                                        <CardDescription>Fill in the program information</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Program Name & Type */}
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-sm font-semibold">
                                                Program Name <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <BookOpen className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="e.g., Art for Beginners"
                                                    className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                                                    required
                                                />
                                            </div>
                                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="prog_type" className="text-sm font-semibold">
                                                Program Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={data.prog_type} onValueChange={(value) => setData('prog_type', value)} required>
                                                <SelectTrigger className={errors.prog_type ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select program type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PROGRAM_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={`px-2 py-0.5 text-xs ${getProgramTypeColor(type.value)}`}>
                                                                    {type.label}
                                                                </Badge>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.prog_type && <p className="text-sm text-red-600">{errors.prog_type}</p>}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-3">
                                        <Label htmlFor="description" className="text-sm font-semibold">
                                            Description (Optional)
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe the program, objectives, and target audience..."
                                            rows={4}
                                            className="resize-none"
                                        />
                                        <p className="text-xs text-gray-500">Provide a brief description of the program.</p>
                                    </div>

                                    {/* Schedule Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-blue-100 p-2">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold">Schedule</h3>
                                        </div>

                                        {/* Days */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">
                                                Days of the Week <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <div key={day.id} className="flex flex-col items-center space-y-2">
                                                        <Checkbox
                                                            id={day.id}
                                                            checked={data.days.includes(day.label)}
                                                            onCheckedChange={(checked) => handleDayChange(day.label, checked as boolean)}
                                                            className="h-5 w-5"
                                                        />
                                                        <Label htmlFor={day.id} className="cursor-pointer text-xs font-medium">
                                                            {day.label.slice(0, 3)}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.days && <p className="text-sm text-red-600">{errors.days}</p>}
                                        </div>

                                        {/* Time */}
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-3">
                                                <Label htmlFor="start_time" className="text-sm font-semibold">
                                                    Start Time <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                                    <Input
                                                        id="start_time"
                                                        type="time"
                                                        value={data.start_time}
                                                        onChange={(e) => setData('start_time', e.target.value)}
                                                        className={`pl-10 ${errors.start_time ? 'border-red-500' : ''}`}
                                                        required
                                                    />
                                                </div>
                                                {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="end_time" className="text-sm font-semibold">
                                                    End Time <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                                    <Input
                                                        id="end_time"
                                                        type="time"
                                                        value={data.end_time}
                                                        onChange={(e) => setData('end_time', e.target.value)}
                                                        className={`pl-10 ${errors.end_time ? 'border-red-500' : ''}`}
                                                        required
                                                    />
                                                </div>
                                                {errors.end_time && <p className="text-sm text-red-600">{errors.end_time}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-emerald-100 p-2">
                                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold">Pricing</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-3">
                                                <Label htmlFor="price" className="text-sm font-semibold">
                                                    Price per Session <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform font-bold">₱</span>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.price}
                                                        onChange={(e) => setData('price', e.target.value)}
                                                        placeholder="0.00"
                                                        className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                                                        required
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">Amount charged for each session</p>
                                                {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="session_count" className="text-sm font-semibold">
                                                    Number of Minimum Sessions <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <CalendarDays className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                                    <Input
                                                        id="session_count"
                                                        type="number"
                                                        min="1"
                                                        value={data.session_count}
                                                        onChange={(e) => setData('session_count', e.target.value)}
                                                        placeholder="e.g., 10"
                                                        className={`pl-10 ${errors.session_count ? 'border-red-500' : ''}`}
                                                        required
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">Total sessions in this program</p>
                                                {errors.session_count && <p className="text-sm text-red-600">{errors.session_count}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex justify-end gap-3 border-t pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                            disabled={processing}
                                            className="border-gray-300 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600"
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="mr-2">Creating...</span>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Program
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview Section */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6 border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle>Program Preview</CardTitle>
                                <CardDescription>How your program will appear</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Program Info Preview */}
                                {data.name ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Program Name</h4>
                                            <p className="text-lg font-bold text-gray-900">{data.name}</p>
                                        </div>

                                        {data.prog_type && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-gray-700">Program Type</h4>
                                                <Badge className={getProgramTypeColor(data.prog_type)}>
                                                    {PROGRAM_TYPES.find((t) => t.value === data.prog_type)?.label || data.prog_type}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Days Preview */}
                                        {data.days.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-gray-700">Schedule</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {data.days.map((day, index) => (
                                                        <Badge key={index} variant="outline" className="bg-gray-50">
                                                            {day.slice(0, 3)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {data.start_time} - {data.end_time}
                                                </p>
                                            </div>
                                        )}

                                        {/* Pricing Preview */}
                                        {(data.price || data.session_count) && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700">Pricing</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-lg bg-gray-50 p-3">
                                                        <p className="text-xs text-gray-500">Per Session</p>
                                                        <p className="text-lg font-bold">₱{parseFloat(data.price || '0').toLocaleString('en-PH')}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-emerald-50 p-3">
                                                        <p className="text-xs text-gray-500">Total</p>
                                                        <p className="text-lg font-bold text-emerald-700">
                                                            ₱{totalCostPreview.toLocaleString('en-PH')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Session Count */}
                                        {data.session_count && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-gray-700">Sessions</h4>
                                                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                                    <span className="font-semibold">{data.session_count} sessions</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                            <BookOpen className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="mt-4 text-gray-500">Fill in the form to see a preview</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
