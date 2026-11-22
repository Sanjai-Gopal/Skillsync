'use client';

import * as React from 'react';
import { Domain, TeamCoverage, User } from '@/lib/types';
import { DOMAINS } from '@/lib/taxonomy';
import { UserAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, TrendingUp, Sparkles, Eye, Check } from 'lucide-react';

export interface SuggestionListProps {
  suggestions: TeamCoverage['suggestions'];
  allUsers: User[];
  onHoverCandidate: (candidate: User | null) => void;
  onInviteCandidate: (candidate: User) => void;
  invitedIds?: string[];
  maxTeamReached?: boolean;
}

export function SuggestionList({
  suggestions,
  allUsers,
  onHoverCandidate,
  onInviteCandidate,
  invitedIds = [],
  maxTeamReached = false,
}: SuggestionListProps) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
        No unteamed discoverable builders currently available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Team Optimizer Suggestions ({suggestions.length})
          </h3>
          <span className="text-[11px] text-muted-foreground">
            Ranked by marginal team capability gain. Hover to preview radar impact!
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {suggestions.map((sug) => {
          const user = allUsers.find((u) => u.id === sug.userId);
          if (!user) return null;

          const isInvited = invitedIds.includes(user.id);
          const isPositiveGain = sug.marginalGain > 0;

          return (
            <div
              key={user.id}
              onMouseEnter={() => onHoverCandidate(user)}
              onMouseLeave={() => onHoverCandidate(null)}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card/90 transition-all gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <UserAvatar seed={user.avatarSeed} name={user.name} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                      {user.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {user.preferredRoles[0]}
                    </Badge>
                  </div>

                  <span className="text-[11px] text-muted-foreground block truncate max-w-sm mt-0.5">
                    {user.headline}
                  </span>

                  {/* Fills domains chips */}
                  {sug.fillsDomains.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Fills gaps:
                      </span>
                      {sug.fillsDomains.map((d) => {
                        const domainDef = DOMAINS.find((dom) => dom.id === d);
                        return (
                          <Badge
                            key={d}
                            variant="outline"
                            className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono py-0 px-1.5"
                          >
                            {domainDef?.label || d}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Marginal Gain & Action */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end font-mono font-bold text-xs">
                    <TrendingUp className={`h-3.5 w-3.5 ${isPositiveGain ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    <span className={isPositiveGain ? 'text-emerald-500' : 'text-muted-foreground'}>
                      {sug.marginalGain > 0 ? `+${sug.marginalGain}` : sug.marginalGain}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">marginal gain</span>
                </div>

                {isInvited ? (
                  <Button variant="secondary" size="sm" disabled className="h-8 text-xs gap-1">
                    <Check className="h-3 w-3" /> Invited
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={maxTeamReached}
                    onClick={() => onInviteCandidate(user)}
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Invite
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
