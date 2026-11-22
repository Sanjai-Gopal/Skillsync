'use client';

import * as React from 'react';
import { MatchBreakdown, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from './ScoreRing';
import { UserAvatar } from '@/components/ui/avatar';
import { Sparkles, UserPlus, HelpCircle, Check, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface MatchCardProps {
  candidate: User;
  breakdown: MatchBreakdown;
  onWhyMatch: () => void;
  onInvite: () => void;
  hasPendingInvite?: boolean;
  isAlreadyTeammate?: boolean;
  disabled?: boolean;
}

export function MatchCard({
  candidate,
  breakdown,
  onWhyMatch,
  onInvite,
  hasPendingInvite = false,
  isAlreadyTeammate = false,
  disabled = false,
}: MatchCardProps) {
  const topReasons = breakdown.factors
    .filter((f) => f.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="overflow-hidden border border-border/80 bg-card/80 hover:border-primary/40 hover:shadow-md transition-all duration-300">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <UserAvatar seed={candidate.avatarSeed} name={candidate.name} size="lg" />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">{candidate.name}</h3>
                  {candidate.experienceLevel === 'first_timer' && (
                    <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30 bg-primary/5">
                      First-Timer
                    </Badge>
                  )}
                  {candidate.skills.some((s) => s.wantsToLearn) && (
                    <Badge variant="outline" className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                      Eager Learner
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-1 max-w-md font-medium">
                  {candidate.headline}
                </p>

                {/* Role and Domain chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {candidate.preferredRoles.map((role, idx) => (
                    <Badge
                      key={role}
                      variant={idx === 0 ? 'default' : 'secondary'}
                      className="text-[11px] font-medium"
                    >
                      {role}
                    </Badge>
                  ))}
                  <span className="text-muted-foreground text-xs self-center px-1">•</span>
                  <span className="text-xs text-muted-foreground font-mono self-center">
                    {candidate.availability.timezone.split('/')[1]?.replace('_', ' ')} (~{candidate.availability.hoursPerDay}h)
                  </span>
                </div>
              </div>
            </div>

            {/* Score Ring */}
            <div className="self-end sm:self-center shrink-0 flex items-center gap-2">
              <ScoreRing score={breakdown.total} size={54} strokeWidth={5} />
            </div>
          </div>

          {/* Top Reasons / Evidence */}
          <div className="mt-4 pt-3.5 border-t border-border/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Key Compatibility Drivers:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {topReasons.map((f) => (
                <div
                  key={f.key}
                  className="rounded-lg bg-secondary/50 px-3 py-1.5 text-foreground/90 font-medium flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="truncate">{f.headline}</span>
                </div>
              ))}
              {breakdown.cautions.length > 0 && (
                <div className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-amber-600 dark:text-amber-400 font-medium flex items-center gap-2 border border-amber-500/20">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{breakdown.cautions[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={onWhyMatch}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Why this match?
            </Button>

            {isAlreadyTeammate ? (
              <Badge variant="outline" className="text-xs font-medium text-emerald-600 border-emerald-500/30 bg-emerald-500/10 py-1 px-3">
                <Check className="h-3 w-3 mr-1" /> Teammate
              </Badge>
            ) : hasPendingInvite ? (
              <Badge variant="secondary" className="text-xs font-medium text-muted-foreground py-1 px-3">
                <Clock className="h-3 w-3 mr-1" /> Invite Sent
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={onInvite}
                disabled={disabled}
                className="text-xs font-semibold gap-1.5 h-8 px-4"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Invite
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
