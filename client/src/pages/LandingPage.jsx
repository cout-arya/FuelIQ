import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { IoFlame, IoNutrition, IoSpeedometer, IoShield, IoChevronForward } from 'react-icons/io5';

const LandingPage = () => {
    const { user } = useAuth();

    if (user) return <Navigate to="/home" />;

    const features = [
        {
            icon: <IoNutrition size={28} />,
            title: 'Indian Food RAG Engine',
            desc: '500+ verified Indian dishes with ICMR/NIN source data. No more 4 conflicting entries for aloo paratha.',
            color: 'text-primary'
        },
        {
            icon: <span className="text-2xl">🗣️</span>,
            title: 'Hinglish Food Logging',
            desc: 'Type "2 roti with dal and dahi" — our NLP parser understands how you actually describe food.',
            color: 'text-accent'
        },
        {
            icon: <IoSpeedometer size={28} />,
            title: '10-Second Logging',
            desc: 'App opens → type food → done. No category pickers, no dropdown menus, no friction.',
            color: 'text-amber-400'
        },
        {
            icon: <IoShield size={28} />,
            title: 'Zero Social Noise',
            desc: 'No leaderboards. No followers. No streak notifications. Your data, your privacy.',
            color: 'text-purple-400'
        },
    ];

    return (
        <div className="min-h-screen bg-surface overflow-hidden">
            {/* Hero */}
            <div className="relative">
                {/* Gradient orbs */}
                <div className="absolute top-20 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute top-40 -right-32 w-64 h-64 bg-accent/15 rounded-full blur-[100px]" />

                <div className="relative max-w-lg mx-auto px-6 pt-16 pb-12">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-12">
                        <IoFlame className="text-primary" size={28} />
                        <span className="text-xl font-bold tracking-tight">
                            Fuel<span className="text-primary">IQ</span>
                        </span>
                    </div>

                    {/* Tagline */}
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
                        Nutrition tracking for{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                            the food you actually eat
                        </span>
                    </h1>

                    <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-md">
                        India's first AI nutrition coach that understands dal tadka, dhaba portions, and Navratri fasting.
                        No salmon-and-quinoa meal plans.
                    </p>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <Link
                            to="/register"
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all active:scale-[0.98] glow-primary"
                        >
                            Start Tracking Free
                            <IoChevronForward size={18} />
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center justify-center px-8 py-3.5 bg-surface-3 hover:bg-surface-4 text-text-primary font-medium rounded-xl transition-all border border-white/5"
                        >
                            Sign In
                        </Link>
                    </div>
                    <p className="text-[11px] text-text-muted">
                        Free forever. No paywall surprises. Export your data anytime.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-lg mx-auto px-6 pb-20">
                <h2 className="text-lg font-bold mb-6 text-text-secondary">
                    Built different.
                </h2>
                <div className="space-y-4">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="glass-card rounded-2xl p-5 animate-fade-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`${f.color} mt-0.5`}>{f.icon}</div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1 text-text-primary">
                                        {f.title}
                                    </h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Competitor callout */}
                <div className="mt-10 p-5 rounded-2xl bg-gradient-to-br from-surface-3 to-surface-2 border border-white/5">
                    <p className="text-xs text-text-secondary leading-relaxed">
                        <span className="text-primary font-semibold">Why not MyFitnessPal?</span>{' '}
                        It has 14 million foods, yet "aloo paratha homemade" returns 4 conflicting entries
                        with calorie counts ranging from 150 to 400 kcal. FuelIQ uses ICMR/NIN-verified data
                        — the same sources Indian dietitians use.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-text-muted">
                        <IoFlame className="text-primary" size={16} />
                        <span className="text-xs">FuelIQ — Your data is yours. Always.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
