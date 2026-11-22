'use client';

import * as React from 'react';
import { Team, User } from '@/lib/types';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MemberList({
  team,
  members,
  currentUserId,
}: {
  team: Team;
  members: User[];
  currentUserId: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Team Roster ({members.length} / {team.maxSize})
        </h3>
        <span className="text-[11px] text-muted-foreground">
          Max {team.maxSize} builders
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {members.map((member) => {
          const isCreator = team.createdBy === member.id;
          const isSelf = member.id === currentUserId;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card/60 gap-3 transition-colors hover:bg-card/90"
            >
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar seed={member.avatarSeed} name={member.name} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {member.name}
                    </span>
                    {isSelf && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20">
                        You
                      </Badge>
                    )}
                    {isCreator && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Crown className="h-2.5 w-2.5" /> Founder
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate block">
                    {member.preferredRoles.join(' • ')} • {member.availability.timezone.split('/')[1]?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {member.contact && (
                  <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-2 py-1 rounded-md hidden sm:inline">
                    {member.contact}
                  </span>
                )}
                <Badge variant="outline" className="text-[10px] font-mono">
                  {member.experienceLevel.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
