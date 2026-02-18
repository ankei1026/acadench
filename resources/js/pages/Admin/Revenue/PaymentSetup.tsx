import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, CreditCard, Edit, Trash2, Wallet, Building2, Phone, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';

interface PaymentType {
    id: number;
    name: string;
    account_number: string | null;
    account_name: string | null;
    instructions: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    paymentTypes: PaymentType[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Setup',
        href: '/admin/payment-setup',
    },
];

export default function PaymentSetup() {
    const pageProps = usePage().props as unknown as PageProps;
    const { paymentTypes } = pageProps;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPaymentType, setEditingPaymentType] = useState<PaymentType | null>(null);
    const [deletePaymentType, setDeletePaymentType] = useState<PaymentType | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        name: '',
        account_number: '',
        account_name: '',
        instructions: '',
        is_active: true,
    });

    useEffect(() => {
        if (editingPaymentType) {
            setData({
                name: editingPaymentType.name,
                account_number: editingPaymentType.account_number || '',
                account_name: editingPaymentType.account_name || '',
                instructions: editingPaymentType.instructions || '',
                is_active: editingPaymentType.is_active,
            });
        } else {
            reset();
        }
    }, [editingPaymentType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPaymentType) {
            put(`/admin/revenue/payment-types/${editingPaymentType.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingPaymentType(null);
                    reset();
                },
            });
        } else {
            post('/admin/revenue/payment-types', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (paymentType: PaymentType) => {
        setEditingPaymentType(paymentType);
        setIsDialogOpen(true);
    };

    const handleDelete = (e: React.FormEvent) => {
        if (deletePaymentType) {
            e.preventDefault();
            destroy(`/admin/revenue/payment-types/${deletePaymentType.id}`, {
                onSuccess: () => {
                    setDeletePaymentType(null);
                },
            });
        }
    };

    const getPaymentIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('cash')) return <Wallet className="h-5 w-5" />;
        if (lowerName.includes('bank')) return <Building2 className="h-5 w-5" />;
        if (lowerName.includes('gcash') || lowerName.includes('phone')) return <Phone className="h-5 w-5" />;
        return <CreditCard className="h-5 w-5" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Setup" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Hero Header */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-3 shadow-md">
                                    <Settings className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-3xl font-bold text-transparent">
                                    Payment Setup
                                </h1>
                            </div>
                            <p className="ml-2 text-gray-600">Manage payment methods for parents</p>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) {
                                setEditingPaymentType(null);
                                reset();
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Payment Type
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingPaymentType ? 'Edit Payment Type' : 'Add Payment Type'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingPaymentType
                                            ? 'Update the payment type details below.'
                                            : 'Add a new payment method that parents can use.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Payment Type Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g., Gcash, Bank Transfer, Cash"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="account_number">Account Number</Label>
                                            <Input
                                                id="account_number"
                                                placeholder="e.g., 09123456789 or 1234567890"
                                                value={data.account_number}
                                                onChange={(e) => setData('account_number', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="account_name">Account Name</Label>
                                            <Input
                                                id="account_name"
                                                placeholder="e.g., Juan Dela Cruz"
                                                value={data.account_name}
                                                onChange={(e) => setData('account_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="instructions">Instructions (Optional)</Label>
                                            <Textarea
                                                id="instructions"
                                                placeholder="Any special instructions for this payment method..."
                                                value={data.instructions}
                                                onChange={(e) => setData('instructions', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_active" className="text-base">
                                                    Active
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable this payment type for use
                                                </p>
                                            </div>
                                            <Switch
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={processing} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600">
                                            {editingPaymentType ? 'Update' : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Payment Types Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paymentTypes.map((paymentType) => (
                        <Card key={paymentType.id} className={!paymentType.is_active ? 'opacity-60' : ''}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
                                        {getPaymentIcon(paymentType.name)}
                                    </div>
                                    <CardTitle className="text-lg">{paymentType.name}</CardTitle>
                                </div>
                                {!paymentType.is_active && (
                                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                                        Inactive
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {paymentType.account_number && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{paymentType.account_number}</span>
                                        </div>
                                    )}
                                    {paymentType.account_name && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Name:</span>
                                            <span>{paymentType.account_name}</span>
                                        </div>
                                    )}
                                    {paymentType.instructions && (
                                        <div className="text-sm text-muted-foreground">
                                            <p className="line-clamp-2">{paymentType.instructions}</p>
                                        </div>
                                    )}
                                    {!paymentType.account_number && !paymentType.account_name && (
                                        <p className="text-sm text-muted-foreground">No account details set</p>
                                    )}
                                </div>
                            </CardContent>
                            <div className="flex gap-2 p-4 pt-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                    onClick={() => handleEdit(paymentType)}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <AlertDialog open={!!deletePaymentType} onOpenChange={(open) => !open && setDeletePaymentType(null)}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                            onClick={() => setDeletePaymentType(paymentType)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                                                Delete Payment Type
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete "{deletePaymentType?.name}"?
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="border-amber-200 text-amber-700 hover:bg-amber-50">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Card>
                    ))}
                </div>

                {paymentTypes.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <CreditCard className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">No payment types configured yet</p>
                            <Button className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600" onClick={() => setIsDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Payment Type
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
