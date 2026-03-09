import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskTable } from '@/components/tasks/TaskTable';
import { TaskSlideOver } from '@/components/tasks/TaskSlideOver';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useTasks, Task, Priority, Status } from '@/context/TaskContext';
import { toast } from 'sonner';

const TaskManagerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = (searchParams.get('status') as Status) || 'All';
  const { tasks, addTask, updateTask, deleteTask, totalTasks, currentPage, setPage, fetchWithFilters } = useTasks();
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [search, setSearch] = useState('');
  const [slideOpen, setSlideOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const filters: any = {};
    if (statusFilter !== 'All') filters.status = statusFilter;
    if (priorityFilter !== 'All') filters.priority = priorityFilter;
    if (search) filters.search = search;

    const timer = setTimeout(() => {
      fetchWithFilters(filters);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, search]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setSlideOpen(true);
  };

  const handleNew = () => {
    setEditingTask(null);
    setSlideOpen(true);
  };

  const handleSubmit = async (data: Omit<Task, 'id'>) => {
    const isEdit = !!editingTask;
    const promise = isEdit
      ? updateTask(editingTask.id, data)
      : addTask(data);

    toast.promise(promise, {
      loading: isEdit ? 'Updating task...' : 'Creating task...',
      success: (success) => success ? `"${data.title}" ${isEdit ? 'updated' : 'created'} successfully` : 'Error',
      error: `Failed to ${isEdit ? 'update' : 'create'} task`
    });
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      const task = tasks.find(t => t.id === deletingId);
      deleteTask(deletingId);
      toast.success(`"${task?.title}" deleted`);
      setDeletingId(null);
    }
  };

  return (
    <div>
      <Header title="Task Manager" subtitle="Create and manage operational tasks">
        <button onClick={handleNew} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold btn-interact cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
          <Plus className="w-5 h-5" /> New Task
        </button>
      </Header>
      <div className="p-6 space-y-6 animate-fade-slide-up">
        <TaskFilters
          statusFilter={statusFilter} priorityFilter={priorityFilter} search={search}
          onStatusChange={setStatusFilter} onPriorityChange={setPriorityFilter} onSearchChange={setSearch}
        />

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <TaskTable tasks={tasks} onEdit={handleEdit} onDelete={id => setDeletingId(id)} onNewTask={handleNew} />

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-6 border-t border-white/5 bg-white/[0.02]">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Showing <span className="text-foreground outfit-font ml-1">{tasks.length > 0 ? (currentPage - 1) * 10 + 1 : 0}</span> — <span className="text-foreground outfit-font">{Math.min(currentPage * 10, totalTasks)}</span> of <span className="text-foreground outfit-font">{totalTasks}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-muted/30 text-foreground border border-white/5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-all btn-interact cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage * 10 >= totalTasks}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-muted/30 text-foreground border border-white/5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-all btn-interact cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <TaskSlideOver open={slideOpen} task={editingTask} onClose={() => setSlideOpen(false)} onSubmit={handleSubmit} />
      <ConfirmDialog
        open={!!deletingId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default TaskManagerPage;
