import { Link } from 'react-router-dom';
import { IoFlame, IoRestaurant, IoStatsChart, IoSettings } from 'react-icons/io5';

const navItems = [
    { path: '/home', icon: IoFlame, label: 'Log' },
    { path: '/plan', icon: IoRestaurant, label: 'Plan' },
    { path: '/progress', icon: IoStatsChart, label: 'Progress' },
    { path: '/settings', icon: IoSettings, label: 'Settings' },
];

const BottomNav = ({ currentPath }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-2/90 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-lg mx-auto flex items-center justify-around h-16">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = currentPath === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? 'text-primary'
                                    : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            <Icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,107,53,0.4)]' : ''} />
                            <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>
                                {label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
