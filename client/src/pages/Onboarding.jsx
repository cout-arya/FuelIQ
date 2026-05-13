import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoFlame, IoChevronForward, IoChevronBack } from 'react-icons/io5';
import axios from 'axios';
import toast from 'react-hot-toast';

const STEPS = [
    { key: 'basics', title: 'About You', subtitle: 'Basic body metrics for accurate TDEE' },
    { key: 'diet', title: 'Dietary Profile', subtitle: 'So we never suggest food you don\'t eat' },
    { key: 'training', title: 'Training', subtitle: 'We adjust carbs on training vs rest days' },
    { key: 'preferences', title: 'Preferences', subtitle: 'Cuisine style and budget' },
];

const Onboarding = () => {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const { updateUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        age: '',
        gender: 'Male',
        height: '',
        weight: '',
        dietaryProfile: 'non_vegetarian',
        goal: 'maintenance',
        activityLevel: 'moderately_active',
        trainingSchedule: { daysPerWeek: 4, timing: 'evening' },
        regionalCuisine: 'no_preference',
        budgetTier: '300',
    });

    const updateField = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleComplete = async () => {
        if (!profile.age || !profile.height || !profile.weight) {
            return toast.error('Please fill in your body metrics');
        }

        setLoading(true);
        try {
            const { data } = await axios.post('/users/complete-onboarding', {
                profile: {
                    ...profile,
                    age: Number(profile.age),
                    height: Number(profile.height),
                    weight: Number(profile.weight),
                }
            });
            updateUser(data);
            toast.success('Profile set up! Let\'s fuel your goals 🔥');
            navigate('/home');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const OptionButton = ({ label, value, current, onChange, emoji }) => (
        <button
            type="button"
            onClick={() => onChange(value)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                current === value
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-surface-2 border-white/5 text-text-secondary hover:border-white/10'
            }`}
        >
            {emoji && <span className="mr-1.5">{emoji}</span>}
            {label}
        </button>
    );

    const renderStep = () => {
        switch (step) {
            case 0: // Basics
                return (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Age</label>
                                <input type="number" value={profile.age} onChange={e => updateField('age', e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary focus:border-primary/30" placeholder="25" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Gender</label>
                                <select value={profile.gender} onChange={e => updateField('gender', e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary focus:border-primary/30">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Height (cm)</label>
                                <input type="number" value={profile.height} onChange={e => updateField('height', e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary focus:border-primary/30" placeholder="170" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1.5">Weight (kg)</label>
                                <input type="number" value={profile.weight} onChange={e => updateField('weight', e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary focus:border-primary/30" placeholder="70" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-2">Goal</label>
                            <div className="grid grid-cols-2 gap-2">
                                <OptionButton label="Muscle Gain" value="muscle_gain" current={profile.goal} onChange={v => updateField('goal', v)} emoji="💪" />
                                <OptionButton label="Fat Loss" value="fat_loss" current={profile.goal} onChange={v => updateField('goal', v)} emoji="🔥" />
                                <OptionButton label="Maintenance" value="maintenance" current={profile.goal} onChange={v => updateField('goal', v)} emoji="⚖️" />
                                <OptionButton label="Endurance" value="endurance" current={profile.goal} onChange={v => updateField('goal', v)} emoji="🏃" />
                            </div>
                        </div>
                    </div>
                );

            case 1: // Diet
                return (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-2">Dietary Profile</label>
                            <div className="grid grid-cols-2 gap-2">
                                <OptionButton label="Non-Veg" value="non_vegetarian" current={profile.dietaryProfile} onChange={v => updateField('dietaryProfile', v)} emoji="🍗" />
                                <OptionButton label="Vegetarian" value="vegetarian" current={profile.dietaryProfile} onChange={v => updateField('dietaryProfile', v)} emoji="🥬" />
                                <OptionButton label="Eggetarian" value="eggetarian" current={profile.dietaryProfile} onChange={v => updateField('dietaryProfile', v)} emoji="🥚" />
                                <OptionButton label="Vegan" value="vegan" current={profile.dietaryProfile} onChange={v => updateField('dietaryProfile', v)} emoji="🌱" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-2">Activity Level</label>
                            <div className="grid grid-cols-1 gap-2">
                                <OptionButton label="Sedentary (desk job, no exercise)" value="sedentary" current={profile.activityLevel} onChange={v => updateField('activityLevel', v)} />
                                <OptionButton label="Lightly Active (1-3 days/week)" value="lightly_active" current={profile.activityLevel} onChange={v => updateField('activityLevel', v)} />
                                <OptionButton label="Moderately Active (3-5 days/week)" value="moderately_active" current={profile.activityLevel} onChange={v => updateField('activityLevel', v)} />
                                <OptionButton label="Very Active (6-7 days/week)" value="very_active" current={profile.activityLevel} onChange={v => updateField('activityLevel', v)} />
                            </div>
                        </div>
                    </div>
                );

            case 2: // Training
                return (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-2">
                                Gym days per week: <span className="text-primary font-bold">{profile.trainingSchedule.daysPerWeek}</span>
                            </label>
                            <input type="range" min="0" max="7" value={profile.trainingSchedule.daysPerWeek}
                                onChange={e => setProfile(prev => ({ ...prev, trainingSchedule: { ...prev.trainingSchedule, daysPerWeek: Number(e.target.value) } }))}
                                className="w-full accent-primary" />
                            <div className="flex justify-between text-[10px] text-text-muted mt-1">
                                <span>0</span><span>3</span><span>5</span><span>7</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-2">Workout Timing</label>
                            <div className="grid grid-cols-3 gap-2">
                                <OptionButton label="Morning" value="morning" current={profile.trainingSchedule.timing}
                                    onChange={v => setProfile(prev => ({ ...prev, trainingSchedule: { ...prev.trainingSchedule, timing: v } }))} emoji="🌅" />
                                <OptionButton label="Evening" value="evening" current={profile.trainingSchedule.timing}
                                    onChange={v => setProfile(prev => ({ ...prev, trainingSchedule: { ...prev.trainingSchedule, timing: v } }))} emoji="🌇" />
                                <OptionButton label="Varies" value="varies" current={profile.trainingSchedule.timing}
                                    onChange={v => setProfile(prev => ({ ...prev, trainingSchedule: { ...prev.trainingSchedule, timing: v } }))} emoji="🔄" />
                            </div>
                        </div>
                    </div>
                );

            case 3: // Preferences
                return (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-2">Regional Cuisine</label>
                            <div className="grid grid-cols-2 gap-2">
                                <OptionButton label="North Indian" value="north_indian" current={profile.regionalCuisine} onChange={v => updateField('regionalCuisine', v)} />
                                <OptionButton label="South Indian" value="south_indian" current={profile.regionalCuisine} onChange={v => updateField('regionalCuisine', v)} />
                                <OptionButton label="Bengali" value="bengali" current={profile.regionalCuisine} onChange={v => updateField('regionalCuisine', v)} />
                                <OptionButton label="Gujarati" value="gujarati" current={profile.regionalCuisine} onChange={v => updateField('regionalCuisine', v)} />
                                <OptionButton label="No Preference" value="no_preference" current={profile.regionalCuisine} onChange={v => updateField('regionalCuisine', v)} emoji="🇮🇳" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-2">Daily Food Budget</label>
                            <div className="grid grid-cols-2 gap-2">
                                <OptionButton label="₹150/day" value="150" current={profile.budgetTier} onChange={v => updateField('budgetTier', v)} />
                                <OptionButton label="₹300/day" value="300" current={profile.budgetTier} onChange={v => updateField('budgetTier', v)} />
                                <OptionButton label="₹500/day" value="500" current={profile.budgetTier} onChange={v => updateField('budgetTier', v)} />
                                <OptionButton label="No limit" value="no_constraint" current={profile.budgetTier} onChange={v => updateField('budgetTier', v)} />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-surface px-6 py-8">
            <div className="max-w-sm mx-auto">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <IoFlame className="text-primary" size={24} />
                    <span className="text-lg font-bold">
                        Fuel<span className="text-primary">IQ</span>
                    </span>
                </div>

                {/* Progress */}
                <div className="flex gap-1.5 mb-6">
                    {STEPS.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-surface-3'}`} />
                    ))}
                </div>

                {/* Step header */}
                <h2 className="text-xl font-bold mb-1">{STEPS[step].title}</h2>
                <p className="text-sm text-text-secondary mb-6">{STEPS[step].subtitle}</p>

                {/* Step content */}
                {renderStep()}

                {/* Navigation */}
                <div className="flex items-center gap-3 mt-8">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-1 px-5 py-3 bg-surface-3 hover:bg-surface-4 rounded-xl text-sm font-medium text-text-secondary transition-all"
                        >
                            <IoChevronBack size={16} /> Back
                        </button>
                    )}
                    <button
                        onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : handleComplete}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : step < STEPS.length - 1 ? (
                            <>Next <IoChevronForward size={16} /></>
                        ) : (
                            <>Start Tracking 🔥</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
