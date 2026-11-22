import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVerdict(verdict: 'strong' | 'good' | 'fair' | 'weak'): {
  label: string;
  badgeClass: string;
} {
  switch (verdict) {
    case 'strong':
      return { label: 'Strong', badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    case 'good':
      return { label: 'Good', badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
    case 'fair':
      return { label: 'Fair', badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    case 'weak':
      return { label: 'Weak', badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
  }
}
