'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  seed: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function UserAvatar({ seed, name, size = 'md', className, ...props }: AvatarProps) {
  const sizeMap = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  };

  const dimensionMap = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed || name)}`;

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted items-center justify-center font-semibold text-muted-foreground shadow-sm',
        sizeMap[size],
        className
      )}
      {...props}
    >
      <img
        src={avatarUrl}
        alt={name}
        className="aspect-square h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
