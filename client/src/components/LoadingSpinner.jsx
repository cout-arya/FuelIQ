const LoadingSpinner = ({ text = 'Loading...' }) => {
    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 border-3 border-surface-3 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-b-accent rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            </div>
            <p className="text-sm text-text-secondary animate-pulse-soft">{text}</p>
        </div>
    );
};

export default LoadingSpinner;
