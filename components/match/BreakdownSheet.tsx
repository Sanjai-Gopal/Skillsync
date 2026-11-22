'use client';

import * as React from 'react';
import { MatchBreakdown, User } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScoreRing } from './ScoreRing';
import { FactorRow } from './FactorRow';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Sparkles, ArrowRight, ShieldCheck, Clock, Compass } from 'lucide-react';
import { GOALS } from '@/lib/taxonomy';

export interface BreakdownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breakdown: MatchBreakdown | null;
  viewer: User | null;
  candidate: User | null;
  onInvite?: () => void;
  canInvite?: boolean;
}

export function BreakdownSheet({
  open,
  onOpenChange,
  breakdown,
  viewer,
  candidate,
  onInvite,
  canInvite = true,
}: BreakdownSheetProps) {
  if (!breakdown || !viewer || !candidate) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-xl md:max-w-2xl p-6">
        <SheetHeader className="text-left pb-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserAvatar seed={candidate.avatarSeed} name={candidate.name} size="lg" />
              <div>
                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                  <span>{candidate.name}</span>
                  {candidate.experienceLevel === 'first_timer' && (
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                      Beginner Friendly
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription className="text-xs line-clamp-1 mt-0.5">
                  {candidate.headline}
                </SheetDescription>
              </div>
            </div>

            <ScoreRing score={breakdown.total} size={64} strokeWidth={6} />
          </div>

          <div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-3.5 text-xs text-foreground/90 font-medium leading-relaxed">
            {breakdown.summary}
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Cautions if any */}
          {breakdown.cautions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Considerations & Cautions
              </h4>
              <div className="space-y-1.5">
                {breakdown.cautions.map((caution, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 font-medium"
                  >
                    <span>•</span>
                    <span>{caution}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentorship bonus line */}
          {breakdown.mentorshipBonus && breakdown.mentorshipBonus > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-xs text-indigo-600 dark:text-indigo-400">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="font-semibold">
                  Mentorship & Growth Bonus: Peer skill-sharing alignment detected!
                </span>
              </div>
              <span className="font-mono font-bold text-sm bg-indigo-500/20 px-2.5 py-0.5 rounded-full">
                +{breakdown.mentorshipBonus} pts
              </span>
            </div>
          )}

          {/* Four Factor Rows */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Factor Breakdown ({Math.round(breakdown.weightsUsed.skills * 100)}/{Math.round(breakdown.weightsUsed.track * 100)}/{Math.round(breakdown.weightsUsed.availability * 100)}/{Math.round(breakdown.weightsUsed.role * 100)} Weights)
            </h4>
            <div className="space-y-2.5">
              {breakdown.factors.map((factor) => (
                <FactorRow key={factor.key} factor={factor} />
              ))}
            </div>
          </div>

          {/* Skill Exchange: You Gain & They Gain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                You Gain From {candidate.name}
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {breakdown.youGain.length > 0 ? (
                  breakdown.youGain.map((g, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                      {g.skill} (+{g.delta})
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Shared foundation</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                They Gain From You
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {breakdown.theyGain.length > 0 ? (
                  breakdown.theyGain.map((g, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400">
                      {g.skill} (+{g.delta})
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Balanced capabilities</span>
                )}
              </div>
            </div>
          </div>

          {/* Shared Context */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3 text-xs">
            <span className="font-bold text-muted-foreground uppercase tracking-wider">
              Shared Preferences
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-foreground/90">
              <div className="flex items-start gap-2">
                <Compass className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Shared Tracks:</span>
                  <span className="text-muted-foreground">
                    {breakdown.sharedTracks.length > 0 ? breakdown.sharedTracks.join(', ') : 'None overlapping'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Overlap Hours:</span>
                  <span className="text-muted-foreground">
                    {breakdown.overlapHours}h concurrent daily
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          {canInvite && onInvite && (
            <div className="pt-2">
              <Button onClick={onInvite} className="w-full gap-2 font-semibold">
                Invite {candidate.name} to Team
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Privacy & Fairness Footer */}
          <div className="rounded-xl bg-muted/40 p-4 text-center border border-border/50 text-[11px] text-muted-foreground leading-relaxed flex items-center gap-2 justify-center">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              A score is a guide, not a verdict. You decide whom to invite. No sensitive attributes are used.
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
