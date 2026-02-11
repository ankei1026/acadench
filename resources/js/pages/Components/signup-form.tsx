import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const { data, setData, processing, errors, reset, post } = useForm({
        name: '',
        email: '',
        role: 'parent',
        password: '',
        confirm_password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // IMPORTANT: Add this check for password confirmation
        if (data.password !== data.confirm_password) {
            // You could set an error state here or use a validation library
            errors.confirm_password = 'Passwords do not match';
            return;
        }

        post('/signup-store', {
            onSuccess: () => {
                toast.success('Signup successful! Welcome to AcadEnch.');
            },
            onFinish: () => reset('password', 'confirm_password'),
        });
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader>
                    <center>
                        <img
                            src="/assets/Logo.png"
                            alt="AcadEnch Logo"
                            className="h-24 w-36"
                        />
                    </center>
                    <CardTitle>Signup to your account</CardTitle>
                    <CardDescription>
                        Signup your account as a parent below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Fullname</FieldLabel>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Jane Doe"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirm_password">
                                    Confirm Password
                                </FieldLabel>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={data.confirm_password}
                                    onChange={(e) =>
                                        setData(
                                            'confirm_password',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {errors.confirm_password && (
                                    <p className="text-sm text-red-500">
                                        {errors.confirm_password}
                                    </p>
                                )}
                            </Field>
                            <Field>
                                <Button
                                    className="w-full bg-yellow-300 text-black hover:cursor-pointer hover:bg-yellow-400"
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? 'Signing up...' : 'Signup'}
                                </Button>
                                <FieldDescription className="text-center">
                                    Already have an account?{' '}
                                    <Link href="/login">
                                        Login
                                    </Link>
                                </FieldDescription>
                                <FieldDescription className="text-center">
                                    Go to{' '}
                                    <Link href="/">
                                        Home
                                    </Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
