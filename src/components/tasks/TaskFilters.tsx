import React from 'react';
import { Search } from 'lucide-react';
import { Priority, Status } from '@/context/TaskContext';
import { cn } from '@/lib/utils';

interface TaskFiltersProps {
  statusFilter: Status | 'All';
  priorityFilter: Priority | 'All';
  search: string;
  onStatusChange: (s: Status | 'All') => void;
  onPriorityChange: (p: Priority | 'All') => void;
  onSearchChange: (s: string) => void;
}

const statuses: (Status | 'All')[] = ['All', 'Pending', 'In Progress', 'Completed', 'Delayed'];
const priorities: (Priority | 'All')[] = ['All', 'High', 'Medium', 'Low'];

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter, priorityFilter, search,
  onStatusChange, onPriorityChange, onSearchChange,
}) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[280px] max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Quick search tasks..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-5 py-3 rounded-2xl border border-white/5 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground focus:bg-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none"
        />
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">Status:</span>
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >{s}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">Priority:</span>
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
          {priorities.map(p => (
            <button
              key={p}
              onClick={() => onPriorityChange(p)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
                priorityFilter === p
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >{p}</button>
          ))}
        </div>
      </div>
    </div>
  </div>
);
