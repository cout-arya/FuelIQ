import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import FoodInput from '../components/FoodInput';
import FoodLogEntry from '../components/FoodLogEntry';
import MacroRing from '../components/MacroRing';
import { IoFlame, IoHelpCircleOutline, IoSparkles, IoRestaurantOutline } from 'react-icons/io5';

const Home = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    const [targets, setTargets] = useState(null);
    const [isLogging, setIsLogging] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(true);



    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await axios.get('/nutrition/logs');
            setLogs(data.logs || []);
            setDailyTotals(data.dailyTotals || { calories: 0, protein: 0, carbs: 0, fats: 0 });
            setTargets(data.targets);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleLogMeal = async (text) => {
        setIsLogging(true);
        try {
            const { data } = await axios.post('/nutrition/log', { text });
            toast.success('Meal logged!', { icon: <IoFlame className="text-primary" /> });
            fetchLogs(); // Refresh

            if (data.needsClarification) {
                toast(data.clarificationQuestion || 'Was this home-cooked or restaurant?', {
                    icon: <IoHelpCircleOutline className="text-amber-500" size={20} />,
                    duration: 5000
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to log meal');
        } finally {
            setIsLogging(false);
        }
    };

    const calorieTarget = targets?.calories || 2200;
    const proteinTarget = targets?.protein || 140;
    const carbTarget = targets?.carbs || 250;
    const fatTarget = targets?.fats || 70;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-lg font-bold">
                        Hey, {user?.name?.split(' ')[0] || 'there'} <IoSparkles className="inline-block text-amber-400 mb-1 ml-1" size={20} />
                    </h1>
                    <p className="text-xs text-text-secondary">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                {user?.streak?.count > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <IoFlame size={14} />
                        {user.streak.count} day streak
                    </div>
                )}
            </div>

            {/* Food Input — THE primary element per PRD */}
            <div className="mb-6">
                <FoodInput onSubmit={handleLogMeal} isLoading={isLogging} />
            </div>

            {/* Macro Progress Rings */}
            <div className="glass-card rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-around">
                    <MacroRing value={dailyTotals.calories} target={calorieTarget} label="Calories" color="calories" size={85} strokeWidth={7} />
                    <MacroRing value={dailyTotals.protein} target={proteinTarget} label="Protein" color="protein" size={65} strokeWidth={5} />
                    <MacroRing value={dailyTotals.carbs} target={carbTarget} label="Carbs" color="carbs" size={65} strokeWidth={5} />
                    <MacroRing value={dailyTotals.fats} target={fatTarget} label="Fats" color="fats" size={65} strokeWidth={5} />
                </div>
            </div>

            {/* Today's Logs */}
            <div>
                <h2 className="text-sm font-semibold text-text-secondary mb-3">
                    Today's Meals {logs.length > 0 && <span className="text-text-muted">({logs.length})</span>}
                </h2>

                {loadingLogs ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-surface-3 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-10">
                        <IoRestaurantOutline size={48} className="mx-auto text-text-muted mb-3" />
                        <p className="text-sm text-text-secondary">No meals logged today</p>
                        <p className="text-xs text-text-muted mt-1">Type what you ate above to get started</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {logs.map(log => (
                            <FoodLogEntry key={log._id} log={log} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
