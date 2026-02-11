import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import HomeHeader from './Components/HomeHeader';

export default function Home() {
    return (
        <>
            <Head title="Home" />
            <HomeHeader />
            {/* Hero Section */}
            <section className="bg-opacity-30 bg-[#FCF8F1] py-10 sm:py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        {/* Hero Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="font-nunito"
                        >
                            <p className="text-base font-semibold tracking-wider text-blue-600 uppercase">
                                A key to learn for learners
                            </p>
                            <h1 className="mt-4 text-4xl font-bold text-black sm:text-6xl lg:mt-8 xl:text-8xl">
                                Connect & learn from the tutors
                            </h1>
                            <p className="mt-4 text-base text-black sm:text-xl lg:mt-8">
                                In partner with{' '}
                                <a href="soraya-learning-hub" target="blank">
                                    <span className="text-blue-600 hover:underline">
                                        Soraya Learning Hub
                                    </span>
                                </a>
                            </p>

                            {/* CTA Button */}
                            <Link
                                href="/signup"
                                className="group mt-8 inline-flex items-center rounded-full bg-yellow-300 px-6 py-4 font-semibold text-black transition-all duration-200 hover:bg-yellow-400 focus:bg-yellow-400 lg:mt-16"
                                role="button"
                            >
                                Join for free
                                <svg
                                    className="-mr-2 ml-8 h-6 w-6 transition-transform duration-200 group-hover:translate-x-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </Link>

                            {/* Login Link */}
                            <p className="mt-5 text-gray-600">
                                Already joined us?{' '}
                                <Link
                                    href="/login"
                                    className="text-black transition-all duration-200 hover:underline"
                                >
                                    Log in
                                </Link>
                            </p>
                        </motion.div>

                        {/* Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="rounded-md shadow-lg"
                        >
                            <img
                                src="/assets/imghero1.png"
                                className="w-full rounded-md"
                                alt="People collaborating and learning"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    );
}
