import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { IoFlame, IoNutrition, IoSpeedometer, IoShield, IoChevronForward, IoCheckmarkCircle } from 'react-icons/io5';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
            icon: <span className="text-3xl">🗣️</span>,
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
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation Bar */}
            <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2"
                >
                    <div className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-[0_0_15px_rgba(255,107,53,0.4)]">
                        <IoFlame className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white">
                        Fuel<span className="text-primary">IQ</span>
                    </span>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-4"
                >
                    <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
                        Sign In
                    </Link>
                    <Link to="/register" className="text-sm font-semibold px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg backdrop-blur-md transition-all text-white">
                        Get Started
                    </Link>
                </motion.div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 lg:pt-32 pb-24 flex flex-col lg:flex-row items-center gap-16">
                <motion.div 
                    className="flex-1 text-center lg:text-left"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-3 border border-white/5 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs font-medium text-text-secondary">v1.0 Now Live • AI Powered</span>
                    </motion.div>
                    
                    <motion.h1 variants={fadeUpVariant} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 text-white tracking-tight">
                        Nutrition tracking for <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-amber-400">
                            the food you actually eat
                        </span>
                    </motion.h1>
                    
                    <motion.p variants={fadeUpVariant} className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                        India's first culturally-aware AI nutrition coach that understands dal tadka, dhaba portions, and Navratri fasting. No salmon-and-quinoa meal plans.
                    </motion.p>
                    
                    <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <Link to="/register" className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,107,53,0.4)] w-full sm:w-auto">
                            Start Tracking Free
                            <IoChevronForward className="transition-transform group-hover:translate-x-1" size={20} />
                        </Link>
                        <Link to="/login" className="flex items-center justify-center px-8 py-4 bg-surface-3 hover:bg-surface-4 text-text-primary font-semibold text-lg rounded-xl transition-all border border-white/5 w-full sm:w-auto">
                            View Demo
                        </Link>
                    </motion.div>
                    
                    <motion.div variants={fadeUpVariant} className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-text-muted font-medium">
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

                <motion.div 
                    className="flex-1 w-full max-w-lg lg:max-w-none relative"
                    initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                >
                    {/* Floating Abstract UI Elements */}
                    <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-surface-2 shadow-2xl flex items-center justify-center p-8 glass-card">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                        
                        {/* Mock App Card */}
                        <motion.div 
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full max-w-sm bg-surface rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 relative z-10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-white font-bold text-lg">Today's Macros</h3>
                                    <p className="text-xs text-text-muted">2 roti, dal, sabzi logged</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-surface-3 flex items-center justify-center rotate-45">
                                    <div className="w-8 h-8 rounded-full border-4 border-accent border-r-surface-3 -rotate-12" />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-text-secondary font-medium">Protein</span>
                                        <span className="text-white font-bold">45g / 120g</span>
                                    </div>
                                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                                        <div className="h-full bg-protein w-[35%] rounded-full" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-text-secondary font-medium">Carbs</span>
                                        <span className="text-white font-bold">180g / 250g</span>
                                    </div>
                                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                                        <div className="h-full bg-carbs w-[70%] rounded-full" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 p-4 bg-surface-3 rounded-xl border border-white/5 flex gap-3 items-center">
                                <span className="text-2xl">🤖</span>
                                <div className="flex-1">
                                    <div className="h-2 w-24 bg-white/20 rounded-full mb-2 animate-pulse" />
                                    <div className="h-2 w-32 bg-white/10 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Decorative background circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full" />
                    </div>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for the Indian Diet</h2>
                    <p className="text-text-secondary max-w-2xl mx-auto">Stop translating your meals into Western equivalents. FuelIQ natively understands your diet.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group relative bg-surface-2 border border-white/5 rounded-2xl p-8 overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${f.color} rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100`} />
                            
                            <div className="relative z-10">
                                <div className="mb-6 p-3 bg-surface-3 inline-block rounded-xl border border-white/5">
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

            {/* Competitor / Final CTA */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-br from-primary/30 via-surface-3 to-accent/30"
                >
                    <div className="bg-surface-2 rounded-[22px] p-8 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-surface-2/0 to-surface-2/0 pointer-events-none" />
                        
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
                            Stop fighting with your tracker.
                        </h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 relative z-10">
                            Other apps have 14 million foods, yet <span className="text-white font-semibold">"homemade aloo paratha"</span> returns conflicting entries ranging from 150 to 400 calories. FuelIQ uses accurate, ICMR-verified data.
                        </p>
                        
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-surface font-bold text-lg rounded-xl transition-all hover:scale-105 relative z-10">
                            Create Your Free Account
                            <IoChevronForward size={20} />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 mt-10">
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
