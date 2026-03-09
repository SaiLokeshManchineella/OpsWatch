import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  label: string;
  value: number;
  trend?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, iconBg, label, value, trend, className, onClick }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = 600;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        'glass-panel rounded-2xl p-6 card-hover group',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg', iconBg)}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-4xl font-extrabold text-foreground outfit-font animate-count-up tracking-tight">
        {formatNumber(displayValue)}
      </p>
      <p className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
      {trend && <p className="text-xs text-primary mt-2 font-semibold flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        {trend}
      </p>}
    </div>
  );
};
