import { useState, useEffect } from 'react';
import axios from 'axios';
import MacroRing from '../components/MacroRing';
import { IoFlame, IoTrendingUp, IoTrendingDown, IoScale } from 'react-icons/io5';
import toast from 'react-hot-toast';

const Progress = () => {
    const [weeklyData, setWeeklyData] = useState([]);
    const [targets, setTargets] = useState(null);
    const [streak, setStreak] = useState({ count: 0 });
    const [weightHistory, setWeightHistory] = useState([]);
    const [newWeight, setNewWeight] = useState('');
    const [loading, setLoading] = useState(true);
    const [loggingWeight, setLoggingWeight] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [weekRes, weightRes] = await Promise.all([
                axios.get('/progress/weekly'),
                axios.get('/progress/weight?days=30')
            ]);
            setWeeklyData(weekRes.data.dailyData || []);
            setTargets(weekRes.data.targets);
            setStreak(weekRes.data.streak || { count: 0 });
            setWeightHistory(weightRes.data || []);
        } catch (err) {
            console.error('Failed to fetch progress:', err);
        } finally {
            setLoading(false);
        }
    };

    const logWeight = async () => {
        if (!newWeight || Number(newWeight) < 20 || Number(newWeight) > 300) {
            return toast.error('Enter a valid weight (20-300 kg)');
        }
        setLoggingWeight(true);
        try {
            await axios.post('/progress/weight', { weight: Number(newWeight) });
            toast.success('Weight logged!');
            setNewWeight('');
            fetchData();
        } catch (err) {
            toast.error('Failed to log weight');
        } finally {
            setLoggingWeight(false);
        }
    };

    // Calculate weekly averages
    const weekAvg = weeklyData.length > 0 ? {
        calories: Math.round(weeklyData.reduce((s, d) => s + d.calories, 0) / 7),
        protein: Math.round(weeklyData.reduce((s, d) => s + d.protein, 0) / 7),
        carbs: Math.round(weeklyData.reduce((s, d) => s + d.carbs, 0) / 7),
        fats: Math.round(weeklyData.reduce((s, d) => s + d.fats, 0) / 7),
    } : { calories: 0, protein: 0, carbs: 0, fats: 0 };

    // Find max calories in week for bar chart scaling
    const maxCal = Math.max(...weeklyData.map(d => d.calories), targets?.calories || 2200, 1);

    // Weight trend
    const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null;
    const firstWeight = weightHistory.length > 1 ? weightHistory[0].weight : latestWeight;
    const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-surface-3 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-lg font-bold mb-5">Progress</h1>

            {/* Streak + Weight Summary */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Streak Card */}
                <div className="glass-card rounded-2xl p-4 text-center">
                    <IoFlame className="text-primary mx-auto mb-1" size={24} />
                    <p className="text-2xl font-bold text-primary">{streak?.count || 0}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Day Streak</p>
                </div>

                {/* Weight Card */}
                <div className="glass-card rounded-2xl p-4 text-center">
                    <IoScale className="text-accent mx-auto mb-1" size={24} />
                    <p className="text-2xl font-bold text-text-primary">
                        {latestWeight ? `${latestWeight}` : '—'}
                        <span className="text-sm font-normal text-text-muted ml-0.5">kg</span>
                    </p>
                    {weightChange && Number(weightChange) !== 0 && (
                        <p className={`text-[10px] flex items-center justify-center gap-0.5 mt-0.5 ${Number(weightChange) < 0 ? 'text-success' : 'text-warning'}`}>
                            {Number(weightChange) < 0 ? <IoTrendingDown size={10} /> : <IoTrendingUp size={10} />}
                            {weightChange > 0 ? '+' : ''}{weightChange} kg (30d)
                        </p>
                    )}
                </div>
            </div>

            {/* Log Weight */}
            <div className="glass-card rounded-xl p-3 mb-5 flex items-center gap-2">
                <IoScale className="text-text-muted" size={16} />
                <input
                    type="number"
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    placeholder="Log today's weight (kg)"
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none"
                />
                <button
                    onClick={logWeight}
                    disabled={loggingWeight}
                    className="px-3 py-1.5 bg-accent hover:bg-accent-light text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                    {loggingWeight ? '...' : 'Log'}
                </button>
            </div>

            {/* Weekly Macro Adherence */}
            <div className="glass-card rounded-2xl p-4 mb-5">
                <h3 className="text-xs font-medium text-text-secondary mb-3">Weekly Average</h3>
                <div className="flex items-center justify-around mb-4">
                    <MacroRing value={weekAvg.calories} target={targets?.calories || 2200} label="Cal/day" color="calories" size={70} strokeWidth={6} />
                    <MacroRing value={weekAvg.protein} target={targets?.protein || 140} label="Protein" color="protein" size={55} strokeWidth={4} />
                    <MacroRing value={weekAvg.carbs} target={targets?.carbs || 250} label="Carbs" color="carbs" size={55} strokeWidth={4} />
                    <MacroRing value={weekAvg.fats} target={targets?.fats || 70} label="Fats" color="fats" size={55} strokeWidth={4} />
                </div>
            </div>

            {/* Daily Calorie Chart */}
            <div className="glass-card rounded-2xl p-4">
                <h3 className="text-xs font-medium text-text-secondary mb-4">Daily Calories (7 days)</h3>
                <div className="flex items-end justify-between gap-1.5 h-32">
                    {weeklyData.map((day, i) => {
                        const height = maxCal > 0 ? (day.calories / maxCal) * 100 : 0;
                        const isToday = i === weeklyData.length - 1;
                        const targetLine = targets?.calories ? (targets.calories / maxCal) * 100 : 0;

                        return (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 relative">
                                <span className="text-[9px] text-text-muted">{day.calories > 0 ? day.calories : ''}</span>
                                <div className="w-full relative" style={{ height: '100px' }}>
                                    {/* Target line indicator */}
                                    {targets?.calories && (
                                        <div
                                            className="absolute left-0 right-0 border-t border-dashed border-primary/20"
                                            style={{ bottom: `${targetLine}%` }}
                                        />
                                    )}
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-500 ${
                                            isToday ? 'bg-primary' : 'bg-surface-4'
                                        }`}
                                        style={{ height: `${Math.max(height, 2)}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] font-medium ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                                    {day.dayName}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {targets?.calories && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-4 border-t border-dashed border-primary/40" />
                        <span className="text-[9px] text-text-muted">Target: {targets.calories} kcal</span>
                    </div>
                )}
            </div>

            {/* Weight Trend */}
            {weightHistory.length > 1 && (
                <div className="glass-card rounded-2xl p-4 mt-4">
                    <h3 className="text-xs font-medium text-text-secondary mb-4">Weight Trend (30 days)</h3>
                    <div className="flex items-end justify-between gap-0.5 h-20">
                        {weightHistory.slice(-14).map((entry, i) => {
                            const min = Math.min(...weightHistory.slice(-14).map(e => e.weight)) - 1;
                            const max = Math.max(...weightHistory.slice(-14).map(e => e.weight)) + 1;
                            const range = max - min || 1;
                            const height = ((entry.weight - min) / range) * 100;

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <div className="w-full relative" style={{ height: '60px' }}>
                                        <div
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 rounded-full bg-accent transition-all"
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Progress;
