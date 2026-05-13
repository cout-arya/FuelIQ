import { IoRefresh } from 'react-icons/io5';

const MealCard = ({ meal, index, onRegenerate, isRegenerating }) => {
    const mealIcons = {
        breakfast: '🌅',
        lunch: '☀️',
        snack: '🍎',
        dinner: '🌙',
    };

    return (
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{mealIcons[meal.mealType] || '🍽️'}</span>
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary capitalize">
                            {meal.mealType}
                        </h3>
                        <p className="text-base font-medium text-primary">
                            {meal.foodName}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onRegenerate(index)}
                    disabled={isRegenerating}
                    className="p-2 rounded-xl bg-surface-3 hover:bg-surface-4 text-text-secondary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Regenerate this meal"
                >
                    <IoRefresh size={16} className={isRegenerating ? 'animate-spin' : ''} />
                </button>
            </div>

            {meal.description && (
                <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                    {meal.description}
                </p>
            )}

            <div className="flex items-center gap-3 text-xs">
                <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-semibold">
                    {meal.calories} kcal
                </span>
                <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 font-medium">
                    P: {meal.protein}g
                </span>
                <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-medium">
                    C: {meal.carbs}g
                </span>
                <span className="px-2 py-1 rounded-lg bg-pink-500/10 text-pink-400 font-medium">
                    F: {meal.fats}g
                </span>
            </div>
        </div>
    );
};

export default MealCard;
