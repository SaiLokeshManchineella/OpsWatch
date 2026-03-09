import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className={cn("w-9 h-9 rounded-lg bg-muted/20 animate-pulse", className)} />;

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                "relative p-2 rounded-lg transition-all duration-300 btn-interact group overflow-hidden",
                "bg-muted/40 hover:bg-muted text-foreground/80 hover:text-foreground border border-white/5",
                className
            )}
            aria-label="Toggle theme"
        >
            <div className="relative z-10 flex items-center justify-center">
                {isDark ? (
                    <Sun className="w-5 h-5 transition-all duration-500 rotate-0 scale-100 group-hover:text-primary" />
                ) : (
                    <Moon className="w-5 h-5 transition-all duration-500 rotate-0 scale-100 group-hover:text-secondary" />
                )}
            </div>

            {/* Subtle hover glow */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300",
                isDark ? "bg-primary blur-xl" : "bg-secondary blur-xl"
            )} />
        </button>
    );
};
