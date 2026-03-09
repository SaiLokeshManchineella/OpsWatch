import { Task } from '@/context/TaskContext';

export const detectDelays = (tasks: Task[]): Task[] => {
  const now = new Date();
  return tasks.map(task => {
    if (task.status !== 'Completed' && new Date(task.expectedCompletionTime) < now) {
      return { ...task, status: 'Delayed' as const };
    }
    return task;
  });
};
