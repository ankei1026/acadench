'use client';

import * as React from 'react';
import { usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    DollarSign as DollarSignIcon,
    Users,
    BookOpen,
    File,
    Book,
    Pen,
    User2,
    Home,
    Wallet,
    BookOpenCheck,
    BrainCircuitIcon,
    LineChart,
    LineChartIcon,
    LineSquiggleIcon,
    LucideCornerUpLeft,
    LucideCornerUpRight,
    ArrowUp01,
    ArrowUpCircle,
    TrendingUp,
    BookImageIcon,
    BookAlert,
    CreditCard,
    Video,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import type { NavItem, SharedData } from '@/types';

const adminMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Bookings',
        href: '/admin/bookings',
        icon: BookAlert,
    },
    {
        title: 'Lectures',
        href: '/admin/lectures',
        icon: Video,
    },
    {
        title: 'Revenue',
        icon: TrendingUp,
        items: [
            { title: 'Revenue Overview', href: '/admin/revenue' },
            { title: 'Refund Requests', href: '/admin/refund-requests' },
            { title: 'Payment Types', href: '/admin/payment-setup' },
        ],
    },
    {
        title: 'Programs',
        icon: BrainCircuitIcon,
        items: [
            { title: 'All Programs', href: '/admin/programs' },
            { title: 'Create Program', href: '/admin/programs/create' },
        ],
    },
    {
        title: 'Parents',
        icon: Users,
        items: [
            { title: 'All Parents', href: '/admin/parents' },
            { title: 'Learners', href: '/admin/learners' },
        ],
    },
    {
        title: 'Tutors',
        icon: Users,
        items: [
            { title: 'All Tutors', href: '/admin/tutors' },
            { title: 'Create Tutor', href: '/admin/tutors/create' },
            { title: 'Tutor Applications', href: '/admin/tutor-applications' },
        ],
    },
];

const tutorMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/tutor/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Bookings',
        href: '/tutor/bookings',
        icon: Book,
    },
    {
        title: 'Lectures',
        href: '/tutor/lectures',
        icon: Pen,
    },
    {
        title: 'Tutor Profile',
        href: '/tutor/profile',
        icon: User2,
    },
];

const parentMainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/parent/home',
        icon: Home,
    },
    {
        title: 'Learner',
        href: '/parent/learner',
        icon: BookOpenCheck,
        items: [
            { title: 'Learner Profiles', href: '/parent/learners' },
            { title: 'Create Learner', href: '/parent/learner/create' },
        ],
    },
    {
        title: 'Tutors',
        href: '/parent/tutors',
        icon: BookOpenCheck,
    },
    {
        title: 'Book Program',
        icon: Book,
        items: [
            { title: 'Book a Program', href: '/parent/book-program' },
            { title: 'My Bookings', href: '/parent/book-program/bookings' },
        ],
    },
    {
        title: 'Lectures',
        href: '/parent/lectures',
        icon: Pen,
    },
    {
        title: 'Request Refund',
        icon: Wallet,
        items: [
            { title: 'Request Refund', href: '/parent/request-refund' },
            { title: 'My Requests', href: '/parent/my-refund-requests' },
        ],
    },
];

const roleNavMap: Record<string, NavItem[]> = {
    admin: adminMainNavItems,
    tutor: tutorMainNavItems,
    parent: parentMainNavItems,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<SharedData>().props;
    const role = String((auth?.user as any)?.role ?? 'parent').toLowerCase();
    const navItems = roleNavMap[role] ?? parentMainNavItems;

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="pointer-events-none">
                            <div className="flex items-center gap-2">
                                <AppLogo />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
