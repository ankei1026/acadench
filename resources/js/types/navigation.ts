import type { LucideIcon } from 'lucide-react';

export type NavItem = {
    title: string;
    href?: string;
    icon?: LucideIcon;
    items?: Array<{
        title: string;
        href: string;
    }>;
};
