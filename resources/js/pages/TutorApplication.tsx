import { useState, useCallback, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    GraduationCap,
    BookOpen,
    Users,
    Clock,
    DollarSign,
    Sparkles,
    Star,
    Award,
    Target,
    Zap,
    AlertCircle,
    Info,
    CheckCircle,
    Coins,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import HomeHeader from './Components/HomeHeader';

// Types
interface FormData {
    // Personal Information
    full_name: string;
    email: string;
    phone: string;
    birthdate: string;
    age: string;
    gender: string;
    home_address: string;
    facebook_link: string;
    contact_number: string;
    mother_name: string;
    father_name: string;
    living_status: string;

    // Educational Background
    high_school: string;
    college_school: string;
    college_course: string;
    is_licensed_teacher: boolean;
    license_date: string;

    // Teaching Experience
    employment_status: string;
    current_employer: string;
    working_hours: string;
    tutoring_experience_levels: string[];
    tutoring_experience_duration: string;
    has_school_teaching_experience: boolean;
    school_teaching_experience_duration: string;
    previous_clients: string;

    // Preferences and Skills
    favorite_subject_to_teach: string;
    easiest_subject_to_teach: string;
    most_difficult_subject_to_teach: string;
    easier_school_level_to_teach: string;
    harder_school_level_to_teach: string;
    reasons_love_teaching: string[];
    work_preference: string;
    class_size_preference: string;
    teaching_values: string[];
    application_reasons: string[];
    outside_activities: string[];

    // Logistics
    distance_from_hub_minutes: string;
    distance_from_work_minutes: string;
    transportation_mode: string;

    // Ratings
    enjoy_playing_with_kids_rating: number;
    preferred_toys_games: string[];
    annoyances: string[];
    need_job_rating: number;
    public_speaking_rating: number;
    penmanship_rating: number;
    creativity_rating: number;
    english_proficiency_rating: number;
    preferred_teaching_language: string;

    // Technology and Teaching Methods
    edtech_opinion: string;
    needs_phone_while_teaching: boolean;
    phone_usage_reason: string;
    teaching_difficulty_approach: string;
    discipline_approach: string;
    approves_late_fine_reward: boolean;
    late_fine_reason: string;
    expected_tenure: string;

    // Commitment
    preferred_workdays: string[];
    preferred_workdays_frequency: string;
    preferred_schedule: string;

    // Work Environment Preferences
    cleanliness_importance_rating: number;
    organization_importance_rating: number;
    shared_environment_comfort_rating: number;
    teaching_style_preference: string;
    ok_with_team_meetings: boolean;
    ok_with_parent_meetings: boolean;
    recording_comfort: string;
    ok_with_media_usage: boolean;

    // Final Review
    subject: string;
    document_path: File | null;
}

interface FormStep {
    id: number;
    title: string;
    description: string;
}

interface Option {
    value: string;
    label: string;
}

// Constants
const FORM_STEPS: FormStep[] = [
    { id: 1, title: 'Personal Info', description: 'Basic information about you' },
    { id: 2, title: 'Education', description: 'Your educational background' },
    { id: 3, title: 'Experience', description: 'Teaching experience' },
    { id: 4, title: 'Preferences', description: 'Skills and preferences' },
    { id: 5, title: 'Logistics', description: 'Location and availability' },
    { id: 6, title: 'Ratings', description: 'Self assessments' },
    { id: 7, title: 'Methods', description: 'Teaching approaches' },
    { id: 8, title: 'Commitment', description: 'Schedule preferences' },
    { id: 9, title: 'Environment', description: 'Work environment' },
    { id: 10, title: 'Review', description: 'Final review & submit' },
];

const EMPLOYMENT_STATUS_OPTIONS: string[] = ['employed', 'unemployed', 'freelance', 'business_owner'];
const WORK_PREFERENCE_OPTIONS: Option[] = [
    { value: 'alone', label: 'Prefer Working Alone' },
    { value: 'team', label: 'Prefer Working in a Team' },
];
const CLASS_SIZE_OPTIONS: Option[] = [
    { value: 'one_two', label: '1-on-1 or 2 students' },
    { value: 'many', label: 'Larger groups' },
];
const TRANSPORTATION_OPTIONS: Option[] = [
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'public', label: 'Public Transport' },
    { value: 'fetched', label: 'Get Fetched' },
    { value: 'walk', label: 'Walking' },
    { value: 'car', label: 'Car' },
    { value: 'bike', label: 'Bike' },
];
const EDTECH_OPTIONS: Option[] = [
    { value: 'agree', label: 'Agree' },
    { value: 'disagree', label: 'Disagree' },
    { value: 'unfamiliar', label: 'Unfamiliar' },
];
const TENURE_OPTIONS: Option[] = [
    { value: '1-3_months', label: '1-3 Months' },
    { value: '6_months', label: '6 Months' },
    { value: 'one_year', label: '1 Year' },
    { value: 'permanent', label: 'Permanent' },
];
const SCHEDULE_OPTIONS: Option[] = [
    { value: 'morning_9am', label: 'Morning (9AM)' },
    { value: 'after_school_5_7pm', label: 'After School (5-7PM)' },
    { value: 'whenever_available', label: 'Whenever Available' },
    { value: 'any_time', label: 'Any Time' },
    { value: 'custom', label: 'Custom Schedule' },
];
const FREQUENCY_OPTIONS: Option[] = [
    { value: '5x_weekdays', label: '5x Weekdays' },
    { value: '4x_weekdays', label: '4x Weekdays' },
    { value: '3x_weekdays', label: '3x Weekdays' },
    { value: 'saturdays_only', label: 'Saturdays Only' },
    { value: 'sundays_only', label: 'Sundays Only' },
    { value: 'both_weekends', label: 'Both Weekends' },
    { value: 'unlimited_weekdays', label: 'Unlimited Weekdays' },
    { value: 'unlimited_all_days', label: 'Unlimited All Days' },
];
const TEACHING_STYLE_OPTIONS: Option[] = [
    { value: 'own_way', label: 'Teaching My Own Way' },
    { value: 'guided', label: 'Guided Approach' },
];
const RECORDING_OPTIONS: Option[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'unsure', label: 'Unsure' },
];
const TEACHING_LANGUAGE_OPTIONS = ['English', 'Filipino', 'Both'];
const GENDER_OPTIONS: Option[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'prefer not to say', label: 'Prefer not to say' },
];
const LIVING_STATUS_OPTIONS: Option[] = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
    { value: 'in a relationship', label: 'In a Relationship' },
];
const REASONS_LOVING_TEACHING = [
    'Working with children',
    'Making a difference',
    'Flexible schedule',
    'Sharing knowledge',
    'Personal fulfillment',
    'Career growth',
];
const TEACHING_VALUES = ['Patience', 'Creativity', 'Empathy', 'Discipline', 'Communication', 'Adaptability'];
const APPLICATION_REASONS = ['Financial need', 'Career transition', 'Passion for teaching', 'Flexible hours', 'Gain experience', 'Supplement income'];
const OUTSIDE_ACTIVITIES = ['Sports', 'Music', 'Art', 'Reading', 'Games', 'Outdoor activities'];
const TOYS_GAMES = ['Board games', 'Card games', 'Sports equipment', 'Art supplies', 'Puzzles', 'Educational apps'];
const ANNOYANCES = ['Noise', 'Messiness', 'Disruptive behavior', 'Late arrivals', 'Lack of focus', 'Parent interference'];
const WORKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Custom Hooks
const useFormSteps = (totalSteps: number) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const goToNext = useCallback(() => {
        setCompletedSteps((prev) => new Set(prev).add(currentStep));
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }, [currentStep, totalSteps]);

    const goToPrev = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }, []);

    const goToStep = useCallback(
        (step: number) => {
            if (step <= Math.max(...Array.from(completedSteps), 0) + 2 && step >= 1) {
                setCurrentStep(step);
            }
        },
        [completedSteps],
    );

    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return {
        currentStep,
        setCurrentStep,
        completedSteps,
        goToNext,
        goToPrev,
        goToStep,
        progress,
        isFirstStep: currentStep === 1,
        isLastStep: currentStep === totalSteps,
    };
};

