import React, { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useLayout } from './Layout';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC<{ title: string; subtitle?: string; children?: React.ReactNode }> = ({ title, subtitle, children }) => {
  const { onMenuClick } = useLayout();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-white/5 shadow-sm">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-muted cursor-pointer">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {children}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
