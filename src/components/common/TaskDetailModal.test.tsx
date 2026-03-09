import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDetailModal } from './TaskDetailModal';
import { Task } from '@/context/TaskContext';

const mockTask: Task = {
    id: '1',
    title: 'Deploy Backend',
    description: 'Push the latest changes to production',
    team: 'Engineering',
    priority: 'High',
    status: 'In Progress',
    expectedCompletionTime: new Date(Date.now() + 86400000).toISOString(),
};

const delayedTask: Task = {
    ...mockTask,
    status: 'Delayed',
    expectedCompletionTime: new Date(Date.now() - 3600000).toISOString(),
};

describe('TaskDetailModal', () => {
    it('renders nothing when task is null', () => {
        const { container } = render(<TaskDetailModal task={null} onClose={() => { }} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders task title', () => {
        render(<TaskDetailModal task={mockTask} onClose={() => { }} />);
        expect(screen.getByText('Deploy Backend')).toBeInTheDocument();
    });

    it('renders task description', () => {
        render(<TaskDetailModal task={mockTask} onClose={() => { }} />);
        expect(screen.getByText('Push the latest changes to production')).toBeInTheDocument();
    });

    it('renders team name', () => {
        render(<TaskDetailModal task={mockTask} onClose={() => { }} />);
        expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('renders header "Task Details"', () => {
        render(<TaskDetailModal task={mockTask} onClose={() => { }} />);
        expect(screen.getByText('Task Details')).toBeInTheDocument();
    });

    it('shows overdue info when task is Delayed', () => {
        render(<TaskDetailModal task={delayedTask} onClose={() => { }} />);
        expect(screen.getByText(/overdue/i)).toBeInTheDocument();
    });

    it('does not show overdue info when task is not Delayed', () => {
        render(<TaskDetailModal task={mockTask} onClose={() => { }} />);
        expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<TaskDetailModal task={mockTask} onClose={onClose} />);
        // Click the "Close" button at the bottom
        fireEvent.click(screen.getByText('Close'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay backdrop is clicked', () => {
        const onClose = vi.fn();
        const { container } = render(<TaskDetailModal task={mockTask} onClose={onClose} />);
        // The backdrop is the absolute overlay div
        const backdrop = container.querySelector('.absolute.inset-0');
        if (backdrop) fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
