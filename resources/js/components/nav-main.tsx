'use client';

import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';

interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
        title: string;
        href: string;
    }[];
}

function NavItemWithSubmenu({ item }: { item: NavItem }) {
    return (
        <Collapsible asChild defaultOpen={item.isActive} className="group/collapsible">
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronDown className="ml-auto" />
                </SidebarMenuButton>

                <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                                <a href={subItem.href}>
                                    <span>{subItem.title}</span>
                                </a>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
            </SidebarMenuItem>
        </Collapsible>
    );
}

function NavItemSimple({ item }: { item: NavItem }) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.href}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </a>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function NavMain({ items }: { items: NavItem[] }) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;

                    if (hasSubItems) {
                        return <NavItemWithSubmenu key={item.title} item={item} />;
                    }

                    return <NavItemSimple key={item.title} item={item} />;
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
