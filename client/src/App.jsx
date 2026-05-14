import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import MainLayout from './layouts/MainLayout';
import { Toaster } from 'react-hot-toast';

const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Home = React.lazy(() => import('./pages/Home'));
const MealPlan = React.lazy(() => import('./pages/MealPlan'));
const Progress = React.lazy(() => import('./pages/Progress'));
const Settings = React.lazy(() => import('./pages/Settings'));

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
            <Suspense fallback={<LoadingSpinner text="Loading..." />}>
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
            </Suspense>
        </>
    );
}

export default App;
