import { Head } from '@inertiajs/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion, useInView } from 'framer-motion';
import { BookOpen, Heart, MapPin, Star, Target, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';
import HomeHeader from './Components/HomeHeader';

export default function SorayaLearningHub() {
    const missionRef = useRef(null);
    const valuesRef = useRef(null);
    const promiseRef = useRef(null);

    const isMissionInView = useInView(missionRef, {
        once: true,
        margin: '-100px',
    });
    const isValuesInView = useInView(valuesRef, {
        once: true,
        margin: '-100px',
    });
    const isPromiseInView = useInView(promiseRef, {
        once: true,
        margin: '-100px',
    });

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic',
        });
    }, []);

    const missionItems = [
        {
            id: 1,
            title: 'Personalized Learning',
            description:
                'Help children learn in an impactful way, through their individual learning pace.',
            icon: <Users className="h-8 w-8" />,
        },
        {
            id: 2,
            title: 'Parental Peace of Mind',
            description:
                "Give parents peace of mind on their child's academic support, creating more family bonding time.",
            icon: <Heart className="h-8 w-8" />,
        },
        {
            id: 3,
            title: 'Teacher Empowerment',
            description:
                'Help more teachers earn extra income by doing what they love—effective guided teaching.',
            icon: <BookOpen className="h-8 w-8" />,
        },
    ];

    const coreValues = [
        {
            id: 1,
            icon: '🌱',
            title: 'Personalized Growth',
            description:
                "Every child learns differently. We embrace each learner's unique pace and style.",
        },
        {
            id: 2,
            icon: '🤝',
            title: 'Nurturing Connection',
            description:
                'We build warm relationships with our tutees—helping them feel safe, confident, and excited to learn.',
        },
        {
            id: 3,
            icon: '🎨',
            title: 'Fun & Engaging Learning',
            description:
                'Kids learn best when they enjoy the process. Our activities are designed to be interactive and memorable.',
        },
        {
            id: 4,
            icon: '📘',
            title: 'Academic Foundation & Life Skills',
            description:
                'We focus on strong basics while guiding kids to develop patience, focus, responsibility, and confidence.',
        },
    ];

    const promises = [
        {
            id: 1,
            icon: <Heart className="h-6 w-6 text-pink-500" />,
            title: 'Gentle Teaching',
            description:
                'We guide every child with patience, kindness, and understanding.',
        },
        {
            id: 2,
            icon: <BookOpen className="h-6 w-6 text-blue-500" />,
            title: 'Meaningful Learning',
            description:
                "Fun, engaging lessons that match each child's pace and needs.",
        },
        {
            id: 3,
            icon: <Star className="h-6 w-6 text-yellow-500" />,
            title: 'Safe & Caring Space',
            description:
                'A calm, child-friendly environment where kids feel loved and confident.',
        },
        {
            id: 4,
            icon: <Users className="h-6 w-6 text-green-500" />,
            title: 'Open Communication',
            description:
                'We partner with parents through honest updates and clear support.',
        },
        {
            id: 5,
            icon: <Target className="h-6 w-6 text-purple-500" />,
            title: 'Real Growth',
            description:
                'We nurture both academic skills and emotional confidence.',
        },
    ];

    return (
        <>
            <Head title="Soraya Learning Hub" />
            <HomeHeader />

            <div className="min-h-screen bg-gradient-to-b from-[#FCF8F1] via-yellow-50 to-white">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
                    <div className="absolute inset-0 bg-gradient-to-b via-yellow-50 to-white" />

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="font-nunito mt-10 flex h-full flex-col items-start justify-start"
                            >
                                <p className="text-sm font-semibold tracking-widest text-blue-600 uppercase">
                                    Welcome to
                                </p>
                                <h1 className="mt-4 text-4xl leading-tight font-bold text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl">
                                    Soraya <br />
                                    <span className="text-yellow-600">
                                        Learning Hub
                                    </span>
                                </h1>
                                <p className="mt-6 text-2xl font-semibold text-gray-800">
                                    A PLACE WHERE FUN LEARNING BEGINS
                                </p>
                                <p className="mt-4 text-lg text-gray-600 sm:text-xl">
                                    Teaching with care, in every child's
                                    learning pace.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="relative"
                                data-aos="zoom-in"
                            >
                                <div className="relative transform overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                                    <img
                                        src="/assets/Soraya.jpg"
                                        alt="Soraya Learning Hub"
                                        className="h-[600px] w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Location Section */}
                <section className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            <div data-aos="fade-right">
                                <div className="relative overflow-hidden rounded-2xl shadow-xl">
                                    <img
                                        src="/assets/location.png"
                                        alt="Soraya Location Map"
                                        className="h-[400px] w-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
                                        <MapPin className="h-5 w-5 text-red-500" />
                                        <span className="font-semibold text-gray-800">
                                            Location
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                ref={missionRef}
                                initial={{ opacity: 0, x: 30 }}
                                animate={
                                    isMissionInView ? { opacity: 1, x: 0 } : {}
                                }
                                transition={{ duration: 0.6 }}
                                data-aos="fade-left"
                            >
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
                                            Find Us
                                        </p>
                                        <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                                            Visit Our Learning Hub
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-lg text-gray-600">
                                            Soraya is located beside Saint Paul
                                            Multipurpose stage, Fclar street,
                                            St. Paul district, Mangagoy, Bislig
                                            City, Surigao del Sur, PH, 8311
                                        </p>

                                        <div className="pt-4">
                                            <a
                                                href="https://www.google.com/maps/place/Soraya+Learning+Hub/@8.1852912,126.3531502,18z/data=!4m14!1m7!3m6!1s0x32fdbbcf610527df:0x1c9997f9881cd2ab!2sSoraya+Learning+Hub!8m2!3d8.1855211!4d126.35375!16s%2Fg%2F11zjmlh2rc!3m5!1s0x32fdbbcf610527df:0x1c9997f9881cd2ab!8m2!3d8.1855211!4d126.35375!16s%2Fg%2F11zjmlh2rc?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex transform items-center gap-3 rounded-full bg-yellow-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-700 hover:shadow-xl"
                                            >
                                                <MapPin className="h-5 w-5" />
                                                View on Google Maps
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="bg-gradient-to-b from-white to-yellow-50 py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center" data-aos="fade-up">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                                Soraya Mission
                            </h2>
                            <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-600">
                                Empowering young minds through personalized
                                education and creating meaningful impact
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {missionItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={
                                        isMissionInView
                                            ? { opacity: 1, y: 0 }
                                            : {}
                                    }
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.2,
                                    }}
                                    data-aos="fade-up"
                                    data-aos-delay={index * 200}
                                    className="rounded-2xl bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl"
                                >
                                    <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-blue-100 p-3">
                                        <div className="text-blue-600">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <h3 className="mb-4 text-xl font-bold text-gray-900">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {item.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Core Values Section */}
                <section
                    ref={valuesRef}
                    className="bg-gradient-to-b from-yellow-50 to-blue-100 py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center" data-aos="fade-up">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                                Soraya Core Values
                            </h2>
                            <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-600">
                                The principles that guide everything we do at
                                Soraya Learning Hub
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {coreValues.map((value, index) => (
                                <motion.div
                                    key={value.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={
                                        isValuesInView
                                            ? { opacity: 1, scale: 1 }
                                            : {}
                                    }
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                    data-aos="flip-left"
                                    data-aos-delay={index * 100}
                                    className="group"
                                >
                                    <div className="h-full rounded-2xl border-2 border-yellow-100 bg-gradient-to-b from-white to-yellow-50/30 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-yellow-200 hover:to-yellow-50">
                                        <div className="mb-4 text-4xl">
                                            {value.icon}
                                        </div>
                                        <h3 className="mb-3 text-xl font-bold text-gray-900">
                                            {value.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {value.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Promise Section */}
                <section
                    ref={promiseRef}
                    className="bg-gradient-to-b from-blue-100 to-yellow-50 py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center" data-aos="fade-up">
                            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-lg">
                                <Heart className="h-6 w-6 text-pink-500" />
                                <span className="text-lg font-semibold text-gray-800">
                                    Our Promise to You
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                                The Soraya Promise
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                            {promises.map((promise, index) => (
                                <motion.div
                                    key={promise.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={
                                        isPromiseInView
                                            ? { opacity: 1, y: 0 }
                                            : {}
                                    }
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                    data-aos="zoom-in"
                                    data-aos-delay={index * 100}
                                >
                                    <div className="h-full rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                                        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-white p-3">
                                            {promise.icon}
                                        </div>
                                        <h3 className="mb-3 text-lg font-bold text-gray-900">
                                            {promise.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {promise.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
