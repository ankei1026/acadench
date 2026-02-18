import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { GraduationCap, Plus, Cake, User, BookOpen, Award, ArrowRight, Trash2, Eye, Pencil } from 'lucide-react';

type Learner = {
    id: string;
    learner_id: string;
    name: string;
    nickname?: string | null;
    display_name: string;
    photo?: string | null;
    date_of_birth?: string | null;
    age?: number | null;
    gender?: string | null;
    school_level?: string | null;
    school_name?: string | null;
    is_special_child?: boolean | null;
    created_at?: string | null;
};

type LearnerIndexProps = {
    learners: Learner[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Learners',
        href: '/parent/learners',
    },
];

const SCHOOL_LEVEL_LABELS: Record<string, string> = {
    'pre-school': 'Pre-School',
    'pre-kindergarten': 'Pre-Kindergarten',
    kindergarten: 'Kindergarten',
    elementary: 'Elementary',
};

export default function LearnerIndex({ learners }: LearnerIndexProps) {
    const handleDelete = (learner: Learner) => {
        router.delete(`/parent/learner/${learner.learner_id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Learner deleted', {
                    description: `${learner.display_name} has been removed.`,
                    duration: 5000,
                });
            },
            onError: () => {
                toast.error('Failed to delete learner', {
                    description: 'Please try again.',
                    duration: 5000,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Learners" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Learners
                                </h1>
                                <p className="text-gray-600">Manage your child profiles</p>
                            </div>
                        </div>
                        <Button asChild className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md md:mt-0">
                            <Link href="/parent/learner/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Learner
                            </Link>
                        </Button>
                    </div>
                </div>

                {learners.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center text-center">
                        You don't have any learner yet. <br className="mt-4" /> Click the button above to add a your learner.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {learners.map((learner) => (
                            <Card key={learner.id} className="overflow-hidden border border-gray-200 shadow-sm">
                                <CardHeader className="border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 overflow-hidden rounded-full border border-amber-200 bg-amber-50">
                                            {learner.photo ? (
                                                <img src={learner.photo} alt={learner.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500">
                                                    <span className="text-lg font-bold text-white">{learner.name?.charAt(0).toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-gray-900">{learner.display_name}</CardTitle>
                                            <CardDescription className="text-gray-600">Learner ID: {learner.learner_id}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="space-y-2 text-sm text-gray-700">
                                        {learner.date_of_birth && (
                                            <div className="flex items-center gap-2">
                                                <Cake className="h-4 w-4 text-amber-500" />
                                                <span>
                                                    {new Date(learner.date_of_birth).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                                {learner.age !== null && learner.age !== undefined && (
                                                    <Badge variant="outline" className="ml-2 border-amber-200 bg-amber-50 text-amber-700">
                                                        {learner.age} yrs old
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        {learner.gender && (
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-amber-500" />
                                                <span className="capitalize">{learner.gender}</span>
                                            </div>
                                        )}
                                        {learner.school_level && (
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-amber-500" />
                                                <span>{SCHOOL_LEVEL_LABELS[learner.school_level] ?? learner.school_level}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        {learner.is_special_child && (
                                            <Badge className="border-amber-200 bg-amber-100 text-amber-800">
                                                <Award className="mr-1 h-3 w-3" />
                                                Special Needs
                                            </Badge>
                                        )}
                                        {learner.school_name && (
                                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                                {learner.school_name}
                                            </Badge>
                                        )}
                                    </div>

                                    <CardFooter className="relative border-t border-gray-100 pt-4">
                                        <div className="flex w-full items-center justify-between">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="gap-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            >
                                                <Link href={`/parent/learner/${learner.learner_id}`}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Link>
                                            </Button>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    className="h-8 w-8 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Link href={`/parent/learner/${learner.learner_id}/edit`}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete learner profile?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently remove {learner.display_name} and all associated details. This
                                                                action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50">
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(learner)}
                                                                className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardFooter>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
