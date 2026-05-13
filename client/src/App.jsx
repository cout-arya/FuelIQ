import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import MealPlan from './pages/MealPlan';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import MainLayout from './layouts/MainLayout';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner text="Loading FuelIQ..." />;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const OnboardingGuard = ({ children }) => {
    const { user } = useAuth();
    if (user && !user.onboardingComplete) return <Navigate to="/onboarding" />;
    return children;
};

function App() {
    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1E1E2E',
                        color: '#F5F5F5',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                    success: {
                        iconTheme: { primary: '#10B981', secondary: '#1E1E2E' },
                    },
                    error: {
                        iconTheme: { primary: '#EF4444', secondary: '#1E1E2E' },
                    },
                }}
            />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Onboarding */}
                <Route path="/onboarding" element={
                    <ProtectedRoute><Onboarding /></ProtectedRoute>
                } />

                {/* Protected App Routes */}
                <Route element={
                    <ProtectedRoute>
                        <OnboardingGuard>
                            <MainLayout />
                        </OnboardingGuard>
                    </ProtectedRoute>
                }>
                    <Route path="/home" element={<Home />} />
                    <Route path="/plan" element={<MealPlan />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
}

export default App;
