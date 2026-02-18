import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Video, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutor',
        href: '/tutor/dashboard',
    },
];

export default function TutorDashboard() {
    const menuItems = [
        {
            title: 'My Bookings',
            description: 'View your assigned student bookings',
            href: '/tutor/bookings',
            icon: BookOpen,
            color: 'from-amber-500 to-orange-500',
        },
        {
            title: 'My Lectures',
            description: 'View your online class lectures and meeting links',
            href: '/tutor/lectures',
            icon: Video,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'My Profile',
            description: 'View and edit your tutor profile',
            href: '/tutor/profile',
            icon: User,
            color: 'from-green-500 to-emerald-500',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tutor Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Tutor Dashboard
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">
                                Welcome to your tutor portal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Card className="border-amber-200 bg-white shadow-md hover:shadow-lg transition-all cursor-pointer h-full">
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className={`rounded-full bg-gradient-to-r ${item.color} p-4 mb-4`}>
                                        <item.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                                    <div className={`flex items-center gap-1 text-sm font-medium text-amber-600`}>
                                        Go to {item.title} <ArrowRight className="h-4 w-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
