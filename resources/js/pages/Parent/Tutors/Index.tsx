import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Users, Star, DollarSign, BookOpen, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

interface Tutor {
    tutor_id: string;
    name: string;
    email: string | null;
    subject: string | null;
    bio: string | null;
    photo: string | null;
    specializations: string[];
    portfolio_link: string | null;
    number: string | null;
}

interface TutorsPageProps {
    tutors: Tutor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutors',
        href: '/parent/tutors',
    },
];

const ITEMS_PER_PAGE = 6;

export default function Tutors({ tutors }: TutorsPageProps) {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination
    const totalPages = Math.ceil(tutors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTutors = tutors.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of tutors grid
        document.getElementById('tutors-grid')?.scrollIntoView({ behavior: 'smooth' });
    };

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
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Available Tutors
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Browse and connect with our qualified tutors</p>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-700">Total Tutors</p>
                            <p className="text-2xl font-bold text-gray-900">{tutors.length}</p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* Tutors Grid */}
                {tutors.length > 0 ? (
                    <>
                        <div id="tutors-grid" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {currentTutors.map((tutor) => (
                                <Card key={tutor.tutor_id} className="border-amber-200 bg-white shadow-md transition-all hover:shadow-lg">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={tutor.photo || undefined} alt={tutor.name} />
                                                <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                                    {tutor.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="mt-2">
                                            <CardTitle className="text-lg font-semibold text-gray-900">{tutor.name}</CardTitle>
                                            {tutor.subject && <p className="text-sm font-medium text-amber-600">{tutor.subject}</p>}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Bio */}
                                        {tutor.bio && (
                                            <p className="line-clamp-3 text-sm text-gray-600">{tutor.bio}</p>
                                        )}

                                        {/* Specializations */}
                                        {tutor.specializations && tutor.specializations.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-gray-700">Specializations:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {tutor.specializations.slice(0, 3).map((spec, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                                                        >
                                                            {spec}
                                                        </span>
                                                    ))}
                                                    {tutor.specializations.length > 3 && (
                                                        <span className="inline-flex items-center text-xs text-gray-600">
                                                            +{tutor.specializations.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Info */}
                                        <div className="space-y-2 border-t border-gray-200 pt-3">
                                            {tutor.email && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="truncate text-gray-600">{tutor.email}</span>
                                                </div>
                                            )}
                                            {tutor.number && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">{tutor.number}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* View Profile Button */}
                                        <Link href={`/parent/tutors/${tutor.tutor_id}`} className="block">
                                            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                                                View Profile
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between border-t border-amber-200 pt-6">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(endIndex, tutors.length)}</span> of{' '}
                                    <span className="font-medium">{tutors.length}</span> tutors
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Show pages around current page
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => goToPage(pageNum)}
                                                    className={
                                                        currentPage === pageNum
                                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                            : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                                    }
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
                                    >
                                        Next
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/50 p-12">
                        <div className="rounded-full bg-amber-100 p-4">
                            <Users className="h-8 w-8 text-amber-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Tutors Available</h3>
                        <p className="mt-2 text-center text-gray-600">Check back soon for available tutors.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
