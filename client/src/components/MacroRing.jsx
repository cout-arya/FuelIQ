const MacroRing = ({ value, target, label, color, size = 80, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    const offset = circumference - (percentage / 100) * circumference;

    const colorMap = {
        primary: '#FF6B35',
        protein: '#8B5CF6',
        carbs: '#F59E0B',
        fats: '#EC4899',
        accent: '#25A18E',
        calories: '#FF6B35',
    };

    const strokeColor = colorMap[color] || color || '#FF6B35';

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="macro-ring"
                        style={{ filter: `drop-shadow(0 0 4px ${strokeColor}40)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-text-primary">{Math.round(value)}</span>
                    {size >= 70 && (
                        <span className="text-[9px] text-text-muted">/ {target}</span>
                    )}
                </div>
            </div>
            {label && (
                <span className="text-[11px] font-medium text-text-secondary">{label}</span>
            )}
        </div>
    );
};

export default MacroRing;
