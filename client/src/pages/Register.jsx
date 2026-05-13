import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoFlame, IoEye, IoEyeOff } from 'react-icons/io5';
import toast from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) return toast.error('Please fill all fields');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');

        setLoading(true);
        try {
            await register(name, email, password);
            toast.success('Account created! Let\'s set up your profile.');
            navigate('/onboarding');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-6">
            <div className="absolute top-20 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />

            <div className="w-full max-w-sm relative">
                <div className="flex items-center gap-2 mb-8">
                    <IoFlame className="text-primary" size={28} />
                    <span className="text-xl font-bold">
                        Fuel<span className="text-primary">IQ</span>
                    </span>
                </div>

                <h1 className="text-2xl font-bold mb-1">Create your account</h1>
                <p className="text-sm text-text-secondary mb-8">Free forever. No paywall surprises.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary placeholder-text-muted focus:border-primary/30 transition-all"
                            placeholder="Your name"
                        />
                    </div>

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
                                placeholder="Min. 6 characters"
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
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-text-secondary mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
