import React from 'react';
import { Pencil, Trash2, ClipboardList } from 'lucide-react';
import { Task } from '@/context/TaskContext';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/utils/formatters';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onNewTask: () => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEdit, onDelete, onNewTask }) => {

  if (tasks.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-white/5">
        <EmptyState
          icon={<ClipboardList className="w-16 h-16 text-primary/30" />}
          title="No tasks found"
          description="Ready to start something new today?"
          action={
            <button onClick={onNewTask} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold btn-interact cursor-pointer shadow-lg shadow-primary/20">
              Create First Task
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            {['Title', 'Description', 'Team', 'Priority', 'Status', 'Expected Completion', 'Actions'].map(h => (
              <th key={h} className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-6 py-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tasks.map(task => (
            <tr key={task.id} className="table-row-hover transition-all duration-200 group">
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors max-w-[180px] truncate">{task.title}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs text-muted-foreground max-w-[200px] truncate font-medium">{task.description}</p>
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{task.team}</td>
              <td className="px-6 py-4"><PriorityBadge priority={task.priority} /></td>
              <td className="px-6 py-4"><StatusBadge status={task.status} /></td>
              <td className="px-6 py-4 text-sm text-muted-foreground font-medium whitespace-nowrap">
                {formatDate(task.expectedCompletionTime)}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 justify-end">
                  <button onClick={() => onEdit(task)} className="p-2 rounded-xl hover:bg-warning/20 text-warning transition-all cursor-pointer group/action">
                    <Pencil className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                  </button>
                  <button onClick={() => onDelete(task.id)} className="p-2 rounded-xl hover:bg-danger/20 text-danger transition-all cursor-pointer group/action">
                    <Trash2 className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
