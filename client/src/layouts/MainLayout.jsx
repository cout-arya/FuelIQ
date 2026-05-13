import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const MainLayout = () => {
    const location = useLocation();

    return (
        <div className="min-h-[100dvh] bg-surface text-text-primary flex flex-col">
            <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4">
                <Outlet />
            </main>
            <BottomNav currentPath={location.pathname} />
        </div>
    );
};

export default MainLayout;
