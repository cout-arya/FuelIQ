import { IoTime, IoNutrition } from 'react-icons/io5';

const FoodLogEntry = ({ log }) => {
    const mealIcons = {
        breakfast: '🌅',
        lunch: '☀️',
        snack: '🍎',
        dinner: '🌙',
        other: '🍽️',
    };

    const timeStr = new Date(log.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <div className="glass-card rounded-xl p-3 animate-slide-up">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5 flex-1">
                    <span className="text-lg mt-0.5">{mealIcons[log.mealType] || '🍽️'}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                            {log.rawInput}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs font-semibold text-primary">
                                {log.totalCalories} kcal
                            </span>
                            <span className="text-xs text-purple-400">
                                P: {log.totalProtein}g
                            </span>
                            <span className="text-xs text-amber-400">
                                C: {log.totalCarbs}g
                            </span>
                            <span className="text-xs text-pink-400">
                                F: {log.totalFats}g
                            </span>
                        </div>
                        {log.parsedItems && log.parsedItems.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {log.parsedItems.map((item, i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-secondary">
                                        {item.foodName}
                                        {item.ragSourceId && (
                                            <span className="ml-1 text-accent" title="ICMR/NIN verified">✓</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">
                    {timeStr}
                </span>
            </div>
        </div>
    );
};

export default FoodLogEntry;
