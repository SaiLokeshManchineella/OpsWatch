import React from 'react';
import { cn } from '@/lib/utils';
import { Priority } from '@/context/TaskContext';

const priorityStyles: Record<Priority, string> = {
  High: 'bg-danger/15 text-danger border-danger/25 shadow-[0_0_12px_rgba(239,68,68,0.1)]',
  Medium: 'bg-warning/15 text-warning border-warning/25 shadow-[0_0_12px_rgba(245,158,11,0.1)]',
  Low: 'bg-muted text-muted-foreground border-muted-foreground/10',
};

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({ priority, className }) => (
  <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-300', priorityStyles[priority], className)}>
    <span className={cn('w-1 h-1 rounded-full mr-1.5', priority === 'High' ? 'bg-danger animate-pulse' : priority === 'Medium' ? 'bg-warning' : 'bg-muted-foreground')} />
    {priority}
  </span>
);
