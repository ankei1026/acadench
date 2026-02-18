import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { columns } from './column/parent-column';
import { DataTable } from '../../Components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, RefreshCw, UserPlus, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Parents',
        href: '/admin/parents',
    },
];

interface ParentProps {
    parents: Array<{
        id: string;
        name: string;
        email: string;
        created_at?: string;
        status?: string;
    }>;
}

export default function Parents({ parents }: ParentProps) {
    // Calculate stats
    const totalParents = parents.length;
    const activeParents = parents.filter((p) => p.status === 'active' || !p.status).length;
    const newThisMonth = parents.filter((p) => {
        if (!p.created_at) return false;
        const date = new Date(p.created_at);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parents" />
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
                                    Parents
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Manage and view all parents in the system</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Total Parents</p>
                                <p className="text-2xl font-bold text-gray-900">{totalParents}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">New This Month</p>
                                <p className="text-2xl font-bold text-gray-900">{newThisMonth}</p>
                            </div>
                            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-2.5">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="p-6">
                        <DataTable
                            columns={columns}
                            data={parents}
                            searchKey="Name"
                            title="Parents List"
                            description="View and manage all registered parents"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
