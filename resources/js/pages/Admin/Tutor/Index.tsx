import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DataTable } from '../../Components/DataTable';
import { columns } from './column/tutor-column';
import { AddTutorDialog } from '../../Components/AddTutorDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, RefreshCw, GraduationCap, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutors',
        href: '/admin/tutors',
    },
];

interface TutorProps {
    tutors: Array<{
        user?: [name: string, email: string];
        tutor_id?: string;
        subject?: string;
        photo?: string;
        rate_per_hour?: string;
        status?: string;
    }>;
}

export default function Tutor({ tutors }: TutorProps) {
    // Calculate stats
    const totalTutors = tutors.length;
    const activeTutors = tutors.filter((t) => t.status === 'active').length;
    const inactiveTutors = tutors.filter((t) => t.status === 'inactive').length;
    const pendingTutors = tutors.filter((t) => t.status === 'pending').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tutors" />
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
                                    Tutors
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Manage and view all tutors in the system</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Total Tutors</p>
                                <p className="text-2xl font-bold text-gray-900">{totalTutors}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Active</p>
                                <p className="text-2xl font-bold text-gray-900">{activeTutors}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 p-2.5">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-rose-700">Inactive</p>
                                <p className="text-2xl font-bold text-gray-900">{inactiveTutors}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-rose-500 to-red-500 p-2.5">
                                <XCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="p-6">
                        <DataTable
                            columns={columns}
                            data={tutors}
                            searchKey="Name"
                            title="Tutors List"
                            description="View and manage all registered tutors"
                            filterOptions={{
                                status: ['active', 'inactive', 'pending'],
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
