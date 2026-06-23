import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoFlame, IoEye, IoEyeOff, IoMailOutline, IoLockClosedOutline, IoHardwareChipOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import loginHero from '../assets/login_hero.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Please fill all fields');

        setLoading(true);
        try {
            const data = await login(email, password);
            toast.success('Welcome back!');
            navigate(data.onboardingComplete ? '/home' : '/onboarding');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Left Panel — Form */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full lg:w-[48%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 py-12 relative z-10"
            >
                {/* Subtle ambient glow */}
                <div className="absolute top-20 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-16">
                    <div className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-[0_0_20px_rgba(255,107,53,0.3)]">
                        <IoFlame className="text-white" size={22} />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white">
                        Fuel<span className="text-primary">IQ</span>
                    </span>
                </div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-text-secondary text-sm mb-10">
                        Welcome back, please enter your details
                    </p>
                </motion.div>

                {/* Sign In / Sign Up Toggle (Visual) */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex items-center gap-1 bg-surface-2 rounded-xl p-1 mb-8 w-fit border border-white/5"
                >
                    <div className="px-6 py-2.5 bg-surface-3 rounded-lg text-white text-sm font-semibold shadow-sm cursor-default">
                        Sign In
                    </div>
                    <Link
                        to="/register"
                        className="px-6 py-2.5 text-text-muted text-sm font-medium hover:text-text-secondary transition-colors rounded-lg"
                    >
                        Sign Up
                    </Link>
                </motion.div>

                {/* Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                >
                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-2">Email Address</label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-text-muted">
                                <IoMailOutline size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary placeholder-text-muted focus:border-primary/30 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-2">Password</label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-text-muted">
                                <IoLockClosedOutline size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary placeholder-text-muted focus:border-primary/30 transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-text-muted hover:text-text-secondary transition-colors"
                            >
                                {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] glow-primary-strong mt-1 cursor-pointer"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : (
                            'Continue'
                        )}
                    </button>
                </motion.form>

                {/* Divider */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="flex items-center gap-4 my-8"
                >
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs font-medium text-text-muted">Or Continue With</span>
                    <div className="flex-1 h-px bg-white/10" />
                </motion.div>

                {/* Social Buttons (Visual placeholder) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex items-center justify-center gap-4"
                >
                    <button className="w-12 h-12 rounded-full bg-surface-2 border border-white/8 flex items-center justify-center hover:bg-surface-3 hover:border-primary/20 transition-all group cursor-pointer">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </button>
                    <button className="w-12 h-12 rounded-full bg-surface-2 border border-white/8 flex items-center justify-center hover:bg-surface-3 hover:border-primary/20 transition-all group cursor-pointer">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.09 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                        </svg>
                    </button>
                </motion.div>

                {/* Bottom tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-center text-xs text-text-muted mt-12 leading-relaxed max-w-xs mx-auto"
                >
                    Join thousands of Indian gym-goers who track nutrition the smart way.
                    Log in to your personalized dashboard, track your macros, and crush your goals.
                </motion.p>
            </motion.div>

            {/* Right Panel — Hero Image */}
            <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:block lg:w-[52%] relative overflow-hidden"
            >
                {/* Background Image */}
                <img
                    src={loginHero}
                    alt="Fitness and nutrition"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 login-hero-overlay" />
                {/* Inner glow orb */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-neon-pulse" />

                {/* Floating stats card */}
                <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-24 left-12 bg-surface/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl max-w-[240px]"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                            <IoFlame className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">1,847 kcal</p>
                            <p className="text-text-muted text-xs">Today's intake</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 bg-surface-3 rounded-lg px-2.5 py-2 text-center">
                            <p className="text-xs text-protein font-bold">48g</p>
                            <p className="text-[10px] text-text-muted">Protein</p>
                        </div>
                        <div className="flex-1 bg-surface-3 rounded-lg px-2.5 py-2 text-center">
                            <p className="text-xs text-carbs font-bold">220g</p>
                            <p className="text-[10px] text-text-muted">Carbs</p>
                        </div>
                        <div className="flex-1 bg-surface-3 rounded-lg px-2.5 py-2 text-center">
                            <p className="text-xs text-fats font-bold">52g</p>
                            <p className="text-[10px] text-text-muted">Fats</p>
                        </div>
                    </div>
                </motion.div>

                {/* Floating AI chip */}
                <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 right-12 bg-surface/70 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/10 shadow-xl flex items-center gap-2"
                >
                    <IoHardwareChipOutline size={24} className="text-primary" />
                    <span className="text-xs text-text-secondary font-medium">AI-Powered Insights</span>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
