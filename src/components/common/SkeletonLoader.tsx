import React from 'react';
import { cn } from '@/lib/utils';

export const SkeletonLoader: React.FC<{ className?: string; count?: number }> = ({ className, count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={cn('h-4 bg-muted rounded-lg animate-skeleton', className)} />
    ))}
  </div>
);
