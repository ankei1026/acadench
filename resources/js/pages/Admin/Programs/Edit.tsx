import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

// Define the Program type
interface Program {
    prog_id: string;
    name: string;
    prog_type: string;
    days: any;
    start_time: string;
    end_time: string;
    price: number;
    session_count: number;
    description?: string;
}

interface EditProgramProps {
    program: Program;
}

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
    { value: 'after-school-academic-tutorial', label: 'After School Academic Tutorial' },
    { value: 'special-tutorial', label: 'Special Tutorial' },
    { value: 'art-class', label: 'Art Class' },
    { value: 'reading-writing', label: 'Reading & Writing' },
    { value: 'weekend-academic-tutorial', label: 'Weekend Academic Tutorial' },
];

// Safe days parser
const getDaysArray = (days: any): string[] => {
    if (Array.isArray(days)) {
        return days;
    }

    if (typeof days === 'string') {
        try {
            const parsed = JSON.parse(days);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
};

// Format time for input
const formatTimeForInput = (timeString: string) => {
    if (!timeString) return '09:00';
    // Remove seconds if present
    return timeString.substring(0, 5);
};

export default function EditProgram({ program }: EditProgramProps) {
    const initialDays = getDaysArray(program.days);

    const { data, setData, put, processing, errors } = useForm({
        name: program.name,
        prog_type: program.prog_type,
        days: initialDays,
        start_time: formatTimeForInput(program.start_time),
        end_time: formatTimeForInput(program.end_time),
        price: program.price.toString(),
        session_count: program.session_count.toString(),
        description: program.description || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Programs',
            href: '/admin/programs',
        },
        {
            title: program.name,
            href: `/admin/programs/${program.prog_id}`,
        },
        {
            title: 'Edit',
            href: `/admin/programs/${program.prog_id}/edit`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/admin/programs/${program.prog_id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Program updated successfully!', {
                    description: `"${data.name}" has been updated.`,
                    duration: 5000,
                });
            },
            onError: (errors) => {
                toast.error('Failed to update program', {
                    description: 'Please check the form for errors.',
                    duration: 5000,
                });
            },
        });
    };

    const handleDayChange = (day: string, checked: boolean) => {
        const newDays = checked ? [...data.days, day] : data.days.filter((d: string) => d !== day);
        setData('days', newDays);
    };

    const handleCancel = () => {
        window.history.back();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Program: ${program.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold tracking-tight">Edit Program</h1>
                            <p className="text-muted-foreground">Update program details for: {program.name}</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Program Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Program Name & Type */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Program Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Art for Beginners"
                                        className={errors.name ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prog_type">
                                        Program Type <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.prog_type} onValueChange={(value) => setData('prog_type', value)} required>
                                        <SelectTrigger className={errors.prog_type ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select program type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PROGRAM_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.prog_type && <p className="text-sm text-destructive">{errors.prog_type}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe the program, objectives, and target audience..."
                                    rows={3}
                                />
                            </div>

                            {/* Schedule Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Schedule</h3>

                                {/* Days */}
                                <div className="space-y-2">
                                    <Label>
                                        Days of the Week <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex flex-wrap gap-4">
                                        {DAYS_OF_WEEK.map((day) => (
                                            <div key={day.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`edit-${day.id}`}
                                                    checked={data.days.includes(day.label)}
                                                    onCheckedChange={(checked) => handleDayChange(day.label, checked as boolean)}
                                                />
                                                <Label htmlFor={`edit-${day.id}`} className="cursor-pointer text-sm font-normal">
                                                    {day.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.days && <p className="text-sm text-destructive">{errors.days}</p>}
                                </div>

                                {/* Time */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_time">
                                            Start Time <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            className={errors.start_time ? 'border-destructive' : ''}
                                            required
                                        />
                                        {errors.start_time && <p className="text-sm text-destructive">{errors.start_time}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_time">
                                            End Time <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            className={errors.end_time ? 'border-destructive' : ''}
                                            required
                                        />
                                        {errors.end_time && <p className="text-sm text-destructive">{errors.end_time}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Capacity Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Pricing & Capacity</h3>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">
                                            Price (₱) <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 transform">₱</span>
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="0.00"
                                                className={`pl-8 ${errors.price ? 'border-destructive' : ''}`}
                                                required
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">Price per session</p>
                                        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="session_count">
                                            Sessions <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="session_count"
                                            type="number"
                                            min="1"
                                            value={data.session_count}
                                            onChange={(e) => setData('session_count', e.target.value)}
                                            placeholder="e.g., 10"
                                            className={errors.session_count ? 'border-destructive' : ''}
                                            required
                                        />
                                        {errors.session_count && <p className="text-sm text-destructive">{errors.session_count}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 border-t pt-4">
                                <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600"
                                >
                                    {processing ? (
                                        <>
                                            <span className="mr-2">Saving...</span>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
