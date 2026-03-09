import React from 'react';
import { cn } from '@/lib/utils';
import { Status } from '@/context/TaskContext';

const statusStyles: Record<Status, string> = {
  Pending: 'bg-muted text-muted-foreground border-muted-foreground/10',
  'In Progress': 'bg-primary/20 text-primary border-primary/25 shadow-[0_0_15px_rgba(20,184,166,0.1)]',
  Completed: 'bg-success/20 text-success border-success/25 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
  Delayed: 'bg-danger/20 text-danger border-danger/25 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
};

export const StatusBadge: React.FC<{ status: Status; className?: string }> = ({ status, className }) => (
  <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-300', statusStyles[status], className)}>
    {status}
  </span>
);
