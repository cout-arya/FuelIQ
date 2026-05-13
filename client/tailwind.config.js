/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#FF6B35",       // Warm Orange — food/energy
                "primary-dark": "#E55A2B",
                "primary-light": "#FF8A5C",
                secondary: "#004E64",     // Deep Teal — trust/health
                accent: "#25A18E",        // Mint Green — fresh/healthy
                "accent-light": "#2EC4A8",
                surface: "#0A0A0F",       // Near Black
                "surface-2": "#14141F",   // Card backgrounds
                "surface-3": "#1E1E2E",   // Elevated surfaces
                "surface-4": "#282840",   // Hover states
                "text-primary": "#F5F5F5",
                "text-secondary": "#A0A0B0",
                "text-muted": "#6B6B80",
                success: "#10B981",
                warning: "#F59E0B",
                error: "#EF4444",
                protein: "#8B5CF6",       // Purple for protein
                carbs: "#F59E0B",         // Amber for carbs
                fats: "#EC4899",          // Pink for fats
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.25rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-soft': 'pulseSoft 2s infinite',
                'ring-fill': 'ringFill 1s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                ringFill: {
                    '0%': { strokeDashoffset: '283' },
                    '100%': { strokeDashoffset: 'var(--ring-offset)' },
                },
            }
        },
    },
    plugins: [],
}
