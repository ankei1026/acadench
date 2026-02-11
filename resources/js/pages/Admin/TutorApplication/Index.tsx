import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DataTable } from '../../Components/DataTable';
import { columns, type TutorApplication } from './column/tutor-application-column';

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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tutor Applications" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Tutor Applications</h1>
                        <p className="text-muted-foreground">
                            Manage and review tutor applications
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl bg-[#FFFFFF] shadow-md">
                    <div className="m-4">
                        <DataTable
                            columns={columns}
                            data={applications}
                            searchKey="full_name"
                            filterOptions={{
                                status: ['pending', 'approved', 'rejected'],
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
