import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { DelayedTasksTable } from '@/components/dashboard/DelayedTasksTable';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { TaskDetailModal } from '@/components/common/TaskDetailModal';
import { useTasks, Task } from '@/context/TaskContext';
import { getDashboardStats, getDashboardInsights, getDashboardAlerts, fetchTasks, DashboardStats, InsightsData } from '@/lib/api-client';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, updateTask, isLoading: contextLoading } = useTasks();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [topDelayed, setTopDelayed] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, insightsData, alertsData, delayedData] = await Promise.all([
        getDashboardStats(),
        getDashboardInsights(),
        getDashboardAlerts(),
        fetchTasks({ status: 'Delayed', limit: 100 })
      ]);
      setStats(statsData);
      setInsights(insightsData);

      // Map alerts similar to tasks
      setAlerts(alertsData.map((t: any) => ({
        ...t,
        team: t.team ? t.team.name : 'Unknown',
      })));

      setTopDelayed(delayedData.items
        .sort((a, b) => new Date(a.expectedCompletionTime).getTime() - new Date(b.expectedCompletionTime).getTime())
        .slice(0, 5)
      );
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Refresh when component mounts

  // Re-fetch dashboard when tasks change (e.g. from WebSocket updates)
  useEffect(() => {
    if (!contextLoading) {
      fetchDashboardData();
    }
  }, [tasks, contextLoading]);

  const handleMarkComplete = async (id: string) => {
    toast.promise(updateTask(id, { status: 'Completed' }), {
      loading: 'Marking Complete...',
      success: 'Task completed',
      error: 'Failed to update task'
    });
    // The context updateTask will trigger the useEffect above to refresh dashboard stats
  };

  const isLoading = loading || contextLoading;

  if (isLoading && !stats) {
    return (
      <div>
        <Header title="Operations Dashboard" subtitle="Real-time workflow monitoring" />
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Operations Dashboard" subtitle="Real-time workflow monitoring" />
      <div className="p-6 space-y-6 animate-fade-slide-up">
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={ClipboardList} iconBg="bg-muted text-foreground" label="Total Tasks" value={stats.total} onClick={() => navigate('/tasks')} />
            <StatCard icon={Activity} iconBg="bg-warning/10 text-warning" label="In Progress" value={stats.in_progress} onClick={() => navigate('/tasks?status=In Progress')} />
            <StatCard icon={AlertCircle} iconBg="bg-danger/10 text-danger" label="Delayed Tasks" value={stats.delayed} onClick={() => navigate('/tasks?status=Delayed')} />
            <StatCard icon={CheckCircle} iconBg="bg-success text-success-foreground" label="Completed" value={stats.completed} onClick={() => navigate('/tasks?status=Completed')} />
          </div>
        )}

        {alerts.length > 0 && <AlertsPanel alerts={alerts} onAlertClick={(task) => setSelectedTask(task)} />}

        <DelayedTasksTable tasks={topDelayed} onMarkComplete={handleMarkComplete} />

        {insights && <InsightsPanel insights={insights} />}
      </div>
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
};

export default DashboardPage;
