import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Users2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import HomeHeader from './Components/HomeHeader';


interface TeamMember {
    name: string;
    role: string;
    description: string;
    imageUrl: string;
    color: string;
    delay: number;
}

export default function TutorApplication() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const teamMembers: TeamMember[] = [
        {
            name: 'Ralf Louie Ranario',
            role: 'Frontend Developer',
            description: 'Creates intuitive user interfaces and enhances user experience.',
            imageUrl: '/assets/Ryan.png',
            color: 'from-amber-500/90 to-orange-600/90',
            delay: 0.1
        },
        {
            name: 'Jenn Ludo',
            role: 'Data Analyst',
            description: 'Transforms complex data into actionable insights that drive decision-making.',
            imageUrl: '/assets/Jenn.jpg',
            color: 'from-amber-500/90 to-orange-600/90',
            delay: 0.2
        },
        {
            name: 'Precious Lea',
            role: 'UI/UX Designer',
            description: 'Crafts beautiful, functional experiences that balance aesthetics with usability.',
            imageUrl: '/assets/Precious.jpg',
            color: 'from-amber-500/90 to-orange-600/90',
            delay: 0.3
        },
        {
            name: 'PrienceArhnamael Suan Polvorosa',
            role: 'Backend Developer',
            description: 'Builds robust, scalable systems that power seamless applications.',
            imageUrl: '/assets/Prince.png',
            color: 'from-amber-500/90 to-orange-600/90',
            delay: 0.4
        },
        {
            name: 'Jiro Lugagay',
            role: 'DevOps',
            description: 'Ensures smooth deployment and operation of applications in production.',
            imageUrl: '/assets/Jiro.png',
            color: 'from-amber-500/90 to-orange-600/90',
            delay: 0.5
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        },
        hover: {
            y: -10,
            scale: 1.02,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 15
            }
        }
    };

    const imageVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.3
            }
        },
        hover: {
            scale: 1.1,
            rotate: 2,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 10
            }
        }
    };

    const textVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const badgeVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            rotate: -10
        },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    const hoverContentVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        }
    };

    return (
        <>
            <Head title="Our Team" />

            <div className="min-h-screen bg-gradient-to-b from-[#FCF8F1] to-yellow-50 overflow-hidden">
                <HomeHeader />

                <section className="py-12 sm:py-16 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Header with enhanced animations */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="mb-12"
                        >
                            <motion.div
                                variants={badgeVariants}
                                className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 shadow-sm"
                            >
                                <Sparkles className="h-4 w-4 text-yellow-600" />
                                <Users2 className="h-5 w-5 text-yellow-600" />
                                <span className="text-sm font-semibold text-yellow-900">
                                    Meet Our Creative Team
                                </span>
                                <Sparkles className="h-4 w-4 text-yellow-600" />
                            </motion.div>

                            <motion.h1
                                variants={textVariants}
                                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                            >
                                The{' '}
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.3,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    className="relative inline-block"
                                >
                                    <span className="relative z-10 bg-gradient-to-r from-yellow-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                                        AcadEnch
                                    </span>
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            opacity: [0.3, 0.5, 0.3]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-yellow-200 to-orange-200 blur-xl"
                                    />
                                </motion.span>{' '}
                                Dream Team
                            </motion.h1>

                            <motion.p
                                variants={textVariants}
                                transition={{ delay: 0.4 }}
                                className="mt-4 max-w-2xl text-lg text-gray-600"
                            >
                                The talented minds behind AcadEnch, dedicated to
                                revolutionizing education through technology and
                                innovation.
                            </motion.p>
                        </motion.div>

                        {/* Team Grid with staggered animations */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                        >
                            {teamMembers.map((member, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    custom={index}
                                    whileHover="hover"
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: member.delay }}
                                    className="group relative h-96 cursor-pointer overflow-hidden rounded-3xl shadow-xl"
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {/* Background Image with parallax effect */}
                                    <motion.div
                                        variants={imageVariants}
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(${member.imageUrl})`,
                                        }}
                                        animate={{
                                            scale: hoveredIndex === index ? 1.15 : 1,
                                        }}
                                        transition={{
                                            duration: 0.7,
                                            ease: "easeOut"
                                        }}
                                    >
                                        {/* Animated Gradient Overlay */}
                                        <motion.div
                                            className={`absolute inset-0 bg-gradient-to-b ${member.color} transition-all duration-700`}
                                            animate={{
                                                opacity: hoveredIndex === index ? 0.9 : 0.7
                                            }}
                                        />

                                        {/* Animated Blur Overlay */}
                                        <motion.div
                                            className={`absolute inset-0 backdrop-blur-sm transition-all duration-700`}
                                            animate={{
                                                opacity: hoveredIndex === index ? 0.5 : 0,
                                                backdropBlur: hoveredIndex === index ? "8px" : "0px"
                                            }}
                                        />

                                        {/* Floating particles on hover */}
                                        {hoveredIndex === index && (
                                            <div className="absolute inset-0 overflow-hidden">
                                                {[...Array(5)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="absolute h-1 w-1 rounded-full bg-white/30"
                                                        initial={{
                                                            x: Math.random() * 100 + '%',
                                                            y: Math.random() * 100 + '%',
                                                            opacity: 0
                                                        }}
                                                        animate={{
                                                            y: "-100%",
                                                            opacity: [0, 1, 0],
                                                            scale: [0, 1, 0]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            delay: i * 0.2,
                                                            repeat: Infinity,
                                                            ease: "linear"
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Initial State */}
                                    <motion.div
                                        className={`absolute inset-0 flex flex-col items-center justify-center p-6`}
                                        animate={{
                                            opacity: hoveredIndex === index ? 0 : 1,
                                            scale: hoveredIndex === index ? 0.9 : 1,
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <motion.div
                                            className="relative mb-4"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <motion.div
                                                className="h-32 w-32 overflow-hidden rounded-full border-4 border-white/40 shadow-2xl"
                                                initial={{ rotateY: 0 }}
                                                whileHover={{ rotateY: 180 }}
                                                transition={{ duration: 0.6 }}
                                            >
                                                <img
                                                    src={member.imageUrl}
                                                    alt={member.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </motion.div>
                                            <motion.div
                                                className="absolute -inset-4 rounded-full bg-white/20 blur-xl"
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    opacity: [0.3, 0.5, 0.3]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        </motion.div>
                                        <motion.h3
                                            className="text-xl font-bold text-white drop-shadow-lg"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            {member.name.split(' ')[0]}
                                        </motion.h3>
                                        <motion.p
                                            className="mt-1 text-white/90 drop-shadow"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            {member.role}
                                        </motion.p>
                                    </motion.div>

                                    {/* Hover State */}
                                    <motion.div
                                        className={`absolute inset-0 top-0 flex flex-col justify-end p-6`}
                                        initial="hidden"
                                        animate={hoveredIndex === index ? "visible" : "hidden"}
                                        variants={hoverContentVariants}
                                    >
                                        <div className="relative z-10">
                                            <motion.h3
                                                className="text-xl font-bold text-white drop-shadow-lg mb-2"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{
                                                    y: hoveredIndex === index ? 0 : 20,
                                                    opacity: hoveredIndex === index ? 1 : 0
                                                }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                {member.name}
                                            </motion.h3>
                                            <motion.p
                                                className="text-sm font-medium text-white/90 drop-shadow mb-3"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{
                                                    y: hoveredIndex === index ? 0 : 20,
                                                    opacity: hoveredIndex === index ? 1 : 0
                                                }}
                                                transition={{ delay: 0.15 }}
                                            >
                                                {member.role}
                                            </motion.p>
                                            <motion.p
                                                className="text-sm text-white/80 drop-shadow"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{
                                                    y: hoveredIndex === index ? 0 : 20,
                                                    opacity: hoveredIndex === index ? 1 : 0
                                                }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                {member.description}
                                            </motion.p>
                                        </div>

                                        {/* Animated Bottom Gradient */}
                                        <motion.div
                                            className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        />

                                        {/* Glowing Border on Hover */}
                                        <motion.div
                                            className="absolute inset-0 rounded-3xl border-2 border-white/20"
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: hoveredIndex === index ? 1 : 0,
                                                borderWidth: hoveredIndex === index ? "4px" : "0px"
                                            }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </motion.div>

                                    {/* Role Badge Animation */}
                                    <motion.div
                                        className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white ${member.color.replace('from-', 'bg-gradient-to-r ')}`}
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{
                                            scale: hoveredIndex === index ? 0 : 1,
                                            rotate: hoveredIndex === index ? 180 : 0,
                                            y: hoveredIndex === index ? -20 : 0
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 15
                                        }}
                                    >
                                        {member.role.split(' ')[0]}
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>


                    </div>
                </section>
            </div>
        </>
    );
}
