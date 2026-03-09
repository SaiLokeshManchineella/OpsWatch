import { describe, it, expect } from 'vitest';
import { detectDelays } from './delayDetection';
import { Task } from '@/context/TaskContext';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
    id: '1',
    title: 'Test Task',
    description: 'desc',
    team: 'Engineering',
    priority: 'Medium',
    status: 'Pending',
    expectedCompletionTime: new Date(Date.now() + 86400000).toISOString(), // future
    ...overrides,
});

describe('detectDelays', () => {
    it('marks overdue non-completed tasks as Delayed', () => {
        const tasks = [makeTask({
            status: 'In Progress',
            expectedCompletionTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        })];
        const result = detectDelays(tasks);
        expect(result[0].status).toBe('Delayed');
    });

    it('does NOT mark Completed tasks as Delayed even if overdue', () => {
        const tasks = [makeTask({
            status: 'Completed',
            expectedCompletionTime: new Date(Date.now() - 3600000).toISOString(),
        })];
        const result = detectDelays(tasks);
        expect(result[0].status).toBe('Completed');
    });

    it('leaves on-time tasks unchanged', () => {
        const tasks = [makeTask({ status: 'In Progress' })]; // future date by default
        const result = detectDelays(tasks);
        expect(result[0].status).toBe('In Progress');
    });

    it('handles empty array', () => {
        const result = detectDelays([]);
        expect(result).toEqual([]);
    });

    it('returns new task objects (immutable)', () => {
        const original = makeTask({
            status: 'Pending',
            expectedCompletionTime: new Date(Date.now() - 3600000).toISOString(),
        });
        const result = detectDelays([original]);
        expect(result[0]).not.toBe(original); // new object
        expect(result[0].status).toBe('Delayed');
        expect(original.status).toBe('Pending'); // original unchanged
    });
});
