import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { columns } from './column/learner-column';
import { DataTable } from '../../Components/DataTable';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface Learner {
    learner_id: string;
    name: string;
    nickname: string | null;
    parent_id: string;
    photo: string | null;
    date_of_birth: string | null;
    gender: string | null;
    allergies: string | null;
    medical_condition: string | null;
    religion: string | null;
    school_level: string | null;
    is_special_child: boolean;
    school_name: string | null;
    father_name: string | null;
    mother_name: string | null;
    guardian_name: string | null;
    emergency_contact_primary: string | null;
    emergency_contact_secondary: string | null;
    special_request: string | null;
    parent?: {
        id: string;
        name: string;
        email: string;
    };
    created_at?: string;
    updated_at?: string;
}

interface PageProps {
    learners: Learner[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Learners',
        href: '/admin/learners',
    },
];

export default function Learners() {
    const pageProps = usePage().props as unknown as PageProps;
    const { learners } = pageProps;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Learners" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Learners
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">View and manage all learners</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">Total Learners</p>
                        <p className="text-2xl font-bold text-amber-700">{learners.length}</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">Special Needs</p>
                        <p className="text-2xl font-bold text-amber-700">
                            {learners.filter(l => l.is_special_child).length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">With Special Requests</p>
                        <p className="text-2xl font-bold text-amber-700">
                            {learners.filter(l => l.special_request).length}
                        </p>
                    </div>
                </div>

                {/* Data Table */}
                <div className="rounded-xl border border-amber-100 bg-white">
                    <div className="p-6">
                        <DataTable
                            columns={columns}
                            data={learners}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
