
import { Head } from '@inertiajs/react';
import { SignupForm } from '../Components/signup-form';

export default function Signup() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FCF8F1]/30 to-white">
            <Head title="Signup" />
            <div className="flex min-h-screen items-center justify-center">
                <div className="grid w-full grid-cols-1 lg:grid-cols-2">
                    {/* Left Side - Signup Form (50%) */}
                    <div className="flex items-center justify-center p-6 md:p-12 lg:p-14">
                        <div className="w-full max-w-md">
                            <SignupForm />
                        </div>
                    </div>

                    {/* Right Side - Branding / Visual (50%) */}
                    <div className="relative hidden overflow-hidden lg:flex">

                        {/* Pattern / glow */}
                        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-yellow-300/40 blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-yellow-200/60 blur-3xl" />

                        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-12 text-center">
                            <img
                                src="/assets/Logo.png"
                                alt="AcadEnch"
                                className="mb-8 h-24 w-auto"
                            />

                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                A Platform for Tutors & Learners
                            </h2>
                            <p className="mb-8 max-w-md text-lg text-gray-700">
                                AcadEnch connects expert tutors with motivated
                                learners through booking sessions to provide personalized
                                learning experiences.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
