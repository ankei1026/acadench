"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, User, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export interface Learner {
    learner_id: string;
    name: string;
    nickname: string | null;
    parent_id: string;
    photo: string | null;
    date_of_birth: string | null;
    gender: string | null;
    allergies: string | null;
    medical_condition: string | null;
    religion: string | null;
    school_level: string | null;
    is_special_child: boolean;
    school_name: string | null;
    father_name: string | null;
    mother_name: string | null;
    guardian_name: string | null;
    emergency_contact_primary: string | null;
    emergency_contact_secondary: string | null;
    special_request: string | null;
    parent?: {
        id: string;
        name: string;
        email: string;
    };
    created_at?: string;
    updated_at?: string;
}

export const columns: ColumnDef<Learner>[] = [
    {
        accessorKey: "learner_id",
        header: "Learner ID",
        cell: ({ row }) => (
            <span className="font-mono text-xs">{row.getValue("learner_id")}</span>
        ),
    },
    {
        accessorKey: "photo",
        header: "Photo",
        cell: ({ row }) => {
            const photo = row.getValue("photo") as string | null;
            // Use storage link if photo exists
            const photoUrl = photo ? `/storage/${photo}` : null;
            return (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 overflow-hidden">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt="Learner"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className="h-5 w-5 text-white" />
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            const nickname = row.getValue("nickname") as string | null;
            return (
                <div>
                    <p className="font-medium">{name}</p>
                    {nickname && <p className="text-xs text-muted-foreground">Nickname: {nickname}</p>}
                </div>
            );
        },
    },
    {
        accessorKey: "parent",
        header: "Parent",
        cell: ({ row }) => {
            const parent = row.getValue("parent") as { name: string } | null;
            return parent?.name || "-";
        },
    },
    {
        accessorKey: "special_request",
        header: "Special Request",
        cell: ({ row }) => {
            const specialRequest = row.getValue("special_request") as string | null;
            if (specialRequest) {
                return (
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                        Yes
                    </Badge>
                );
            }
            return <span className="text-muted-foreground">-</span>;
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const learner = row.original;
            return (
                <Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <DialogTrigger asChild>
                                    <button className="flex w-full items-center px-2 py-1.5 text-sm">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Full Details
                                    </button>
                                </DialogTrigger>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                                Learner Details
                            </DialogTitle>
                            <DialogDescription>
                                Complete information about {learner.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Basic Info */}
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 overflow-hidden flex items-center justify-center">
                                    {learner.photo ? (
                                        <img
                                            src={`/storage/${learner.photo}`}
                                            alt={learner.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-10 w-10 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{learner.name}</h3>
                                    {learner.nickname && (
                                        <p className="text-sm text-muted-foreground">Nickname: {learner.nickname}</p>
                                    )}
                                    <p className="text-sm font-mono text-muted-foreground">{learner.learner_id}</p>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="rounded-lg border p-4">
                                <h4 className="font-semibold text-amber-700 mb-3">Personal Information</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium">{learner.date_of_birth || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Gender</p>
                                        <p className="font-medium">{learner.gender || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Religion</p>
                                        <p className="font-medium">{learner.religion || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">School Level</p>
                                        <p className="font-medium">{learner.school_level || "-"}</p>
                                    </div>
                                    {learner.school_name && (
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground">School Name</p>
                                            <p className="font-medium">{learner.school_name}</p>
                                        </div>
                                    )}
                                    {learner.special_request && (
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground">Special Request</p>
                                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 mt-1">
                                                Yes
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Medical Info */}
                            <div className="rounded-lg border p-4">
                                <h4 className="font-semibold text-amber-700 mb-3">Medical Information</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Allergies</p>
                                        <p className="font-medium">{learner.allergies || "None"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Medical Conditions</p>
                                        <p className="font-medium">{learner.medical_condition || "None"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Family Info */}
                            <div className="rounded-lg border p-4">
                                <h4 className="font-semibold text-amber-700 mb-3">Family Information</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Father's Name</p>
                                        <p className="font-medium">{learner.father_name || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Mother's Name</p>
                                        <p className="font-medium">{learner.mother_name || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Guardian's Name</p>
                                        <p className="font-medium">{learner.guardian_name || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contacts */}
                            <div className="rounded-lg border p-4">
                                <h4 className="font-semibold text-amber-700 mb-3">Emergency Contacts</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Primary Contact</p>
                                        <p className="font-medium">{learner.emergency_contact_primary || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Secondary Contact</p>
                                        <p className="font-medium">{learner.emergency_contact_secondary || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Special Request Details */}
                            {learner.special_request && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <h4 className="font-semibold text-amber-700 mb-2">Special Request Details</h4>
                                    <p className="text-sm">{learner.special_request}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            );
        },
    },
];
