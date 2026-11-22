'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreRing({
  score,
  size = 56,
  strokeWidth = 5,
  showLabel = true,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let colorClass = 'text-rose-500';
  let bgStroke = 'text-rose-500/15';

  if (clampedScore >= 75) {
    colorClass = 'text-emerald-500';
    bgStroke = 'text-emerald-500/15';
  } else if (clampedScore >= 50) {
    colorClass = 'text-indigo-500';
    bgStroke = 'text-indigo-500/15';
  } else if (clampedScore >= 30) {
    colorClass = 'text-amber-500';
    bgStroke = 'text-amber-500/15';
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={cn('fill-none', bgStroke)}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={cn('fill-none', colorClass)}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono font-bold leading-none">
          <span className={cn('text-sm md:text-base font-extrabold tracking-tighter', colorClass)}>
            {clampedScore}
          </span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-sans font-medium">
            pts
          </span>
        </div>
      )}
    </div>
  );
}
