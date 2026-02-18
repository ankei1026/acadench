import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DataTable } from '../../Components/DataTable';
import { columns, type TutorApplication } from './column/tutor-application-column';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, RefreshCw, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutor Applications',
        href: '/admin/tutor-applications',
    },
];

interface TutorFilesProps {
    applications: TutorApplication[];
}

export default function TutorApplications({ applications = [] }: TutorFilesProps) {
    const handleRefresh = () => {
        router.reload({
            only: ['applications'],
            onSuccess: () => {
                toast.success('Applications refreshed', {
                    description: 'The list has been updated.',
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tutor Applications" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                                    Tutor Applications
                                </h1>
                            </div>
                            <p className="text-gray-600 ml-2">
                                Manage and review tutor applications
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                            <Badge
                                variant="outline"
                                className="border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700"
                            >
                                {applications.length} Total Applications
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Total Applications</p>
                                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700">Pending Review</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {applications.filter(app => app.status === 'pending').length}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 p-2.5">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {applications.filter(app => app.status === 'approved').length}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 p-2.5">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-rose-700">Rejected</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {applications.filter(app => app.status === 'rejected').length}
                                </p>
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
                            data={applications}
                            searchKey="full_name"
                            filterOptions={{
                                status: ['pending', 'approved', 'rejected'],
                            }}
                            title="Applications List"
                            description="View and manage all tutor applications"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
