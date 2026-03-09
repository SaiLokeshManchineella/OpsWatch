import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertsPanel } from './AlertsPanel';
import { Task } from '@/context/TaskContext';

const mockAlerts: Task[] = [
    { id: '1', title: 'Backend Bug', description: 'Fix it', team: 'Design', priority: 'High', status: 'Delayed', expectedCompletionTime: '2026-03-08T10:00:00Z' },
    { id: '2', title: 'I10', description: 'Issue', team: 'Design', priority: 'High', status: 'Delayed', expectedCompletionTime: '2026-03-08T11:00:00Z' },
];

describe('AlertsPanel', () => {
    it('renders all alert items', () => {
        render(<AlertsPanel alerts={mockAlerts} />);
        expect(screen.getByText('Backend Bug')).toBeInTheDocument();
        expect(screen.getByText('I10')).toBeInTheDocument();
    });

    it('renders the header text', () => {
        render(<AlertsPanel alerts={mockAlerts} />);
        expect(screen.getByText(/Active Operational Alerts/)).toBeInTheDocument();
    });

    it('shows "High priority task is delayed" for each alert', () => {
        render(<AlertsPanel alerts={mockAlerts} />);
        const labels = screen.getAllByText('High priority task is delayed');
        expect(labels).toHaveLength(2);
    });

    it('dismisses an alert when X is clicked', () => {
        render(<AlertsPanel alerts={mockAlerts} />);
        const dismissButtons = screen.getAllByRole('button');
        fireEvent.click(dismissButtons[0]);
        expect(screen.queryByText('Backend Bug')).not.toBeInTheDocument();
        expect(screen.getByText('I10')).toBeInTheDocument();
    });

    it('returns null when all alerts are dismissed', () => {
        const { container } = render(<AlertsPanel alerts={mockAlerts} />);
        const dismissButtons = screen.getAllByRole('button');
        fireEvent.click(dismissButtons[0]);
        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(container.firstChild).toBeNull();
    });

    it('calls onAlertClick when alert row is clicked', () => {
        const handleClick = vi.fn();
        render(<AlertsPanel alerts={mockAlerts} onAlertClick={handleClick} />);
        fireEvent.click(screen.getByText('Backend Bug'));
        expect(handleClick).toHaveBeenCalledWith(mockAlerts[0]);
    });

    it('dismiss button does not trigger onAlertClick', () => {
        const handleClick = vi.fn();
        render(<AlertsPanel alerts={mockAlerts} onAlertClick={handleClick} />);
        const dismissButtons = screen.getAllByRole('button');
        fireEvent.click(dismissButtons[0]);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('returns null for empty alerts array', () => {
        const { container } = render(<AlertsPanel alerts={[]} />);
        expect(container.firstChild).toBeNull();
    });
});
