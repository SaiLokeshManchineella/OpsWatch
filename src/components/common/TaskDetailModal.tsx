import React from 'react';
import { X } from 'lucide-react';
import { Task } from '@/context/TaskContext';
import { PriorityBadge } from '@/components/tasks/PriorityBadge';
import { StatusBadge } from '@/components/tasks/StatusBadge';
import { formatDate, formatOverdue } from '@/utils/formatters';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  const isDelayed = task.status === 'Delayed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg animate-fade-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Task Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Title</p>
            <p className="text-base font-semibold text-foreground">{task.title}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Team</p>
              <p className="text-sm text-foreground">{task.team}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Priority</p>
              <PriorityBadge priority={task.priority} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
              <StatusBadge status={task.status} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Expected Completion</p>
              <p className="text-sm text-foreground">{formatDate(task.expectedCompletionTime)}</p>
            </div>
          </div>
          {isDelayed && (
            <div className="bg-[#FEF2F2] border border-danger/20 rounded-lg p-3">
              <p className="text-sm font-medium text-danger">⏰ {formatOverdue(task.expectedCompletionTime)}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button onClick={onClose} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold btn-interact cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
