import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Task } from '@/context/TaskContext';
import { PriorityBadge } from '@/components/tasks/PriorityBadge';
import { formatOverdue } from '@/utils/formatters';
import { EmptyState } from '@/components/common/EmptyState';
import { TaskDetailModal } from '@/components/common/TaskDetailModal';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DelayedTasksTableProps {
  tasks: Task[];
  onMarkComplete: (id: string) => void;
}

export const DelayedTasksTable: React.FC<DelayedTasksTableProps> = ({ tasks, onMarkComplete }) => {
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const delayed = tasks; // DashboardPage now provides pre-sorted top 5

  const handleMarkComplete = (task: Task) => {
    onMarkComplete(task.id);
    toast.success(`"${task.title}" marked as completed`);
  };

  return (
    <>
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 p-6 border-b border-white/5 bg-white/5">
          <div className="p-2 rounded-lg bg-danger/10">
            <Clock className="w-5 h-5 text-danger" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground outfit-font">Top Delayed Tasks</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Critical items requiring attention</p>
          </div>
        </div>
        {delayed.length === 0 ? (
          <EmptyState
            icon={<CheckCircle className="w-12 h-12 text-primary/50" />}
            title="All caught up!"
            description="There are no delayed tasks at the moment."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-6 py-4">Task Title</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-6 py-4">Team</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-6 py-4">Priority</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-6 py-4">Overdue By</th>
                  <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {delayed.map(task => (
                  <tr key={task.id} className="table-row-hover transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{task.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{task.team}</td>
                    <td className="px-6 py-4"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/20">
                        {formatOverdue(task.expectedCompletionTime)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setViewingTask(task)}
                          className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-muted/50 text-foreground rounded-lg hover:bg-muted transition-all btn-interact cursor-pointer border border-white/5 shadow-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleMarkComplete(task)}
                          className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all btn-interact cursor-pointer shadow-sm"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <TaskDetailModal task={viewingTask} onClose={() => setViewingTask(null)} />
    </>
  );
};
