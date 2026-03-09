export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const formatOverdue = (expectedTime: Date | string): string => {
  const now = new Date();
  const expected = new Date(expectedTime);
  const diffMs = now.getTime() - expected.getTime();
  if (diffMs <= 0) return 'On time';
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min overdue`;
  return `${minutes} min overdue`;
};

export const formatNumber = (n: number): string => n.toLocaleString();
