import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MealCard from '../components/MealCard';
import MacroRing from '../components/MacroRing';
import { IoSparkles, IoRefresh } from 'react-icons/io5';

const MealPlan = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [regeneratingIdx, setRegeneratingIdx] = useState(null);
    const [isTrainingDay, setIsTrainingDay] = useState(true);

    useEffect(() => {
        fetchPlan();
    }, []);

    const fetchPlan = async () => {
        try {
            const { data } = await axios.get('/mealplan/today');
            setPlan(data.plan);
        } catch (err) {
            console.error('Failed to fetch plan:', err);
        } finally {
            setLoading(false);
        }
    };

    const generatePlan = async () => {
        setGenerating(true);
        try {
            const { data } = await axios.post('/mealplan/generate', { isTrainingDay });
            setPlan(data);
            toast.success('Meal plan generated! 🍽️');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate plan');
        } finally {
            setGenerating(false);
        }
    };

    const regenerateMeal = async (mealIndex) => {
        setRegeneratingIdx(mealIndex);
        try {
            const { data } = await axios.post('/mealplan/regenerate-meal', { mealIndex });
            setPlan(data.plan);
            toast.success('Meal swapped! 🔄');
        } catch (err) {
            toast.error('Failed to regenerate meal');
        } finally {
            setRegeneratingIdx(null);
        }
    };

    const totalMacros = plan?.meals?.reduce(
        (acc, m) => ({
            calories: acc.calories + (m.calories || 0),
            protein: acc.protein + (m.protein || 0),
            carbs: acc.carbs + (m.carbs || 0),
            fats: acc.fats + (m.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    ) || { calories: 0, protein: 0, carbs: 0, fats: 0 };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-surface-3 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-lg font-bold">Meal Plan</h1>
                    <p className="text-xs text-text-secondary">AI-generated based on your profile</p>
                </div>
            </div>

            {/* Training Day Toggle */}
            <div className="glass-card rounded-xl p-3 mb-4 flex items-center justify-between">
                <span className="text-sm text-text-secondary">Today is a</span>
                <div className="flex gap-1 bg-surface-3 rounded-lg p-0.5">
                    <button
                        onClick={() => setIsTrainingDay(true)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isTrainingDay ? 'bg-primary text-white' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                        Training Day 💪
                    </button>
                    <button
                        onClick={() => setIsTrainingDay(false)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!isTrainingDay ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                        Rest Day 😴
                    </button>
                </div>
            </div>

            {!plan ? (
                /* No plan yet — generate CTA */
                <div className="text-center py-12">
                    <p className="text-4xl mb-3">🤖</p>
                    <h2 className="text-base font-semibold mb-1">No plan for today</h2>
                    <p className="text-sm text-text-secondary mb-6">
                        Generate a personalized meal plan based on your goals and cuisine preferences
                    </p>
                    <button
                        onClick={generatePlan}
                        disabled={generating}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] glow-primary"
                    >
                        {generating ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <IoSparkles size={18} />
                        )}
                        {generating ? 'Generating...' : 'Generate Plan'}
                    </button>
                </div>
            ) : (
                /* Plan exists — show it */
                <>
                    {/* Plan Macro Summary */}
                    <div className="glass-card rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-medium text-text-secondary">Plan Totals</h3>
                            <button
                                onClick={generatePlan}
                                disabled={generating}
                                className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-all"
                            >
                                <IoRefresh size={14} className={generating ? 'animate-spin' : ''} />
                                Regenerate all
                            </button>
                        </div>
                        <div className="flex items-center justify-around">
                            <MacroRing value={totalMacros.calories} target={plan.targetCalories} label="Cal" color="calories" size={65} strokeWidth={5} />
                            <MacroRing value={totalMacros.protein} target={plan.targetProtein} label="Protein" color="protein" size={55} strokeWidth={4} />
                            <MacroRing value={totalMacros.carbs} target={plan.targetCarbs} label="Carbs" color="carbs" size={55} strokeWidth={4} />
                            <MacroRing value={totalMacros.fats} target={plan.targetFats} label="Fats" color="fats" size={55} strokeWidth={4} />
                        </div>
                    </div>

                    {/* Meal Cards */}
                    <div className="space-y-3">
                        {plan.meals.map((meal, idx) => (
                            <MealCard
                                key={idx}
                                meal={meal}
                                index={idx}
                                onRegenerate={regenerateMeal}
                                isRegenerating={regeneratingIdx === idx}
                            />
                        ))}
                    </div>

                    {/* Disclaimer per PRD risk mitigation */}
                    <p className="text-[10px] text-text-muted text-center mt-6 leading-relaxed">
                        ⚠️ Educational only. Consult a registered dietitian for medical nutrition therapy.
                    </p>
                </>
            )}
        </div>
    );
};

export default MealPlan;
