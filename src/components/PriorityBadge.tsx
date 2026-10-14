import React from 'react';
import { CasePriority } from '../types/index.ts';

interface PriorityBadgeProps {
  priority: CasePriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getStyles = (pr: CasePriority) => {
    switch (pr) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStyles(
        priority
      )}`}
    >
      {priority}
    </span>
  );
};
