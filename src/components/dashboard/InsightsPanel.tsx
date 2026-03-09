import React from 'react';
import { InsightsData } from '@/lib/api-client';

interface InsightsPanelProps {
  insights: InsightsData;
}

const BarChart: React.FC<{ items: { label: string; value: number; color: string }[]; title: string }> = ({ items, title }) => {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm card-hover">
      <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold text-foreground">{item.value}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompletionRing: React.FC<{ percentage: number }> = ({ percentage }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm card-hover flex flex-col items-center justify-center">
      <h4 className="text-sm font-semibold text-foreground mb-4">Completion Rate</h4>
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <BarChart items={insights.by_priority} title="Tasks by Priority" />
      <BarChart items={insights.by_status} title="Tasks by Status" />
      <CompletionRing percentage={insights.completion_percentage} />
    </div>
  );
};
