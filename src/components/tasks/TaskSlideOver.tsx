import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTasks, Task, Priority, Status } from '@/context/TaskContext';
import { cn } from '@/lib/utils';

interface TaskSlideOverProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id'>) => void;
}

const priorities: Priority[] = ['Low', 'Medium', 'High'];
const statusOptions: Status[] = ['Pending', 'In Progress', 'Completed'];

const priorityColor: Record<Priority, string> = {
  Low: 'bg-muted text-foreground',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-danger/10 text-danger',
};
const priorityActiveColor: Record<Priority, string> = {
  Low: 'bg-muted-foreground text-primary-foreground',
  Medium: 'bg-warning text-primary-foreground',
  High: 'bg-danger text-primary-foreground',
};

export const TaskSlideOver: React.FC<TaskSlideOverProps> = ({ open, task, onClose, onSubmit }) => {
  const { teams } = useTasks();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    title: '', description: '', team: '', priority: 'Medium' as Priority,
    status: 'Pending' as Status, expectedCompletionTime: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title, description: task.description, team: task.team,
        priority: task.priority, status: task.status,
        expectedCompletionTime: task.expectedCompletionTime.slice(0, 16),
      });
    } else {
      setForm({ title: '', description: '', team: teams.length > 0 ? teams[0].name : '', priority: 'Medium', status: 'Pending', expectedCompletionTime: '' });
    }
  }, [task, open, teams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.team || !form.expectedCompletionTime) return;
    onSubmit({ ...form, expectedCompletionTime: new Date(form.expectedCompletionTime).toISOString() });
    onClose();
  };

  const handleFooterSubmit = () => {
    formRef.current?.requestSubmit();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-card shadow-2xl rounded-l-2xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
          <h2 className="text-lg font-bold text-foreground">{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Task Title</label>
            <input
              required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground input-focus"
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              required value={form.description} rows={3}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground input-focus resize-none"
              placeholder="Enter task description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Assigned Team</label>
            <select
              required value={form.team}
              onChange={e => setForm(f => ({ ...f, team: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground input-focus cursor-pointer"
            >
              <option value="" disabled>Select a team</option>
              {teams.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
            <div className="flex gap-2">
              {priorities.map(p => (
                <button
                  key={p} type="button"
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer btn-interact',
                    form.priority === p ? priorityActiveColor[p] : priorityColor[p]
                  )}
                >{p}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground input-focus cursor-pointer"
            >
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              {form.status === 'Delayed' && <option value="Delayed" disabled>Delayed (Auto-assigned)</option>}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Expected Completion</label>
            <input
              required type="datetime-local" value={form.expectedCompletionTime}
              onChange={e => setForm(f => ({ ...f, expectedCompletionTime: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground input-focus cursor-pointer"
            />
          </div>
        </form>

        <div className="p-6 border-t border-border space-y-2 shrink-0">
          <button type="button" onClick={handleFooterSubmit} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold btn-interact cursor-pointer">
            {task ? 'Save Changes' : 'Create Task'}
          </button>
          <button type="button" onClick={onClose} className="w-full py-2.5 bg-card border border-border text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
