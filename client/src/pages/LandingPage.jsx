import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { IoFlame, IoNutrition, IoSpeedometer, IoShield, IoChevronForward, IoCheckmarkCircle, IoChatbubblesOutline, IoHardwareChipOutline, IoFastFoodOutline, IoLaptopOutline, IoStarOutline } from 'react-icons/io5';

const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const LandingPage = () => {
    const { user } = useAuth();

    if (user) return <Navigate to="/home" />;

    const features = [
        {
            icon: <IoNutrition size={32} className="text-primary" />,
            title: 'Indian Food RAG Engine',
            desc: '500+ verified Indian dishes with ICMR/NIN source data. No more 4 conflicting entries for aloo paratha.',
            color: 'from-primary/20 to-primary/0'
        },
        {
            icon: <IoChatbubblesOutline size={32} className="text-accent" />,
            title: 'Hinglish Logging',
            desc: 'Type "2 roti with dal and dahi" — our NLP parser understands how you actually describe food.',
            color: 'from-accent/20 to-accent/0'
        },
        {
            icon: <IoSpeedometer size={32} className="text-amber-400" />,
            title: '10-Second Logging',
            desc: 'App opens → type food → done. No category pickers, no dropdown menus, no friction.',
            color: 'from-amber-400/20 to-amber-400/0'
        },
        {
            icon: <IoShield size={32} className="text-purple-400" />,
            title: 'Zero Social Noise',
            desc: 'No leaderboards. No followers. No streak notifications. Your data, your privacy.',
            color: 'from-purple-400/20 to-purple-400/0'
        },
    ];

    return (
        <div className="min-h-screen bg-surface overflow-hidden selection:bg-primary/30 selection:text-white">
            {/* Ambient Neon Glow Orbs */}
            <div className="neon-orb top-[-15%] left-[-8%] w-[500px] h-[500px] bg-primary/25" />
            <div className="neon-orb bottom-[-15%] right-[-8%] w-[500px] h-[500px] bg-accent/15" style={{ animationDelay: '2s' }} />
            <div className="neon-orb top-[40%] right-[15%] w-[300px] h-[300px] bg-primary/10" style={{ animationDelay: '1s' }} />

            {/* Glassmorphism Navigation Bar */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 mt-4 mx-6 lg:mx-auto glass-nav rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-[0_0_15px_rgba(255,107,53,0.4)]">
                                <IoFlame className="text-white" size={22} />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white">
                                Fuel<span className="text-primary">IQ</span>
                            </span>
                        </div>

                        {/* Nav Links — Desktop only */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">How It Works</a>
                            <a href="#cta" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">Why FuelIQ</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-white transition-colors hidden sm:block">
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-semibold px-5 py-2.5 bg-primary hover:bg-primary-dark rounded-xl transition-all text-white animate-glow-ring"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 lg:pt-44 pb-28 flex flex-col lg:flex-row items-center gap-16">
                <motion.div
                    className="flex-1 text-center lg:text-left"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-3/70 backdrop-blur-md border border-white/5 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs font-medium text-text-secondary">v1.0 Now Live • AI Powered</span>
                    </motion.div>

                    <motion.h1 variants={fadeUpVariant} className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.95] mb-8 text-white tracking-tighter">
                        Nutrition<br className="hidden sm:block" />
                        tracking for{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-amber-400 animate-gradient-shift">
                            the food you actually eat.
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeUpVariant} className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-12 max-w-2xl mx-auto lg:mx-0">
                        India's first culturally-aware AI nutrition coach that understands dal tadka, dhaba portions, and Navratri fasting. No salmon-and-quinoa meal plans.
                    </motion.p>

                    <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <Link to="/register" className="group relative flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,107,53,0.5)] w-full sm:w-auto animate-glow-ring">
                            Start Tracking Free
                            <IoChevronForward className="transition-transform group-hover:translate-x-1" size={20} />
                        </Link>
                        <Link to="/login" className="flex items-center justify-center px-10 py-4 bg-surface-3/60 backdrop-blur-md hover:bg-surface-4 text-text-primary font-semibold text-lg rounded-xl transition-all border border-white/8 w-full sm:w-auto">
                            View Demo
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeUpVariant} className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-text-muted font-medium">
                        <div className="flex items-center gap-1.5">
                            <IoCheckmarkCircle className="text-accent" size={18} />
                            <span>No paywalls</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <IoCheckmarkCircle className="text-accent" size={18} />
                            <span>100% Privacy</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <IoCheckmarkCircle className="text-accent" size={18} />
                            <span>ICMR Verified Data</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Hero Right — Floating App Mock */}
                <motion.div
                    className="flex-1 w-full max-w-lg lg:max-w-none relative"
                    initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                >
                    {/* Neon ribbon trail behind the card */}
                    <div className="neon-ribbon top-[30%]" />
                    <div className="neon-ribbon top-[55%]" style={{ animationDelay: '4s', opacity: 0.6 }} />

                    <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-surface-2/70 backdrop-blur-md shadow-2xl flex items-center justify-center p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-accent/5" />

                        {/* Main floating card */}
                        <motion.div
                            animate={{ y: [-12, 12, -12] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full max-w-sm bg-surface rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 relative z-10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-white font-bold text-lg">Today's Macros</h3>
                                    <p className="text-xs text-text-muted">2 roti, dal, sabzi logged</p>
                                </div>
                                <div className="w-14 h-14 rounded-full border-[3px] border-primary border-t-surface-3 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
                                    <div className="w-9 h-9 rounded-full border-[3px] border-accent border-r-surface-3" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-text-secondary font-medium">Protein</span>
                                        <span className="text-white font-bold">45g / 120g</span>
                                    </div>
                                    <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '35%' }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-protein to-purple-300 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-text-secondary font-medium">Carbs</span>
                                        <span className="text-white font-bold">180g / 250g</span>
                                    </div>
                                    <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '70%' }}
                                            transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-carbs to-amber-300 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-text-secondary font-medium">Fats</span>
                                        <span className="text-white font-bold">38g / 65g</span>
                                    </div>
                                    <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '58%' }}
                                            transition={{ duration: 1.5, delay: 0.9, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-fats to-pink-300 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-surface-3/80 rounded-xl border border-white/5 flex gap-3 items-center">
                                <IoHardwareChipOutline size={28} className="text-primary" />
                                <div className="flex-1">
                                    <p className="text-xs text-text-secondary font-medium mb-1">AI Insight</p>
                                    <p className="text-xs text-text-muted">"Add a paneer dish at dinner to hit your protein goal"</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Secondary floating card */}
                        <motion.div
                            animate={{ y: [8, -8, 8], x: [3, -3, 3] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-4 -right-4 lg:bottom-4 lg:right-4 bg-surface/90 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-xl z-20 w-48"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <IoFlame className="text-primary" size={16} />
                                <span className="text-xs font-bold text-white">Quick Log</span>
                            </div>
                            <div className="bg-surface-3 rounded-lg px-3 py-2 flex items-center gap-2">
                                <IoFastFoodOutline size={18} className="text-amber-400" />
                                <span className="text-xs text-text-muted">2 roti, dal fry...</span>
                            </div>
                        </motion.div>

                        {/* Decorative rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-white/[0.03] rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/[0.03] rounded-full" />
                    </div>
                </motion.div>
            </div>

            {/* Features Section */}
            <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-white/5">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">WHY FUELIQ</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">Built for the Indian Diet</h2>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">Stop translating your meals into Western equivalents. FuelIQ natively understands your diet.</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="group relative bg-surface-2/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 overflow-hidden feature-card-glow"
                        >
                            <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${f.color} rounded-bl-full opacity-30 transition-opacity duration-500 group-hover:opacity-80`} />

                            <div className="relative z-10">
                                <div className="mb-6 p-3.5 bg-surface-3/80 inline-block rounded-xl border border-white/5 group-hover:border-primary/20 transition-colors">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* How It Works Section */}
            <div id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent mb-6">HOW IT WORKS</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">Three Steps. Ten Seconds.</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: '01', title: 'Open & Type', desc: 'Type your meal in Hinglish — "2 roti, dal, raita"', icon: <IoLaptopOutline size={36} className="text-primary" /> },
                        { step: '02', title: 'AI Parses', desc: 'Our RAG engine finds the exact ICMR-verified nutrition data', icon: <IoHardwareChipOutline size={36} className="text-accent" /> },
                        { step: '03', title: 'Track & Win', desc: 'See your macros instantly. Get AI insights to hit your goals', icon: <IoStarOutline size={36} className="text-amber-400" /> },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className="text-center p-8"
                        >
                            <div className="flex justify-center mb-4">{item.icon}</div>
                            <div className="text-xs font-bold text-primary mb-3 tracking-wider">{item.step}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-text-secondary">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Final CTA */}
            <div id="cta" className="relative z-10 max-w-5xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden p-[2px] bg-gradient-to-br from-primary/40 via-surface-3 to-accent/30"
                >
                    <div className="bg-surface-2 rounded-[22px] p-10 md:p-20 text-center relative overflow-hidden">
                        {/* Background radial glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-black text-white mb-6 relative z-10 tracking-tight"
                        >
                            Stop fighting with<br />your tracker.
                        </motion.h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12 relative z-10">
                            Other apps have 14 million foods, yet <span className="text-white font-semibold">"homemade aloo paratha"</span> returns conflicting entries ranging from 150 to 400 calories. FuelIQ uses accurate, ICMR-verified data.
                        </p>

                        <Link to="/register" className="inline-flex items-center justify-center gap-2 px-12 py-4 bg-white text-surface font-bold text-lg rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] relative z-10 group">
                            Create Your Free Account
                            <IoChevronForward size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 mt-10 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <IoFlame className="text-primary" size={20} />
                        <span className="font-bold text-white tracking-tight">FuelIQ</span>
                    </div>
                    <p className="text-sm text-text-muted">
                        © {new Date().getFullYear()} FuelIQ. Designed for Indian Gym-goers.
                    </p>
                    <div className="text-sm text-text-muted">
                        Your data is yours. Always.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
