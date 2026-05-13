import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoFlame, IoEye, IoEyeOff } from 'react-icons/io5';
import toast from 'react-hot-toast';

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
        <div className="min-h-screen bg-surface flex items-center justify-center px-6">
            <div className="absolute top-20 -left-32 w-64 h-64 bg-primary/15 rounded-full blur-[100px]" />

            <div className="w-full max-w-sm relative">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <IoFlame className="text-primary" size={28} />
                    <span className="text-xl font-bold">
                        Fuel<span className="text-primary">IQ</span>
                    </span>
                </div>

                <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
                <p className="text-sm text-text-secondary mb-8">Log in to continue tracking</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary placeholder-text-muted focus:border-primary/30 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary placeholder-text-muted focus:border-primary/30 transition-all pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                            >
                                {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] glow-primary mt-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-text-secondary mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary font-medium hover:underline">
                        Sign up free
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
