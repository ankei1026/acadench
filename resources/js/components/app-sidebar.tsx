'use client';

import * as React from 'react';
import { usePage } from '@inertiajs/react';
import { LayoutGrid, DollarSign as DollarSignIcon, Users, BookOpen, File, Book, Pen, User2, Home, Wallet, BookOpenCheck, BrainCircuitIcon, LineChart, LineChartIcon, LineSquiggleIcon, LucideCornerUpLeft, LucideCornerUpRight, ArrowUp01, ArrowUpCircle, TrendingUp } from 'lucide-react';

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
        title: 'Programs',
        icon: BrainCircuitIcon,
        items: [
            { title: 'All Programs', href: '/admin/programs' },
            { title: 'Create Program', href: '/admin/programs/create' },
        ]
    },
    {
        title: 'Revenue',
        href: '/admin/revenue',
        icon: TrendingUp,
    },
    {
        title: 'Parents',
        href: '/admin/parents',
        icon: Users,
    },
    {
        title: 'Learners',
        href: '/admin/learners',
        icon: BookOpen,
    },
    {
        title: 'Tutors',
        href: '/admin/tutors',
        icon: Users,
    },
    {
        title: 'Tutor Applications',
        href: '/admin/tutor-applications',
        icon: File,
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
            { title: 'Learner Profiles', href: '/parent/learner/profiles' },
            { title: 'Create Learner', href: '/parent/learner/create' },
        ],
    },
    {
        title: 'Book Tutor',
        href: '/parent/book-tutor',
        icon: Book,
    },
    {
        title: 'Lectures',
        href: '/parent/lectures',
        icon: Pen,
    },
    {
        title: 'Request Refund',
        href: '/parent/request-refund',
        icon: Wallet,
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
