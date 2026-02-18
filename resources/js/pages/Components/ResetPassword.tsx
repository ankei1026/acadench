'use client';

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router, usePage } from '@inertiajs/react';
import { Key, Eye, EyeOff, Shield, Lock, AlertCircle, UserCog, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ResetPasswordDialogProps {
    userId?: string | number;
    userName?: string;
    userEmail?: string;
    trigger?: React.ReactNode;
    type?: 'self' | 'admin'; // Optional now, will auto-detect if not provided
}

export function ResetPasswordDialog({ userId, userName, userEmail, trigger, type: propType }: ResetPasswordDialogProps) {
    const { auth } = usePage().props as any;
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-detect the reset type
    const resetType = (() => {
        // If type is explicitly provided, use that
        if (propType) return propType;

        // If no userId, it's self reset (user's own profile)
        if (!userId) return 'self';

        // If userId matches current authenticated user, it's self reset
        if (auth?.user?.id && Number(userId) === Number(auth.user.id)) {
            return 'self';
        }

        // Otherwise it's admin reset
        return 'admin';
    })();

    const isAdminReset = resetType === 'admin';
    const isSelfReset = resetType === 'self';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const endpoint = isSelfReset ? '/password/update' : `/admin/users/${userId}/reset-password`;

        const payload = isSelfReset ? formData : { password: formData.password, password_confirmation: formData.password_confirmation };

        router.patch(endpoint, payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = (page.props as any).flash || {};

                if (flash.success) {
                    toast.success(flash.success);
                } else {
                    const title = isSelfReset ? 'Password updated successfully!' : 'Password reset successfully!';

                    toast.success(title);
                }

                setIsOpen(false);
                setFormData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
                setErrors({});
            },
            onError: (errors) => {
                setErrors(errors as Record<string, string>);

                if (typeof errors === 'object' && (errors as any).error) {
                    toast.error((errors as any).error);
                } else {
                    toast.error(isSelfReset ? 'Failed to update password' : 'Failed to reset password');
                }
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const validatePassword = (password: string) => {
        return {
            hasMinLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
    };

    const passwordValidation = validatePassword(formData.password);
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    const doPasswordsMatch = formData.password === formData.password_confirmation && formData.password !== '';

    const getDialogTitle = () => {
        if (isSelfReset) {
            return 'Change Your Password';
        } else {
            return 'Reset User Password';
        }
    };

    const getDialogDescription = () => {
        if (isSelfReset) {
            return 'Enter your current password and choose a new password.';
        } else {
            return userName && userEmail ? `You are resetting the password for ${userName}` : 'Enter a new password for this account.';
        }
    };

    const getIcon = () => {
        if (isSelfReset) {
            return User;
        } else {
            return UserCog;
        }
    };

    const Icon = getIcon();

    // Get display name for the user
    const displayName = isSelfReset ? auth?.user?.name || 'Your' : userName || 'User';

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {trigger || (
                    <Button
                        variant={isSelfReset ? 'default' : 'outline'}
                        size="sm"
                        className={
                            isSelfReset
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                                : 'border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                        }
                    >
                        <Key className="mr-2 h-4 w-4" />
                        {isSelfReset ? 'Change Password' : 'Reset Password'}
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-amber-200">
                <AlertDialogHeader>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-2.5 shadow-md">
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                        <AlertDialogTitle className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-2xl font-bold text-transparent">
                            {getDialogTitle()}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-gray-600">
                        {getDialogDescription()}

                        {/* Admin Reset - Show target user info */}
                        {isAdminReset && userName && userEmail && (
                            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <div className="flex flex-col items-start gap-2">
                                    <Badge variant="outline" className="border-amber-300 bg-white text-amber-700">
                                        Admin Action
                                    </Badge>
                                    <span className="text-xs text-gray-600">You are resetting password for:</span>
                                </div>
                                <p className="mt-2 font-semibold text-gray-900">{userName}</p>
                                <p className="text-sm text-gray-600">{userEmail}</p>
                            </div>
                        )}

                        {/* Self Reset - Show current user info */}
                        {isSelfReset && auth?.user && (
                            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-amber-300 bg-white text-amber-700">
                                        Your Account
                                    </Badge>
                                    <span className="text-xs text-gray-600">You are changing your own password</span>
                                </div>
                                <p className="mt-2 font-semibold text-gray-900">{auth.user.name}</p>
                                <p className="text-sm text-gray-600">{auth.user.email}</p>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    {/* Current Password - Only for self reset */}
                    {isSelfReset && (
                        <div className="space-y-2">
                            <Label htmlFor="current_password" className="text-sm font-semibold text-gray-700">
                                Current Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                                <Input
                                    id="current_password"
                                    name="current_password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    placeholder="Enter your current password"
                                    disabled={isLoading}
                                    className={`border-gray-200 pr-10 pl-10 transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                        errors.current_password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.current_password && <p className="text-sm text-red-600">{errors.current_password}</p>}
                        </div>
                    )}

                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                            {isSelfReset ? 'New Password' : 'New Password'} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={isSelfReset ? 'Enter your new password' : 'Enter new password'}
                                disabled={isLoading}
                                className={`border-gray-200 pr-10 pl-10 transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <p className="text-xs font-medium text-gray-700">Password requirements:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={`h-1.5 w-1.5 rounded-full ${passwordValidation.hasMinLength ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        />
                                        <span className={`text-xs ${passwordValidation.hasMinLength ? 'text-emerald-700' : 'text-gray-500'}`}>
                                            8+ characters
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={`h-1.5 w-1.5 rounded-full ${passwordValidation.hasUpperCase ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        />
                                        <span className={`text-xs ${passwordValidation.hasUpperCase ? 'text-emerald-700' : 'text-gray-500'}`}>
                                            Uppercase
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={`h-1.5 w-1.5 rounded-full ${passwordValidation.hasLowerCase ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        />
                                        <span className={`text-xs ${passwordValidation.hasLowerCase ? 'text-emerald-700' : 'text-gray-500'}`}>
                                            Lowercase
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className={`h-1.5 w-1.5 rounded-full ${passwordValidation.hasNumber ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        />
                                        <span className={`text-xs ${passwordValidation.hasNumber ? 'text-emerald-700' : 'text-gray-500'}`}>
                                            Number
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-1.5">
                                        <div
                                            className={`h-1.5 w-1.5 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        />
                                        <span className={`text-xs ${passwordValidation.hasSpecialChar ? 'text-emerald-700' : 'text-gray-500'}`}>
                                            Special character (!@#$%^&*)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">
                            Confirm New Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-amber-500" />
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                                disabled={isLoading}
                                className={`border-gray-200 pr-10 pl-10 transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 ${
                                    errors.password_confirmation ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                                }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {/* Password Match Indicator */}
                        {formData.password_confirmation && (
                            <div className="mt-1 flex items-center gap-1.5">
                                <div className={`h-1.5 w-1.5 rounded-full ${doPasswordsMatch ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span className={`text-xs ${doPasswordsMatch ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                </span>
                            </div>
                        )}

                        {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
                    </div>

                    <AlertDialogFooter className="gap-2 pt-2">
                        <AlertDialogCancel
                            disabled={isLoading}
                            className="border-gray-200 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            asChild
                            onClick={(e) => {
                                e.preventDefault();
                                handleSubmit(e as any);
                            }}
                        >
                            <Button
                                disabled={isLoading || !isPasswordValid || !doPasswordsMatch || (isSelfReset && !formData.current_password)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transition-all duration-200 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="mr-2">{isSelfReset ? 'Updating...' : 'Resetting...'}</span>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    </>
                                ) : (
                                    <>
                                        <Key className="mr-2 h-4 w-4" />
                                        {isSelfReset ? 'Update Password' : 'Reset Password'}
                                    </>
                                )}
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
