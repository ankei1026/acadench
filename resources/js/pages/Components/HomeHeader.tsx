import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function HomeHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { url } = usePage();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuItems = [
        { label: 'Home', href: '/' },
        { label: 'Soraya Learning Hub', href: '/soraya-learning-hub' },
        { label: 'Prices', href: '/prices' },
        { label: 'Tutor Application', href: '/tutor-application' },
        { label: 'Developers', href: '/developers' },
    ];

    return (
        <>
            {/* Header */}
            <header className="bg-opacity-30 bg-[#FCF8F1]">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between lg:h-20">

                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <img
                                src="/assets/Logo2.png"
                                alt="AcadEnch Logo"
                                className="h-14 w-16"
                            />
                            <h1 className="text-2xl font-bold text-yellow-700">
                                ACADENCH
                            </h1>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={toggleMenu}
                            className="inline-flex rounded-md p-2 text-black transition-all duration-200 hover:bg-gray-100 focus:bg-gray-100 lg:hidden"
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {isMenuOpen ? (
                                <svg
                                    className="h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 8h16M4 16h16"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex lg:items-center lg:space-x-9">
                            {menuItems.map((item) => {
                                const isActive = url === item.href;

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`text-base transition-all duration-200 ${
                                            isActive
                                                ? 'font-bold text-yellow-700'
                                                : 'text-black hover:text-opacity-80'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* CTA Button */}
                        <Link
                            href="/signup"
                            className="hidden rounded-full bg-black px-5 py-2.5 text-base font-semibold text-white transition-all duration-200 hover:bg-yellow-300 hover:text-black focus:bg-yellow-300 focus:text-black lg:inline-flex"
                        >
                            Join Now
                        </Link>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMenuOpen && (
                        <div className="lg:hidden">
                            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                                {menuItems.map((item) => {
                                    const isActive = url === item.href;

                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`block rounded-md px-3 py-2 text-base transition-all duration-200 ${
                                                isActive
                                                    ? 'font-bold text-yellow-700 bg-yellow-50'
                                                    : 'text-black hover:text-opacity-80'
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}

                                <Link
                                    href="/signup"
                                    className="mt-4 block w-full rounded-md bg-black px-3 py-2 text-center text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800"
                                >
                                    Join Now
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}
