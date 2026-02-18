import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function AddTutorDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        subject: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        router.post('/admin/tutors/store', formData, {
            onSuccess: () => {
                toast.success('Tutor created successfully!');
                setIsOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    subject: '',
                });
                setErrors({});
            },
            onError: (errors) => {
                toast.error(
                    'Failed to create tutor. Please check the form and try again.',
                );
                setErrors(errors as Record<string, string>);
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button className="gap-1">
                    <Plus className="h-2 w-2" />
                    Add Tutor
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add New Tutor</AlertDialogTitle>
                    <AlertDialogDescription>
                        Fill in the tutor information to create a new tutor
                        account.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* subject */}
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            name="subject"
                            type="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Enter subject address"
                            disabled={isLoading}
                        />
                        {errors.subject && (
                            <p className="text-sm text-red-600">
                                {errors.subject}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <AlertDialogCancel disabled={isLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            asChild
                            onClick={(e) => {
                                e.preventDefault();
                                handleSubmit(e as any);
                            }}
                        >
                            <Button disabled={isLoading}>
                                {isLoading ? 'Adding...' : 'Add Tutor'}
                            </Button>
                        </AlertDialogAction>
                    </div>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
