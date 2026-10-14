import React from 'react';
import { CaseStatus } from '../types/index.ts';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = (st: CaseStatus) => {
    switch (st) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'Planning':
        return 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
      case 'In Review':
        return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Completed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium uppercase tracking-wider ${sizeClasses} ${getStyles(
        status
      )}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Approved'
            ? 'bg-emerald-500'
            : status === 'In Review'
            ? 'bg-amber-500'
            : status === 'Planning'
            ? 'bg-sky-500'
            : status === 'Completed'
            ? 'bg-indigo-500'
            : status === 'Cancelled'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};
