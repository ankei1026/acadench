"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ReceiptData {
    receipt_id: string;
    book_id: string;
    amount: number;
    payment_type: string;
    paymentType?: {
        name: string;
    };
    receipt_image?: string | null;
    booking?: {
        book_id: string;
    };
    created_at: string;
}

export const columns: ColumnDef<ReceiptData>[] = [
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return date.toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        },
    },
    {
        accessorKey: "receipt_id",
        header: "Receipt ID",
        cell: ({ row }) => (
            <span className="font-mono text-xs">{row.getValue("receipt_id")}</span>
        ),
    },
    {
        accessorKey: "paymentType",
        header: "Payment Type",
        cell: ({ row }) => {
            const paymentType = row.getValue("paymentType") as { name: string } | null;
            return (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                    {paymentType?.name || row.getValue("payment_type")}
                </Badge>
            );
        },
    },
    {
        accessorKey: "book_id",
        header: "Payment For",
        cell: ({ row }) => (
            <span className="font-mono text-xs">{row.getValue("book_id")}</span>
        ),
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            return (
                <span className="font-semibold text-amber-700">
                    {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                    }).format(amount)}
                </span>
            );
        },
    },
    {
        accessorKey: "receipt_image",
        header: "Receipt",
        cell: ({ row }) => {
            const imageUrl = row.original.receipt_image;
            const [dialogOpen, setDialogOpen] = useState(false);

            if (imageUrl) {
                return (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <button className="inline-flex items-center justify-center rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200 transition-colors">
                                <Receipt className="mr-1.5 h-3.5 w-3.5" />
                                View
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
                            <DialogHeader>
                                <DialogTitle>Receipt Image</DialogTitle>
                                <DialogDescription>
                                    Receipt for Booking: {row.original.book_id}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center mt-4">
                                <img
                                    src={imageUrl}
                                    alt="Receipt"
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg border"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            }
            return <span className="text-gray-400 text-xs">No image</span>;
        },
    },
];
