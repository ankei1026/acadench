import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import {
    Calendar,
    CheckCircle,
    Clock,
    Sparkle,
    Star,
    Users,
} from 'lucide-react';
import HomeHeader from './Components/HomeHeader';

interface PricingTier {
    title: string;
    description: string;
    features: string[];
    price: string;
    frequency: string;
    duration: string;
    groupSize: string;
    sessions: string;
    highlight?: boolean;
}

interface ProgramSection {
    title: string;
    icon: React.ReactNode;
    description: string;
    tiers: PricingTier[];
}

export default function Prices() {
    const weekdayPrograms: ProgramSection = {
        title: 'WEEKDAY PROGRAMS',
        icon: <Calendar className="h-6 w-6" />,
        description: 'Structured academic support during weekdays',
        tiers: [
            {
                title: 'Afterschool Academic Tutorial',
                description:
                    'Comprehensive support for all subjects and assignments',
                features: [
                    'MON-FRI schedule flexibility',
                    'All Subjects coverage',
                    'Assignments & Review',
                    'Interactive discussions',
                ],
                price: '₱3,000',
                frequency: '20 sessions',
                duration: '2 months minimum',
                groupSize: '1-on-1',
                sessions: '2x, 3x or 4x per week',
            },
            {
                title: 'Reading-Writing Program',
                description:
                    'Fun learning through play and engaging activities',
                features: [
                    'Weekend focused learning',
                    'Play-based activities',
                    'Progress tracking',
                    'Creative exercises',
                ],
                price: '₱2,500',
                frequency: '20 sessions',
                duration: '2 months minimum',
                groupSize: '1-on-1',
                sessions: '3x per week, 1.5 hours',
            },
            {
                title: 'Special Tutorial',
                description:
                    'Specialized support for children with ADHD, ASD, or speech delay',
                features: [
                    'Special needs support',
                    'Individualized approach',
                    'Therapeutic activities',
                    'Progress monitoring',
                ],
                price: '₱3,500',
                frequency: '20 sessions',
                duration: '2 months minimum',
                groupSize: '1-on-1',
                sessions: '5x per week',
                highlight: true,
            },
        ],
    };

    const weekendPrograms: ProgramSection = {
        title: 'WEEKEND PROGRAMS',
        icon: <Star className="h-6 w-6" />,
        description: 'Engaging weekend learning experiences',
        tiers: [
            {
                title: 'Weekend Review',
                description:
                    'Comprehensive subject review and assignment assistance',
                features: [
                    'SAT & SUN availability',
                    'All subjects covered',
                    '2-hour sessions',
                    'Review & discussions',
                ],
                price: '₱2,500',
                frequency: '12 sessions',
                duration: '2 months minimum',
                groupSize: '1-on-1',
                sessions: 'Weekends only',
            },
            {
                title: 'Fun Learning Program (Ages 3-6)',
                description:
                    'Early childhood development through fun activities',
                features: [
                    'Reading & writing focus',
                    'Arts & crafts',
                    'Free snacks included',
                    'Small group setting',
                ],
                price: '₱1,600',
                frequency: '12 sessions',
                duration: '2 months minimum',
                groupSize: '6 students, 2 teachers',
                sessions: 'SAT & SUN, 1.5 hours',
            },
            {
                title: 'Fun Learning Program (Ages 7-10)',
                description: 'Language enhancement and practical math skills',
                features: [
                    'Language enhancement',
                    'Practical math skills',
                    'Arts integration',
                    'Free snacks included',
                ],
                price: '₱1,600',
                frequency: '12 sessions',
                duration: '2 months minimum',
                groupSize: '6 students, 2 teachers',
                sessions: 'SAT & SUN, 1.5 hours',
            },
        ],
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    const PricingCard = ({ tier }: { tier: PricingTier }) => (
        <div data-aos="fade-up"
            className="relative rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    {tier.title}
                </h3>
                <p className="text-gray-600">{tier.description}</p>
            </div>

            <div className="mb-6">
                <div className="mb-2 flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                        {tier.price}
                    </span>
                    <span className="ml-2 text-gray-500">
                        / {tier.frequency}
                    </span>
                </div>
                <p className="text-sm text-gray-500 italic">{tier.duration}</p>
            </div>

            <div className="mb-8 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4 text-yellow-600" />
                    <span className="font-medium">{tier.groupSize}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                    <span>{tier.sessions}</span>
                </div>
            </div>

            <ul className="mb-8 space-y-3">
                {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    const ProgramSection = ({ section }: { section: ProgramSection }) => (
        <section data-aos="fade-up" className="py-12 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-yellow-100 p-3">
                        {section.icon}
                    </div>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
                        {section.title}
                    </h2>
                    <p className="mx-auto max-w-3xl text-lg text-gray-600">
                        {section.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {section.tiers.map((tier, index) => (
                        <PricingCard key={index} tier={tier} />
                    ))}
                </div>
            </div>
        </section>
    );

    return (
        <>
            <Head title="Programs & Pricing" />

            <div className="min-h-screen bg-gradient-to-b from-[#FCF8F1] to-yellow-50">
                <HomeHeader />

                <section className="relative overflow-hidden bg-[#FCF8F1] pt-24 pb-20 lg:pt-32 ">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-yellow-200/20 blur-3xl" />
                        <div className="absolute top-40 -left-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
                        <div className="absolute right-1/4 bottom-40 h-64 w-64 rounded-full bg-pink-200/20 blur-3xl" />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="mb-6 inline-flex items-center rounded-full bg-gradient-to-b from-yellow-500 to-yellow-200 px-4 py-2"
                            >
                                <Sparkle className="mr-2 h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-semibold text-black">
                                    Transforming Education
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl"
                            >
                                <span className="bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                                    ACADENCH + SORAYA
                                </span>
                                <br />
                                <span className="text-gray-800">
                                    Learning Programs
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mx-auto mb-10 max-w-3xl text-xl text-gray-600"
                            >
                                Discover our comprehensive educational programs
                                designed to nurture young minds through
                                personalized learning experiences and expert
                                guidance.
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* Weekday Programs */}
                <ProgramSection section={weekdayPrograms} />

                {/* Divider */}
                <div className="relative py-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-yellow-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gradient-to-b from-[#FCF8F1] to-yellow-50 px-6 text-lg font-semibold text-yellow-700">
                            And More Programs
                        </span>
                    </div>
                </div>

                {/* Weekend Programs */}
                <ProgramSection section={weekendPrograms} />
            </div>
        </>
    );
}
