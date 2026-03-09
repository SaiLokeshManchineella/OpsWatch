import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskFilters } from './TaskFilters';

const defaultProps = {
    statusFilter: 'All' as const,
    priorityFilter: 'All' as const,
    search: '',
    onStatusChange: vi.fn(),
    onPriorityChange: vi.fn(),
    onSearchChange: vi.fn(),
};

describe('TaskFilters', () => {
    it('renders all status filter buttons', () => {
        render(<TaskFilters {...defaultProps} />);
        const allButtons = screen.getAllByText('All');
        expect(allButtons.length).toBe(2); // Status "All" and Priority "All"
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Delayed')).toBeInTheDocument();
    });

    it('renders all priority filter buttons', () => {
        render(<TaskFilters {...defaultProps} />);
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('renders the search input', () => {
        render(<TaskFilters {...defaultProps} />);
        expect(screen.getByPlaceholderText('Quick search tasks...')).toBeInTheDocument();
    });

    it('calls onStatusChange when status button is clicked', () => {
        const onStatusChange = vi.fn();
        render(<TaskFilters {...defaultProps} onStatusChange={onStatusChange} />);
        fireEvent.click(screen.getByText('Delayed'));
        expect(onStatusChange).toHaveBeenCalledWith('Delayed');
    });

    it('calls onPriorityChange when priority button is clicked', () => {
        const onPriorityChange = vi.fn();
        render(<TaskFilters {...defaultProps} onPriorityChange={onPriorityChange} />);
        fireEvent.click(screen.getByText('High'));
        expect(onPriorityChange).toHaveBeenCalledWith('High');
    });

    it('calls onSearchChange on input change', () => {
        const onSearchChange = vi.fn();
        render(<TaskFilters {...defaultProps} onSearchChange={onSearchChange} />);
        fireEvent.change(screen.getByPlaceholderText('Quick search tasks...'), { target: { value: 'deploy' } });
        expect(onSearchChange).toHaveBeenCalledWith('deploy');
    });

    it('highlights the active status filter', () => {
        render(<TaskFilters {...defaultProps} statusFilter="Delayed" />);
        const delayedButton = screen.getByText('Delayed');
        expect(delayedButton).toHaveClass('bg-primary');
    });

    it('highlights the active priority filter', () => {
        render(<TaskFilters {...defaultProps} priorityFilter="High" />);
        const highButton = screen.getByText('High');
        expect(highButton).toHaveClass('bg-primary');
    });

    it('shows current search value', () => {
        render(<TaskFilters {...defaultProps} search="backend" />);
        expect(screen.getByDisplayValue('backend')).toBeInTheDocument();
    });
});
