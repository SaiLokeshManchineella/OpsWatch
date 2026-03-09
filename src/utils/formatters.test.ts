import { describe, it, expect, vi } from 'vitest';
import { formatDate, formatOverdue, formatNumber } from './formatters';

describe('formatDate', () => {
    it('formats a date string into readable format', () => {
        const result = formatDate('2026-03-08T14:30:00');
        expect(result).toContain('Mar');
        expect(result).toContain('2026');
        expect(result).toContain('·');
    });

    it('handles Date objects', () => {
        const result = formatDate(new Date(2026, 0, 15, 9, 0));
        expect(result).toContain('Jan');
        expect(result).toContain('2026');
    });
});

describe('formatOverdue', () => {
    it('returns "On time" for future dates', () => {
        const future = new Date(Date.now() + 86400000).toISOString();
        expect(formatOverdue(future)).toBe('On time');
    });

    it('returns minutes overdue for recent past', () => {
        const past = new Date(Date.now() - 15 * 60000).toISOString();
        const result = formatOverdue(past);
        expect(result).toMatch(/\d+ min overdue/);
    });

    it('returns hours and minutes overdue for longer durations', () => {
        const past = new Date(Date.now() - 3 * 3600000 - 20 * 60000).toISOString();
        const result = formatOverdue(past);
        expect(result).toMatch(/3 hrs 20 min overdue/);
    });

    it('uses singular "hr" for 1 hour', () => {
        const past = new Date(Date.now() - 1 * 3600000 - 5 * 60000).toISOString();
        const result = formatOverdue(past);
        expect(result).toMatch(/1 hr 5 min overdue/);
    });
});

describe('formatNumber', () => {
    it('formats small numbers as-is', () => {
        expect(formatNumber(42)).toBe('42');
    });

    it('formats large numbers with locale separators', () => {
        const result = formatNumber(1234567);
        // Locale-dependent, but should contain digits
        expect(result).toMatch(/1.*234.*567/);
    });

    it('formats zero', () => {
        expect(formatNumber(0)).toBe('0');
    });
});
