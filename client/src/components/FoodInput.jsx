import { useState } from 'react';
import { IoSend, IoFlash } from 'react-icons/io5';

const FoodInput = ({ onSubmit, isLoading }) => {
    const [text, setText] = useState('');

    const placeholders = [
        '2 roti with aloo sabzi and dahi...',
        'ate paratha from dhaba...',
        'protein shake with banana...',
        'idli sambar breakfast...',
        '3 ande ka omelette with toast...',
        'rajma chawal with salad...',
        'poha with peanuts...',
        'chole bhature from restaurant...',
    ];

    const [placeholder] = useState(
        placeholders[Math.floor(Math.random() * placeholders.length)]
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || isLoading) return;
        onSubmit(text.trim());
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="glass-card rounded-2xl p-1 glow-primary">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 pl-3 text-primary">
                        <IoFlash size={18} />
                    </div>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent py-3.5 px-2 text-sm text-text-primary placeholder-text-muted focus:outline-none"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || isLoading}
                        className="m-1 p-3 rounded-xl bg-primary hover:bg-primary-dark text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <IoSend size={16} />
                        )}
                    </button>
                </div>
            </div>
            <p className="text-[10px] text-text-muted mt-1.5 ml-2">
                Type in English or Hinglish — we understand both 🇮🇳
            </p>
        </form>
    );
};

export default FoodInput;
