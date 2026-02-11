import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutor Application',
        href: '/admin/tutor-applications/show/:id',
    },
];

export default function TutorApplications() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tutor Applications" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Tutor Applications
                    </h1>
                </div>
            </div>
        </AppLayout>
    );
}
