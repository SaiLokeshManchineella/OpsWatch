import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Task } from '@/context/TaskContext';

interface AlertsPanelProps {
  alerts: Task[];
  onAlertClick?: (task: Task) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAlertClick }) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = alerts.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="bg-[hsl(var(--alert-bg))] dark:bg-[hsl(var(--alert-bg))/0.6] backdrop-blur-md border-l-4 border-[hsl(var(--alert-border))] rounded-2xl p-5 shadow-lg animate-pulse-glow transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--alert-border))] animate-pulse-dot shadow-[0_0_8px_hsl(var(--alert-border))]" />
        <h3 className="text-base font-bold text-[hsl(var(--alert-text))] outfit-font">🚨 Active Operational Alerts</h3>
      </div>
      <div className="space-y-2">
        {visible.map(alert => (
          <div
            key={alert.id}
            onClick={() => onAlertClick?.(alert)}
            className="flex items-center justify-between bg-card/50 dark:bg-muted/30 backdrop-blur-sm rounded-lg p-3 shadow-sm border-l-2 border-[hsl(var(--alert-border))/0.4] cursor-pointer hover:bg-accent/50 dark:hover:bg-accent/20 transition-all group"
          >
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{alert.title}</p>
              <p className="text-xs text-[hsl(var(--alert-text))/0.8] font-medium">High priority task is delayed</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setDismissed(prev => new Set(prev).add(alert.id)); }}
              className="p-1.5 rounded-full hover:bg-[hsl(var(--alert-bg))] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-[hsl(var(--alert-text))]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
