import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { detectDelays } from '@/utils/delayDetection';
import { useAuth } from './AuthContext';
import { fetchTasks, createTaskAPI, updateTaskAPI, deleteTaskAPI, fetchTeams } from '@/lib/api-client';
import { toast } from 'sonner';

export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Pending' | 'In Progress' | 'Completed' | 'Delayed';

export interface Task {
  id: string;
  title: string;
  description: string;
  team: string;
  priority: Priority;
  status: Status;
  expectedCompletionTime: string;
}

interface Team {
  id: string;
  name: string;
}

interface TaskContextType {
  tasks: Task[];
  teams: Team[];
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<boolean>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
  totalTasks: number;
  currentPage: number;
  setPage: (page: number) => void;
  fetchWithFilters: (filters: any) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalTasks, setTotalTasks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<any>({});

  const loadData = useCallback(async (filters: any = currentFilters, page: number = currentPage) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const [teamsData, tasksData] = await Promise.all([
        fetchTeams(),
        fetchTasks({ ...filters, skip: (page - 1) * 10, limit: 10 })
      ]);
      setTeams(teamsData);

      // Perform delay detection in the UI as requested
      setTasks(detectDelays(tasksData.items));
      setTotalTasks(tasksData.total);
    } catch (err) {
      console.error("Failed to load task data", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentFilters, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  // WebSocket Connection for Real-Time Updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // e.g. from http://localhost:8000/api/v1 -> ws://localhost:8000/ws
    const apiUrl = new URL(import.meta.env.VITE_API_URL);
    const wsUrl = `${apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'}//${apiUrl.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (['task_created', 'task_updated', 'task_deleted'].includes(data.event)) {
          loadDataRef.current();
        }
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated]);

  // Periodic delay detection in the UI
  useEffect(() => {
    if (tasks.length === 0) return;
    const interval = setInterval(() => {
      setTasks(prev => detectDelays(prev));
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks.length]);

  const addTask = useCallback(async (task: Omit<Task, 'id'>) => {
    try {
      // Find team ID by name (SlideOver form provides name)
      // If team doesn't exist, we fallback to first team (or ideally handle this better)
      const teamId = teams.find(t => t.name.toLowerCase() === task.team.toLowerCase())?.id
        || teams[0]?.id;

      if (!teamId) throw new Error("Team not found");

      await createTaskAPI(task, teamId);
      await loadData(); // Reload all to get accurate IDs and relationships
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create task");
      return false;
    }
  }, [teams, loadData]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      let teamId;
      if (updates.team) {
        teamId = teams.find(t => t.name.toLowerCase() === updates.team?.toLowerCase())?.id;
      }

      const apiUpdates = { ...updates };
      delete apiUpdates.team; // Send team_id instead of string team name

      await updateTaskAPI(id, apiUpdates, teamId);
      await loadData();
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update task");
      return false;
    }
  }, [teams, loadData]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await deleteTaskAPI(id);
      await loadData(); // Reload to accurately update totalTasks and pagination
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete task");
      return false;
    }
  }, [loadData]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    loadData(currentFilters, page);
  }, [loadData, currentFilters]);

  const fetchWithFilters = useCallback(async (filters: any) => {
    setCurrentFilters(filters);
    setCurrentPage(1); // Reset to first page on filter change
    await loadData(filters, 1);
  }, [loadData]);

  return (
    <TaskContext.Provider value={{
      tasks, teams, isLoading, addTask, updateTask, deleteTask,
      refreshTasks: loadData, totalTasks, currentPage, setPage, fetchWithFilters
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};
