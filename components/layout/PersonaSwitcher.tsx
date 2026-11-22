'use client';

import * as React from 'react';
import { useAppStore } from '@/lib/store';
import { UserAvatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PersonaSwitcher() {
  const { users, currentUserId, setCurrentUserId } = useAppStore();
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  if (!currentUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 px-2.5 rounded-full border-border/80 bg-background/80 hover:bg-accent text-xs font-medium shadow-sm"
        >
          <UserAvatar seed={currentUser.avatarSeed} name={currentUser.name} size="sm" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] text-muted-foreground font-normal">Viewing as</span>
            <span className="font-semibold text-foreground truncate max-w-[110px] sm:max-w-[130px]">
              {currentUser.name}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Switch Hackathon Persona</span>
          <span className="font-mono text-[10px] text-muted-foreground">{users.length} personas</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {users.map((user) => {
          const isSelected = user.id === currentUserId;
          return (
            <DropdownMenuItem
              key={user.id}
              onClick={() => setCurrentUserId(user.id)}
              className="flex items-center justify-between gap-2 py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar seed={user.avatarSeed} name={user.name} size="sm" />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {user.name}
                    </span>
                    {user.teamId && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground">
                        Teamed
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate block">
                    {user.preferredRoles[0]} • {user.experienceLevel.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
