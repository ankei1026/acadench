export * from './auth';
export * from './navigation';

import type { Auth } from './auth';

export type BreadcrumbItem = {
    title: string;
    href?: string;
};

export type SharedData = {
    name: string;
    auth: Auth;
    [key: string]: unknown;
};
