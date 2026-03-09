import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from './StatCard';
import { ClipboardList } from 'lucide-react';

describe('StatCard', () => {
    it('renders the label and value', () => {
        render(<StatCard icon={ClipboardList} iconBg="bg-muted" label="Total Tasks" value={12} />);
        expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });

    it('renders trend text when provided', () => {
        render(<StatCard icon={ClipboardList} iconBg="bg-muted" label="Tasks" value={5} trend="+10%" />);
        expect(screen.getByText('+10%')).toBeInTheDocument();
    });

    it('does not render trend when not provided', () => {
        render(<StatCard icon={ClipboardList} iconBg="bg-muted" label="Tasks" value={5} />);
        expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<StatCard icon={ClipboardList} iconBg="bg-muted" label="Tasks" value={5} onClick={handleClick} />);
        fireEvent.click(screen.getByText('Tasks'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has cursor-pointer class when onClick is provided', () => {
        const { container } = render(
            <StatCard icon={ClipboardList} iconBg="bg-muted" label="Tasks" value={5} onClick={() => { }} />
        );
        expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('does not have cursor-pointer class when onClick is absent', () => {
        const { container } = render(
            <StatCard icon={ClipboardList} iconBg="bg-muted" label="Tasks" value={5} />
        );
        expect(container.firstChild).not.toHaveClass('cursor-pointer');
    });
});
