import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoFlame, IoDownload, IoTrash, IoLogOut, IoChevronForward } from 'react-icons/io5';

const Settings = () => {
    const { user, updateUser, logout } = useAuth();
    const [profile, setProfile] = useState({
        age: '',
        gender: 'Male',
        height: '',
        weight: '',
        activityLevel: 'moderately_active',
        dietaryProfile: 'non_vegetarian',
        regionalCuisine: 'no_preference',
        goal: 'maintenance',
        budgetTier: '300',
        trainingSchedule: { daysPerWeek: 4, timing: 'evening' }
    });
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (user?.profile) {
            setProfile(prev => ({
                ...prev,
                ...user.profile,
                age: user.profile.age || '',
                height: user.profile.height || '',
                weight: user.profile.weight || '',
                trainingSchedule: user.profile.trainingSchedule || { daysPerWeek: 4, timing: 'evening' }
            }));
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axios.put('/users/profile', {
                profile: {
                    ...profile,
                    age: Number(profile.age),
                    height: Number(profile.height),
                    weight: Number(profile.weight),
                }
            });
            updateUser(data);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const response = await axios.get(`/export/${format}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `fueliq_export_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'json'}`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success(`Data exported as ${format.toUpperCase()}!`);
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axios.delete('/users/account');
            toast.success('Account deleted. Goodbye.');
            logout();
        } catch (err) {
            toast.error('Failed to delete account');
        }
    };

    const Section = ({ title, children }) => (
        <div className="mb-6">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{title}</h3>
            {children}
        </div>
    );

    const SelectField = ({ label, value, onChange, options }) => (
        <div className="mb-3">
            <label className="block text-xs text-text-secondary mb-1">{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-2 border border-white/5 rounded-xl text-sm text-text-primary focus:border-primary/30"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-lg font-bold">Settings</h1>
                <div className="flex items-center gap-2 text-text-muted">
                    <IoFlame className="text-primary" size={16} />
                    <span className="text-xs">{user?.email}</span>
                </div>
            </div>

            {/* Body Metrics */}
            <Section title="Body Metrics">
                <div className="glass-card rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">Age</label>
                            <input type="number" value={profile.age}
                                onChange={e => setProfile(p => ({ ...p, age: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-surface-3 border border-white/5 rounded-xl text-sm text-text-primary" />
                        </div>
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">Gender</label>
                            <select value={profile.gender}
                                onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-surface-3 border border-white/5 rounded-xl text-sm text-text-primary">
                                <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">Height (cm)</label>
                            <input type="number" value={profile.height}
                                onChange={e => setProfile(p => ({ ...p, height: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-surface-3 border border-white/5 rounded-xl text-sm text-text-primary" />
                        </div>
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">Weight (kg)</label>
                            <input type="number" value={profile.weight}
                                onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-surface-3 border border-white/5 rounded-xl text-sm text-text-primary" />
                        </div>
                    </div>
                </div>
            </Section>

            {/* Dietary */}
            <Section title="Diet & Goals">
                <div className="glass-card rounded-xl p-4">
                    <SelectField label="Goal" value={profile.goal}
                        onChange={v => setProfile(p => ({ ...p, goal: v }))}
                        options={[
                            { value: 'muscle_gain', label: '💪 Muscle Gain' },
                            { value: 'fat_loss', label: '🔥 Fat Loss' },
                            { value: 'maintenance', label: '⚖️ Maintenance' },
                            { value: 'endurance', label: '🏃 Endurance' },
                        ]}
                    />
                    <SelectField label="Dietary Profile" value={profile.dietaryProfile}
                        onChange={v => setProfile(p => ({ ...p, dietaryProfile: v }))}
                        options={[
                            { value: 'non_vegetarian', label: '🍗 Non-Vegetarian' },
                            { value: 'vegetarian', label: '🥬 Vegetarian' },
                            { value: 'eggetarian', label: '🥚 Eggetarian' },
                            { value: 'vegan', label: '🌱 Vegan' },
                        ]}
                    />
                    <SelectField label="Regional Cuisine" value={profile.regionalCuisine}
                        onChange={v => setProfile(p => ({ ...p, regionalCuisine: v }))}
                        options={[
                            { value: 'north_indian', label: 'North Indian' },
                            { value: 'south_indian', label: 'South Indian' },
                            { value: 'bengali', label: 'Bengali' },
                            { value: 'gujarati', label: 'Gujarati' },
                            { value: 'no_preference', label: '🇮🇳 No Preference' },
                        ]}
                    />
                    <SelectField label="Daily Food Budget" value={profile.budgetTier}
                        onChange={v => setProfile(p => ({ ...p, budgetTier: v }))}
                        options={[
                            { value: '150', label: '₹150/day' },
                            { value: '300', label: '₹300/day' },
                            { value: '500', label: '₹500/day' },
                            { value: 'no_constraint', label: 'No limit' },
                        ]}
                    />
                </div>
            </Section>

            {/* TDEE Display */}
            {user?.tdee && (
                <div className="glass-card rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-text-secondary">Your Daily Energy (TDEE)</p>
                        <p className="text-xl font-bold text-primary">{user.tdee} <span className="text-sm font-normal text-text-muted">kcal</span></p>
                    </div>
                    <p className="text-[10px] text-text-muted max-w-[140px]">
                        Calculated using Mifflin-St Jeor equation
                    </p>
                </div>
            )}

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] mb-8"
            >
                {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {/* Data Export — free, per PRD */}
            <Section title="Your Data">
                <div className="glass-card rounded-xl divide-y divide-white/5">
                    <button onClick={() => handleExport('json')}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-3 transition-all">
                        <div className="flex items-center gap-3">
                            <IoDownload className="text-accent" size={18} />
                            <div className="text-left">
                                <p className="text-sm font-medium text-text-primary">Export as JSON</p>
                                <p className="text-[10px] text-text-muted">Full data — import to other tools</p>
                            </div>
                        </div>
                        <IoChevronForward className="text-text-muted" size={16} />
                    </button>
                    <button onClick={() => handleExport('csv')}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-3 transition-all">
                        <div className="flex items-center gap-3">
                            <IoDownload className="text-accent" size={18} />
                            <div className="text-left">
                                <p className="text-sm font-medium text-text-primary">Export as CSV</p>
                                <p className="text-[10px] text-text-muted">Spreadsheet-friendly format</p>
                            </div>
                        </div>
                        <IoChevronForward className="text-text-muted" size={16} />
                    </button>
                </div>
                <p className="text-[10px] text-text-muted mt-2 ml-1">
                    Free forever. No paywall. Your data is yours.
                </p>
            </Section>

            {/* Account Actions */}
            <Section title="Account">
                <div className="glass-card rounded-xl divide-y divide-white/5">
                    <button onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-3 transition-all">
                        <IoLogOut className="text-warning" size={18} />
                        <span className="text-sm font-medium text-text-primary">Sign Out</span>
                    </button>
                    <button onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-3 transition-all">
                        <IoTrash className="text-error" size={18} />
                        <span className="text-sm font-medium text-error">Delete Account</span>
                    </button>
                </div>
            </Section>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6">
                    <div className="bg-surface-2 rounded-2xl p-6 max-w-sm w-full border border-white/5">
                        <h3 className="text-base font-bold text-error mb-2">Delete Account?</h3>
                        <p className="text-sm text-text-secondary mb-6">
                            This will permanently delete your account and all meal data. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2.5 bg-surface-3 hover:bg-surface-4 rounded-xl text-sm font-medium text-text-secondary transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDeleteAccount}
                                className="flex-1 py-2.5 bg-error hover:bg-red-600 rounded-xl text-sm font-semibold text-white transition-all">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