// Reusable Components
const FormField = ({
    label,
    error,
    required = false,
    children,
    className,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={cn('space-y-2', className)}>
        <Label className="flex items-center gap-1">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
            {error && <AlertCircle className="ml-1 h-3 w-3 text-red-500" />}
        </Label>
        <div className={cn('relative', error && 'rounded-lg border-red-300')}>{children}</div>
        {error && (
            <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {error}
            </p>
        )}
    </div>
);

const FormSection = ({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={cn('space-y-4', className)}>
        <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        {children}
    </div>
);

const RatingInput = ({
    label,
    value,
    onChange,
    required = false,
    error,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    required?: boolean;
    error?: string;
}) => (
    <FormField label={label} error={error} required={required}>
        <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
                <Button
                    key={num}
                    type="button"
                    variant={value >= num ? 'default' : 'outline'}
                    className={cn('h-10 w-10 transition-all', value >= num ? 'bg-yellow-400 text-black hover:bg-yellow-500' : '')}
                    onClick={() => onChange(num)}
                >
                    {num}
                </Button>
            ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Low</span>
            <span>High</span>
        </div>
    </FormField>
);

const CheckboxGroup = ({
    label,
    options,
    selectedValues,
    onChange,
}: {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (value: string, checked: boolean) => void;
}) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <div className="grid grid-cols-2 gap-2">
            {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                        id={`checkbox-${option}`}
                        checked={selectedValues.includes(option)}
                        onCheckedChange={(checked) => onChange(option, checked as boolean)}
                    />
                    <Label htmlFor={`checkbox-${option}`} className="text-sm">
                        {option}
                    </Label>
                </div>
            ))}
        </div>
    </div>
);

const RadioGroup = ({
    label,
    name,
    options,
    value,
    onChange,
}: {
    label: string;
    name: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
}) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex flex-wrap gap-3">
            {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                    <input
                        type="radio"
                        id={`${name}-${option.value}`}
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-4 w-4 text-yellow-400 focus:ring-yellow-400"
                    />
                    <Label htmlFor={`${name}-${option.value}`} className="text-sm">
                        {option.label}
                    </Label>
                </div>
            ))}
        </div>
    </div>
);

