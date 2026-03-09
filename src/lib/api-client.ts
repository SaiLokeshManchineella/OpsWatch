import { api } from './api';
import { Task, Priority, Status } from '@/context/TaskContext';

export interface DashboardStats {
    total: number;
    in_progress: number;
    delayed: number;
    completed: number;
}

export interface InsightsData {
    completion_percentage: number;
    avg_delay_hours: number;
    by_priority: { label: string; value: number; color: string }[];
    by_status: { label: string; value: number; color: string }[];
    by_team: { label: string; value: number; color: string }[];
}


export const getDashboardStats = async () => {
    const { data } = await api.get('/dashboard/stats');
    return data;
};

export const getDashboardInsights = async () => {
    const { data } = await api.get('/dashboard/insights');
    return data;
};

export const getDashboardAlerts = async () => {
    const { data } = await api.get('/dashboard/alerts');
    return data.map((t: any) => ({
        ...t,
        expectedCompletionTime: t.expected_completion_time,
        team: t.team ? t.team.name : 'Unknown',
    }));
};

export interface PaginatedTasks {
    items: Task[];
    total: number;
    page: number;
    size: number;
}

export const fetchTasks = async (filters?: { status?: string; priority?: string; search?: string, skip?: number, limit?: number }) => {
    const { data } = await api.get('/tasks/', { params: filters });

    return {
        ...data,
        items: data.items.map((t: any) => ({
            ...t,
            expectedCompletionTime: t.expected_completion_time,
            team: t.team ? t.team.name : 'Unknown',
        }))
    };
};

export const createTaskAPI = async (task: Omit<Task, 'id'>, teamId: string) => {
    const { expectedCompletionTime, ...rest } = task as any;
    const { data } = await api.post('/tasks/', {
        ...rest,
        expected_completion_time: expectedCompletionTime,
        team_id: teamId
    });
    return data;
};

export const updateTaskAPI = async (id: string, updates: Partial<Task>, teamId?: string) => {
    const { expectedCompletionTime, ...rest } = updates as any;
    const payload: any = { ...rest };
    if (expectedCompletionTime) payload.expected_completion_time = expectedCompletionTime;
    if (teamId) payload.team_id = teamId;

    const { data } = await api.put(`/tasks/${id}`, payload);
    return data;
};

export const deleteTaskAPI = async (id: string) => {
    await api.delete(`/tasks/${id}`);
};

export const fetchTeams = async () => {
    const { data } = await api.get('/teams/');
    return data;
};
