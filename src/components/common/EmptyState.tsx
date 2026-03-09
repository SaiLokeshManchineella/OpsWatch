import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
    <div className="mb-4 text-primary">{icon}</div>
    <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
    {action}
  </div>
);