// Main Component
export default function TutorApplication() {
    const [showForm, setShowForm] = useState(false);
    const { currentStep, completedSteps, goToNext, goToPrev, goToStep, progress, isFirstStep, isLastStep } = useFormSteps(FORM_STEPS.length);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        // Personal Information
        full_name: '',
        email: '',
        phone: '',
        birthdate: '',
        age: '',
        gender: '',
        home_address: '',
        facebook_link: '',
        contact_number: '',
        mother_name: '',
        father_name: '',
        living_status: '',

        // Educational Background
        high_school: '',
        college_school: '',
        college_course: '',
        is_licensed_teacher: false,
        license_date: '',

        // Teaching Experience
        employment_status: '',
        current_employer: '',
        working_hours: '',
        tutoring_experience_levels: [],
        tutoring_experience_duration: '',
        has_school_teaching_experience: false,
        school_teaching_experience_duration: '',
        previous_clients: '',

        // Preferences and Skills
        favorite_subject_to_teach: '',
        easiest_subject_to_teach: '',
        most_difficult_subject_to_teach: '',
        easier_school_level_to_teach: '',
        harder_school_level_to_teach: '',
        reasons_love_teaching: [],
        work_preference: '',
        class_size_preference: '',
        teaching_values: [],
        application_reasons: [],
        outside_activities: [],

        // Logistics
        distance_from_hub_minutes: '',
        distance_from_work_minutes: '',
        transportation_mode: '',

        // Ratings
        enjoy_playing_with_kids_rating: 0,
        preferred_toys_games: [],
        annoyances: [],
        need_job_rating: 0,
        public_speaking_rating: 0,
        penmanship_rating: 0,
        creativity_rating: 0,
        english_proficiency_rating: 0,
        preferred_teaching_language: '',

        // Technology and Teaching Methods
        edtech_opinion: '',
        needs_phone_while_teaching: false,
        phone_usage_reason: '',
        teaching_difficulty_approach: '',
        discipline_approach: '',
        approves_late_fine_reward: false,
        late_fine_reason: '',
        expected_tenure: '',

        // Commitment
        preferred_workdays: [],
        preferred_workdays_frequency: '',
        preferred_schedule: '',

        // Work Environment Preferences
        cleanliness_importance_rating: 0,
        organization_importance_rating: 0,
        shared_environment_comfort_rating: 0,
        teaching_style_preference: '',
        ok_with_team_meetings: false,
        ok_with_parent_meetings: false,
        recording_comfort: '',
        ok_with_media_usage: false,

        // Final Review
        subject: '',
        document_path: null,
    });

    // Step validation
    const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

    const validateStep = useCallback(
        (step: number): boolean => {
            const errors: string[] = [];
            switch (step) {
                case 1:
                    if (!data.full_name.trim()) errors.push('Full Name is required');
                    if (!data.email.trim()) errors.push('Email is required');
                    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Email is invalid');
                    if (!data.birthdate.trim()) errors.push('Birthdate is required');
                    if (!data.age.trim()) errors.push('Age is required');
                    if (!data.gender.trim()) errors.push('Gender is required');
                    if (!data.home_address.trim()) errors.push('Home Address is required');
                    if (!data.phone.trim()) errors.push('Phone Number is required');
                    if (!data.contact_number.trim()) errors.push('Contact Number is required');
                    if (!data.facebook_link.trim()) errors.push('Facebook Link is required');
                    if (!data.mother_name.trim()) errors.push('Mother Name is required');
                    if (!data.father_name.trim()) errors.push('Father Name is required');
                    if (!data.living_status.trim()) errors.push('Living Status is required');
                    break;
                case 2:
                    if (!data.high_school.trim()) errors.push('High School is required');
                    if (!data.college_school.trim()) errors.push('College/University is required');
                    if (!data.college_course.trim()) errors.push('College Course is required');
                    if (data.is_licensed_teacher && !data.license_date.trim()) errors.push('License Date is required');
                    break;
                case 3:
                    if (!data.employment_status.trim()) errors.push('Employment Status is required');
                    const showEmployerFields = ['employed', 'freelance', 'business_owner'].includes(data.employment_status);
                    if (showEmployerFields) {
                        if (!data.current_employer.trim()) errors.push('Current Employer is required');
                        if (!data.working_hours.trim()) errors.push('Working Hours is required');
                    }
                    if (data.tutoring_experience_levels.length === 0) errors.push('Select at least one tutoring experience level');
                    if (!data.tutoring_experience_duration.trim()) errors.push('Tutoring Experience Duration is required');
                    if (data.has_school_teaching_experience) {
                        if (!data.school_teaching_experience_duration.trim()) errors.push('School Teaching Experience Duration is required');
                        if (!data.previous_clients.trim()) errors.push('Previous Clients is required');
                    }
                    break;
                case 4:
                    if (!data.favorite_subject_to_teach.trim()) errors.push('Favorite Subject is required');
                    if (!data.easiest_subject_to_teach.trim()) errors.push('Easiest Subject is required');
                    if (!data.most_difficult_subject_to_teach.trim()) errors.push('Most Difficult Subject is required');
                    if (!data.easier_school_level_to_teach.trim()) errors.push('Easier School Level is required');
                    if (!data.harder_school_level_to_teach.trim()) errors.push('Harder School Level is required');
                    if (data.reasons_love_teaching.length === 0) errors.push('Select at least one reason for loving teaching');
                    if (!data.work_preference.trim()) errors.push('Work Preference is required');
                    if (!data.class_size_preference.trim()) errors.push('Class Size Preference is required');
                    if (data.teaching_values.length === 0) errors.push('Select at least one teaching value');
                    if (data.application_reasons.length === 0) errors.push('Select at least one application reason');
                    if (data.outside_activities.length === 0) errors.push('Select at least one outside activity');
                    break;
                case 5:
                    if (!data.distance_from_hub_minutes.trim()) errors.push('Distance from Hub is required');
                    if (!data.distance_from_work_minutes.trim()) errors.push('Distance from Work is required');
                    if (!data.transportation_mode.trim()) errors.push('Transportation Mode is required');
                    break;
                case 6:
                    if (data.enjoy_playing_with_kids_rating < 1) errors.push('Enjoy playing with kids rating is required');
                    if (data.need_job_rating < 1) errors.push('Need job rating is required');
                    if (data.public_speaking_rating < 1) errors.push('Public speaking rating is required');
                    if (data.penmanship_rating < 1) errors.push('Penmanship rating is required');
                    if (data.creativity_rating < 1) errors.push('Creativity rating is required');
                    if (data.english_proficiency_rating < 1) errors.push('English proficiency rating is required');
                    if (!data.preferred_teaching_language.trim()) errors.push('Preferred Teaching Language is required');
                    if (data.preferred_toys_games.length === 0) errors.push('Select at least one preferred toy/game');
                    if (data.annoyances.length === 0) errors.push('Select at least one annoyance');
                    break;
                case 7:
                    if (!data.edtech_opinion.trim()) errors.push('EdTech Opinion is required');
                    if (data.needs_phone_while_teaching && !data.phone_usage_reason.trim()) errors.push('Phone usage reason is required');
                    if (!data.teaching_difficulty_approach.trim()) errors.push('Teaching difficulty approach is required');
                    if (!data.discipline_approach.trim()) errors.push('Discipline approach is required');
                    if (data.approves_late_fine_reward && !data.late_fine_reason.trim()) errors.push('Late fine reason is required');
                    if (!data.expected_tenure.trim()) errors.push('Expected Tenure is required');
                    break;
                case 8:
                    if (data.preferred_workdays.length === 0) errors.push('Select at least one preferred workday');
                    if (!data.preferred_workdays_frequency.trim()) errors.push('Work Frequency is required');
                    if (!data.preferred_schedule.trim()) errors.push('Preferred Schedule is required');
                    break;
                case 9:
                    if (data.cleanliness_importance_rating < 1) errors.push('Cleanliness Importance rating is required');
                    if (data.organization_importance_rating < 1) errors.push('Organization Importance rating is required');
                    if (data.shared_environment_comfort_rating < 1) errors.push('Shared Environment Comfort rating is required');
                    if (!data.teaching_style_preference.trim()) errors.push('Teaching Style Preference is required');
                    if (!data.recording_comfort.trim()) errors.push('Recording Comfort is required');
                    break;
                case 10:
                    if (!data.subject.trim()) errors.push('Subject is required');
                    if (!data.document_path) errors.push('Resume document is required');
                    break;
            }
            setStepErrors((prev) => ({ ...prev, [step]: errors }));
            return errors.length === 0;
        },
        [data],
    );

    const handleNextStep = useCallback(
        (e?: React.MouseEvent<HTMLButtonElement>) => {
            // Prevent accidental form submission caused by DOM re-render during click
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (validateStep(currentStep)) {
                goToNext();
            } else {
                toast.error('Please fill in all required fields', {
                    style: {
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                    },
                });
            }
        },
        [currentStep, validateStep, goToNext],
    );

    const handleCheckboxChange = useCallback(
        (field: keyof FormData, value: string) => {
            const currentArray = data[field] as string[];
            const newArray = currentArray.includes(value) ? currentArray.filter((item) => item !== value) : [...currentArray, value];
            setData(field, newArray as any);
        },
        [data, setData],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.currentTarget.files?.[0] || null;
            setData('document_path', file);
        },
        [setData],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            post('/tutor-application', {
                onSuccess: () => {
                    toast.success('Application submitted successfully! We will review it within 2-7 days.', {
                        style: {
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                        },
                    });
                    setShowForm(false);
                    reset();
                },
                onError: (errors: any) => {
                    // Log full error object for debugging
                    console.error('Submission errors:', errors);

                    // If validation errors provided, show them concisely
                    if (errors && typeof errors === 'object') {
                        const messages = Object.values(errors).flat().filter(Boolean) as string[];
                        const message = messages.length
                            ? messages.join(' \n')
                            : 'There was an error submitting your application. Please check the form.';
                        toast.error(message, {
                            style: {
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                            },
                        });
                    } else {
                        toast.error('There was an error submitting your application. Please try again.', {
                            style: {
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                            },
                        });
                    }
                },
            });
        },
        [post, reset],
    );

    // Normal navigation: validate current step and move forward

    const renderStep1 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Personal Information" description="Tell us about yourself">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Full Name" required error={errors.full_name}>
                        <Input placeholder="John Doe" value={data.full_name} onChange={(e) => setData('full_name', e.target.value)} />
                    </FormField>
                    <FormField label="Email" required error={errors.email}>
                        <Input type="email" placeholder="john@example.com" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Birthdate" required error={errors.birthdate}>
                        <Input type="date" value={data.birthdate} onChange={(e) => setData('birthdate', e.target.value)} />
                    </FormField>
                    <FormField label="Age" required error={errors.age}>
                        <Input type="number" placeholder="25" value={data.age} onChange={(e) => setData('age', e.target.value)} />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Gender" required error={errors.gender}>
                        <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                {GENDER_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label="Living Status" required error={errors.living_status}>
                        <Select value={data.living_status} onValueChange={(value) => setData('living_status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {LIVING_STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>
                <FormField label="Home Address" required error={errors.home_address}>
                    <Textarea
                        placeholder="Your complete home address"
                        value={data.home_address}
                        onChange={(e) => setData('home_address', e.target.value)}
                    />
                </FormField>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Phone Number" required error={errors.phone}>
                        <Input placeholder="+63 912 345 6789" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                    </FormField>
                    <FormField label="Contact Number" required error={errors.contact_number}>
                        <Input
                            placeholder="Alternative contact number"
                            value={data.contact_number}
                            onChange={(e) => setData('contact_number', e.target.value)}
                        />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Facebook Link" required error={errors.facebook_link}>
                        <Input
                            placeholder="https://facebook.com/yourprofile"
                            value={data.facebook_link}
                            onChange={(e) => setData('facebook_link', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Mother's Name" required error={errors.mother_name}>
                        <Input placeholder="Mother's full name" value={data.mother_name} onChange={(e) => setData('mother_name', e.target.value)} />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Father's Name" required error={errors.father_name}>
                        <Input placeholder="Father's full name" value={data.father_name} onChange={(e) => setData('father_name', e.target.value)} />
                    </FormField>
                </div>
            </FormSection>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Educational Background" description="Your educational history">
                <FormField label="High School" required error={errors.high_school}>
                    <Input placeholder="Your high school" value={data.high_school} onChange={(e) => setData('high_school', e.target.value)} />
                </FormField>
                <FormField label="College/University" required error={errors.college_school}>
                    <Input
                        placeholder="Your college/university"
                        value={data.college_school}
                        onChange={(e) => setData('college_school', e.target.value)}
                    />
                </FormField>
                <FormField label="College Course" required error={errors.college_course}>
                    <Input placeholder="Your course/degree" value={data.college_course} onChange={(e) => setData('college_course', e.target.value)} />
                </FormField>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="is_licensed_teacher"
                        checked={data.is_licensed_teacher}
                        onCheckedChange={(checked) => setData('is_licensed_teacher', checked as boolean)}
                    />
                    <Label htmlFor="is_licensed_teacher">I am a licensed teacher</Label>
                </div>
                {data.is_licensed_teacher && (
                    <FormField label="License Date" error={errors.license_date}>
                        <Input type="date" value={data.license_date} onChange={(e) => setData('license_date', e.target.value)} />
                    </FormField>
                )}
            </FormSection>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Teaching Experience" description="Your tutoring and teaching background">
                <FormField label="Employment Status" required error={errors.employment_status}>
                    <Select value={data.employment_status} onValueChange={(value) => setData('employment_status', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                        <SelectContent>
                            {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
                {['employed', 'freelance', 'business_owner'].includes(data.employment_status) && (
                    <>
                        <FormField label="Current Employer" required error={errors.current_employer}>
                            <Input
                                placeholder="Your current employer"
                                value={data.current_employer}
                                onChange={(e) => setData('current_employer', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Working Hours" required error={errors.working_hours}>
                            <Input
                                placeholder="e.g., 9 AM - 5 PM"
                                value={data.working_hours}
                                onChange={(e) => setData('working_hours', e.target.value)}
                            />
                        </FormField>
                    </>
                )}
                <CheckboxGroup
                    label="Tutoring Experience Levels (Required)"
                    options={['Elementary', 'High School', 'College', 'Adult']}
                    selectedValues={data.tutoring_experience_levels}
                    onChange={(value) => handleCheckboxChange('tutoring_experience_levels', value)}
                />
                <FormField label="Tutoring Experience Duration" required error={errors.tutoring_experience_duration}>
                    <Input
                        placeholder="e.g., 2 years"
                        value={data.tutoring_experience_duration}
                        onChange={(e) => setData('tutoring_experience_duration', e.target.value)}
                    />
                </FormField>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="has_school_teaching_experience"
                        checked={data.has_school_teaching_experience}
                        onCheckedChange={(checked) => setData('has_school_teaching_experience', checked as boolean)}
                    />
                    <Label htmlFor="has_school_teaching_experience">I have formal school teaching experience</Label>
                </div>
                {data.has_school_teaching_experience && (
                    <>
                        <FormField label="School Teaching Experience Duration" required error={errors.school_teaching_experience_duration}>
                            <Input
                                placeholder="e.g., 3 years"
                                value={data.school_teaching_experience_duration}
                                onChange={(e) => setData('school_teaching_experience_duration', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Previous Clients" required error={errors.previous_clients}>
                            <Textarea
                                placeholder="Describe your previous tutoring clients..."
                                value={data.previous_clients}
                                onChange={(e) => setData('previous_clients', e.target.value)}
                            />
                        </FormField>
                    </>
                )}
            </FormSection>
        </motion.div>
    );

    const renderStep4 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Preferences & Skills" description="Your teaching preferences and values">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Favorite Subject" required error={errors.favorite_subject_to_teach}>
                        <Input
                            placeholder="e.g., Mathematics"
                            value={data.favorite_subject_to_teach}
                            onChange={(e) => setData('favorite_subject_to_teach', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Easiest Subject" required error={errors.easiest_subject_to_teach}>
                        <Input
                            placeholder="e.g., English"
                            value={data.easiest_subject_to_teach}
                            onChange={(e) => setData('easiest_subject_to_teach', e.target.value)}
                        />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Most Difficult Subject" required error={errors.most_difficult_subject_to_teach}>
                        <Input
                            placeholder="e.g., Physics"
                            value={data.most_difficult_subject_to_teach}
                            onChange={(e) => setData('most_difficult_subject_to_teach', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Easier School Level" required error={errors.easier_school_level_to_teach}>
                        <Input
                            placeholder="e.g., Elementary"
                            value={data.easier_school_level_to_teach}
                            onChange={(e) => setData('easier_school_level_to_teach', e.target.value)}
                        />
                    </FormField>
                </div>
                <FormField label="Harder School Level" required error={errors.harder_school_level_to_teach}>
                    <Input
                        placeholder="e.g., High School"
                        value={data.harder_school_level_to_teach}
                        onChange={(e) => setData('harder_school_level_to_teach', e.target.value)}
                    />
                </FormField>
                <CheckboxGroup
                    label="Why do you love teaching? (Required)"
                    options={REASONS_LOVING_TEACHING}
                    selectedValues={data.reasons_love_teaching}
                    onChange={(value) => handleCheckboxChange('reasons_love_teaching', value)}
                />
                <RadioGroup
                    label="Work Preference (Required)"
                    name="work_preference"
                    options={WORK_PREFERENCE_OPTIONS}
                    value={data.work_preference}
                    onChange={(value) => setData('work_preference', value)}
                />
                <RadioGroup
                    label="Class Size Preference (Required)"
                    name="class_size"
                    options={CLASS_SIZE_OPTIONS}
                    value={data.class_size_preference}
                    onChange={(value) => setData('class_size_preference', value)}
                />
                <CheckboxGroup
                    label="Teaching Values (Required)"
                    options={TEACHING_VALUES}
                    selectedValues={data.teaching_values}
                    onChange={(value) => handleCheckboxChange('teaching_values', value)}
                />
                <CheckboxGroup
                    label="Why are you applying? (Required)"
                    options={APPLICATION_REASONS}
                    selectedValues={data.application_reasons}
                    onChange={(value) => handleCheckboxChange('application_reasons', value)}
                />
                <CheckboxGroup
                    label="Outside Activities (Required)"
                    options={OUTSIDE_ACTIVITIES}
                    selectedValues={data.outside_activities}
                    onChange={(value) => handleCheckboxChange('outside_activities', value)}
                />
            </FormSection>
        </motion.div>
    );

    const renderStep5 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Logistics" description="Your location and transportation">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Distance from Hub (minutes)" required error={errors.distance_from_hub_minutes}>
                        <Input
                            type="number"
                            placeholder="e.g., 30"
                            value={data.distance_from_hub_minutes}
                            onChange={(e) => setData('distance_from_hub_minutes', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Distance from Work (minutes)" required error={errors.distance_from_work_minutes}>
                        <Input
                            type="number"
                            placeholder="e.g., 45"
                            value={data.distance_from_work_minutes}
                            onChange={(e) => setData('distance_from_work_minutes', e.target.value)}
                        />
                    </FormField>
                </div>
                <FormField label="Transportation Mode" required error={errors.transportation_mode}>
                    <Select value={data.transportation_mode} onValueChange={(value) => setData('transportation_mode', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select transportation mode" />
                        </SelectTrigger>
                        <SelectContent>
                            {TRANSPORTATION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            </FormSection>
        </motion.div>
    );

    const renderStep6 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Ratings" description="Self-assessment ratings">
                <RatingInput
                    label="How much do you enjoy playing with kids?"
                    value={data.enjoy_playing_with_kids_rating}
                    onChange={(value) => setData('enjoy_playing_with_kids_rating', value)}
                    required
                />
                <RatingInput
                    label="How much do you need this job?"
                    value={data.need_job_rating}
                    onChange={(value) => setData('need_job_rating', value)}
                    required
                />
                <RatingInput
                    label="Public Speaking Rating"
                    value={data.public_speaking_rating}
                    onChange={(value) => setData('public_speaking_rating', value)}
                    required
                />
                <RatingInput
                    label="Penmanship Rating"
                    value={data.penmanship_rating}
                    onChange={(value) => setData('penmanship_rating', value)}
                    required
                />
                <RatingInput
                    label="Creativity Rating"
                    value={data.creativity_rating}
                    onChange={(value) => setData('creativity_rating', value)}
                    required
                />
                <RatingInput
                    label="English Proficiency Rating"
                    value={data.english_proficiency_rating}
                    onChange={(value) => setData('english_proficiency_rating', value)}
                    required
                />
                <RadioGroup
                    label="Preferred Teaching Language (Required)"
                    name="teaching_language"
                    options={TEACHING_LANGUAGE_OPTIONS.map((lang) => ({ value: lang, label: lang }))}
                    value={data.preferred_teaching_language}
                    onChange={(value) => setData('preferred_teaching_language', value)}
                />
                <CheckboxGroup
                    label="Preferred Toys/Games (Required)"
                    options={TOYS_GAMES}
                    selectedValues={data.preferred_toys_games}
                    onChange={(value) => handleCheckboxChange('preferred_toys_games', value)}
                />
                <CheckboxGroup
                    label="What annoys you? (Required)"
                    options={ANNOYANCES}
                    selectedValues={data.annoyances}
                    onChange={(value) => handleCheckboxChange('annoyances', value)}
                />
            </FormSection>
        </motion.div>
    );

    const renderStep7 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Teaching Methods" description="Your approach to teaching">
                <RadioGroup
                    label="EdTech Opinion (Required)"
                    name="edtech"
                    options={EDTECH_OPTIONS}
                    value={data.edtech_opinion}
                    onChange={(value) => setData('edtech_opinion', value)}
                />
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="needs_phone_while_teaching"
                        checked={data.needs_phone_while_teaching}
                        onCheckedChange={(checked) => setData('needs_phone_while_teaching', checked as boolean)}
                    />
                    <Label htmlFor="needs_phone_while_teaching">I need to have my phone while teaching</Label>
                </div>
                {data.needs_phone_while_teaching && (
                    <FormField label="Why do you need your phone?" required error={errors.phone_usage_reason}>
                        <Textarea
                            placeholder="Explain why you need your phone while teaching..."
                            value={data.phone_usage_reason}
                            onChange={(e) => setData('phone_usage_reason', e.target.value)}
                        />
                    </FormField>
                )}
                <FormField label="How would you approach a student who is having difficulty?" required error={errors.teaching_difficulty_approach}>
                    <Textarea
                        placeholder="Describe your approach..."
                        value={data.teaching_difficulty_approach}
                        onChange={(e) => setData('teaching_difficulty_approach', e.target.value)}
                    />
                </FormField>
                <FormField label="What is your discipline approach?" required error={errors.discipline_approach}>
                    <Textarea
                        placeholder="Describe your discipline approach..."
                        value={data.discipline_approach}
                        onChange={(e) => setData('discipline_approach', e.target.value)}
                    />
                </FormField>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="approves_late_fine_reward"
                        checked={data.approves_late_fine_reward}
                        onCheckedChange={(checked) => setData('approves_late_fine_reward', checked as boolean)}
                    />
                    <Label htmlFor="approves_late_fine_reward">I approve of implementing a late fine and reward system</Label>
                </div>
                {data.approves_late_fine_reward && (
                    <FormField label="Why do you approve/disapprove?" required error={errors.late_fine_reason}>
                        <Textarea
                            placeholder="Explain your reasoning..."
                            value={data.late_fine_reason}
                            onChange={(e) => setData('late_fine_reason', e.target.value)}
                        />
                    </FormField>
                )}
                <FormField label="Expected Tenure" required error={errors.expected_tenure}>
                    <Select value={data.expected_tenure} onValueChange={(value) => setData('expected_tenure', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select expected tenure" />
                        </SelectTrigger>
                        <SelectContent>
                            {TENURE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            </FormSection>
        </motion.div>
    );

    const renderStep8 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Commitment" description="Your schedule preferences">
                <CheckboxGroup
                    label="Preferred Workdays (Required)"
                    options={WORKDAYS}
                    selectedValues={data.preferred_workdays}
                    onChange={(value) => handleCheckboxChange('preferred_workdays', value)}
                />
                <FormField label="Work Frequency" required error={errors.preferred_workdays_frequency}>
                    <Select value={data.preferred_workdays_frequency} onValueChange={(value) => setData('preferred_workdays_frequency', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select work frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            {FREQUENCY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
                <FormField label="Preferred Schedule" required error={errors.preferred_schedule}>
                    <Select value={data.preferred_schedule} onValueChange={(value) => setData('preferred_schedule', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select preferred schedule" />
                        </SelectTrigger>
                        <SelectContent>
                            {SCHEDULE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            </FormSection>
        </motion.div>
    );

    const renderStep9 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Work Environment Preferences" description="Your ideal work environment">
                <RatingInput
                    label="Cleanliness Importance Rating"
                    value={data.cleanliness_importance_rating}
                    onChange={(value) => setData('cleanliness_importance_rating', value)}
                    required
                />
                <RatingInput
                    label="Organization Importance Rating"
                    value={data.organization_importance_rating}
                    onChange={(value) => setData('organization_importance_rating', value)}
                    required
                />
                <RatingInput
                    label="Shared Environment Comfort Rating"
                    value={data.shared_environment_comfort_rating}
                    onChange={(value) => setData('shared_environment_comfort_rating', value)}
                    required
                />
                <RadioGroup
                    label="Teaching Style Preference (Required)"
                    name="teaching_style"
                    options={TEACHING_STYLE_OPTIONS}
                    value={data.teaching_style_preference}
                    onChange={(value) => setData('teaching_style_preference', value)}
                />
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="ok_with_team_meetings"
                        checked={data.ok_with_team_meetings}
                        onCheckedChange={(checked) => setData('ok_with_team_meetings', checked as boolean)}
                    />
                    <Label htmlFor="ok_with_team_meetings">I am okay with team meetings</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="ok_with_parent_meetings"
                        checked={data.ok_with_parent_meetings}
                        onCheckedChange={(checked) => setData('ok_with_parent_meetings', checked as boolean)}
                    />
                    <Label htmlFor="ok_with_parent_meetings">I am okay with parent meetings</Label>
                </div>
                <RadioGroup
                    label="Comfortable with recording sessions? (Required)"
                    name="recording"
                    options={RECORDING_OPTIONS}
                    value={data.recording_comfort}
                    onChange={(value) => setData('recording_comfort', value)}
                />
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="ok_with_media_usage"
                        checked={data.ok_with_media_usage}
                        onCheckedChange={(checked) => setData('ok_with_media_usage', checked as boolean)}
                    />
                    <Label htmlFor="ok_with_media_usage">I am okay with media usage</Label>
                </div>
            </FormSection>
        </motion.div>
    );

    const renderStep10 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <FormSection title="Final Review" description="Submit your application">
                <FormField label="Subject You Want to Teach" required error={errors.subject}>
                    <Input
                        placeholder="Ex. Mathematics, English, Science"
                        value={data.subject}
                        onChange={(e) => setData('subject', e.target.value)}
                    />
                </FormField>
                <FormField label="Resume & Credentials" required error={errors.document_path}>
                    <Input type="file" accept=".pdf" className="cursor-pointer bg-white" onChange={handleFileChange} />
                    <p className="text-xs text-gray-500">
                        Upload your resume (PDF). Format: Lastname, Firstname MiddleInitial
                        <br />
                        Ex: Doe, Jon R.
                    </p>
                </FormField>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <h4 className="font-semibold">Application Summary</h4>
                    <div className="mt-2 space-y-1 text-sm">
                        <p>
                            <strong>Name:</strong> {data.full_name || 'Not provided'}
                        </p>
                        <p>
                            <strong>Email:</strong> {data.email || 'Not provided'}
                        </p>
                        <p>
                            <strong>Subject:</strong> {data.subject || 'Not provided'}
                        </p>
                        <p>
                            <strong>Employment:</strong> {data.employment_status || 'Not provided'}
                        </p>
                        {['employed', 'freelance', 'business_owner'].includes(data.employment_status) && (
                            <>
                                <p>
                                    <strong>Current Employer:</strong> {data.current_employer || 'Not provided'}
                                </p>
                                <p>
                                    <strong>Working Hours:</strong> {data.working_hours || 'Not provided'}
                                </p>
                            </>
                        )}
                        <p>
                            <strong>Experience:</strong> {data.tutoring_experience_duration || 'Not provided'}
                        </p>
                    </div>
                </div>
            </FormSection>
        </motion.div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            case 4:
                return renderStep4();
            case 5:
                return renderStep5();
            case 6:
                return renderStep6();
            case 7:
                return renderStep7();
            case 8:
                return renderStep8();
            case 9:
                return renderStep9();
            case 10:
                return renderStep10();
            default:
                return null;
        }
    };

    const renderStepIndicator = () => (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                {FORM_STEPS.map((step) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isCurrent = currentStep === step.id;
                    const canNavigate = step.id <= Math.max(...Array.from(completedSteps), 0) + 2;

                    return (
                        <div
                            key={step.id}
                            className={cn('flex flex-col items-center', canNavigate ? 'cursor-pointer' : 'cursor-default')}
                            onClick={() => canNavigate && goToStep(step.id)}
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    backgroundColor: isCompleted ? '#22c55e' : isCurrent ? '#facc15' : '#e5e7eb',
                                }}
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                                    isCompleted ? 'text-white' : isCurrent ? 'text-black' : 'text-gray-500',
                                )}
                            >
                                {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                            </motion.div>
                            <span className={cn('mt-2 text-[10px]', isCurrent ? 'font-semibold text-black' : 'text-gray-500')}>{step.title}</span>
                        </div>
                    );
                })}
            </div>
            <motion.div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200" initial={false} animate={{ width: '100%' }}>
                <motion.div
                    className="h-full rounded-full bg-yellow-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
        </div>
    );

    const renderLandingContent = () => (
        <div className="lg:col-span-2">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
            >
                {/* Left Content */}
                <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
                        <Sparkles className="h-4 w-4" />
                        Join Our Team of Expert Tutors
                    </div>

                    <h1 className="text-4xl leading-tight font-bold text-gray-900 md:text-5xl">
                        Shape Young Minds,
                        <span className="mt-1 block text-yellow-500">Earn Your Way</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-lg text-gray-700">
                        Transform lives through education while building a flexible career that works around your schedule. Join our community of
                        passionate educators.
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="rounded-lg bg-yellow-50 p-2">
                                <BookOpen className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Flexible Subjects</h4>
                                <p className="mt-1 text-sm text-gray-600">Teach what you love</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="rounded-lg bg-yellow-50 p-2">
                                <Coins className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Competitive Rates</h4>
                                <p className="mt-1 text-sm text-gray-600">Set your own price</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="rounded-lg bg-yellow-50 p-2">
                                <Clock className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Flexible Hours</h4>
                                <p className="mt-1 text-sm text-gray-600">Work when you want</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="rounded-lg bg-yellow-50 p-2">
                                <Users className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Team Support</h4>
                                <p className="mt-1 text-sm text-gray-600">Join our community</p>
                            </div>
                        </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-10">
                        <Button
                            onClick={() => setShowForm(true)}
                            className="w-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-10 py-6 text-lg font-semibold text-black shadow-lg transition-all duration-300 hover:from-yellow-500 hover:to-amber-600 hover:shadow-xl lg:w-auto"
                        >
                            <GraduationCap className="mr-3 h-6 w-6" />
                            Start Your Application
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                        <p className="mt-3 text-center text-sm text-gray-500 lg:text-left">
                            No commitment required. Fill out the form and we'll get in touch!
                        </p>
                    </motion.div>
                </div>

                <div>
                    <div className="mt-10">
                        <div className="mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-yellow-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Why Choose Us?</h3>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                                <span>📚 Teach subjects you're passionate about</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                                <span>💰 Set competitive per hour rates</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                                <span>🤝 Be part of a supportive teaching community</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                                <span>⚡ Get matched with students who need your expertise</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-8 rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <Award className="h-6 w-6 text-yellow-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Application Requirements 📄</h3>
                        </div>

                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-3">
                                <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                                <span>Your most recent resume (PDF preferred)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                                <span>Teaching certificates or credentials (if any)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                                <span>Academic transcripts (optional but recommended)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                                <span>Any supporting documents showcasing your expertise</span>
                            </li>
                        </ul>

                        <div className="mt-6 rounded-lg border border-yellow-100 bg-white p-4">
                            <p className="text-sm text-gray-600">
                                ⚡ <span className="font-semibold">Quick Review:</span> We typically review applications within{' '}
                                <span className="font-bold text-yellow-600">2-7 days</span>. Your login credentials will be sent to your email upon
                                approval.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    const renderFormContent = () => (
        <Card className="border-gray-200 bg-white text-gray-900 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl">Tutor Application</CardTitle>
                <CardDescription className="text-gray-600">
                    Step {currentStep} of {FORM_STEPS.length}: {FORM_STEPS[currentStep - 1].title}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {renderStepIndicator()}

                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">{renderCurrentStep()}</AnimatePresence>
                    </div>

                    <div className="flex justify-between border-t pt-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={goToPrev}
                                disabled={isFirstStep || processing}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                        </motion.div>
                        {isLastStep ? (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => handleSubmit(e as any)}
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Application
                                            <Check className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => handleNextStep(e)}
                                    className="flex items-center gap-2 bg-yellow-400 text-black hover:bg-yellow-500"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Head title="Tutor Application" />
            <Toaster
                position="top-right"
                toastOptions={{
                    unstyled: false,
                }}
            />

            <div className="min-h-screen bg-[#FCF8F1]">
                <HomeHeader />

                <section className="py-10 sm:py-16 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-12">{!showForm ? renderLandingContent() : renderFormContent()}</div>
                    </div>
                </section>
            </div>
        </>
    );
}
