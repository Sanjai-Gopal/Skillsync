'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Send, TrendingUp, Clock, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { computePairwiseMatch, findDreamTeams, DreamTeam } from '@/lib/matching';
import { DOMAINS } from '@/lib/taxonomy';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function DreamTeamPanel() {
  const { users, currentUserId, weights, sendInvite, invites, eventConfig } = useAppStore();
  const viewer = users.find((u) => u.id === currentUserId);
  const [open, setOpen] = React.useState(false);
  const [option, setOption] = React.useState(0);

  const result = React.useMemo(
    () => (open && viewer && !viewer.teamId ? findDreamTeams(viewer, users, { weights, size: eventConfig.maxTeamSize }) : null),
    [open, viewer, users, weights, eventConfig.maxTeamSize]
  );

  if (!viewer) return null;

  const byId = (id: string) => users.find((u) => u.id === id) as User;
  const team: DreamTeam | undefined = result?.teams[Math.min(option, (result?.teams.length ?? 1) - 1)];

  const inviteAll = () => {
    if (!team) return;
    let sent = 0;
    for (const id of team.memberIds.slice(1)) {
      const already = invites.some(
        (i) => i.fromUserId === viewer.id && i.toUserId === id && i.status === 'pending'
      );
      if (already) continue;
      const cand = byId(id);
      const snap = computePairwiseMatch(viewer, cand, weights).total;
      sendInvite(
        viewer.id,
        id,
        null,
        `Hi ${cand.name}! SkillSync's Dream Team Assembler picked us (team score ${team.teamScore.toFixed(0)}/100). Want to build together?`,
        snap
      );
      sent++;
    }
    toast.success(sent ? `Invited ${sent} teammate${sent > 1 ? 's' : ''}` : 'Invites already pending', {
      description: 'Track responses in your Invite Inbox.',
    });
  };

  return (
    <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold">
            <Wand2 className="h-4 w-4 text-primary" /> Dream Team Assembler
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Pairwise scores rank individuals. Hackathon teams are groups. We search every possible team around you and
            maximize <span className="font-semibold text-foreground">whole-team</span> coverage, schedule overlap and chemistry.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setOpen(true);
            setOption(0);
          }}
          disabled={Boolean(viewer.teamId)}
          className="gap-1.5 shrink-0"
        >
          <Wand2 className="h-3.5 w-3.5" /> {open ? 'Re-assemble' : 'Assemble my dream team'}
        </Button>
      </div>

      {viewer.teamId && (
        <p className="text-xs text-muted-foreground">
          You are already on a team. Open your Team Space to see ranked suggestions for your open seats.
        </p>
      )}

      <AnimatePresence mode="wait">
        {open && result && team && (
          <motion.div
            key={option}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              {result.teams.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setOption(i)}
                  className={cn(
                    'px-3 h-8 rounded-lg border text-xs font-semibold transition-colors',
                    i === option
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-input hover:text-foreground'
                  )}
                >
                  Option {i + 1} · {t.teamScore.toFixed(0)}
                </button>
              ))}
              <span className="text-[11px] text-muted-foreground self-center font-mono">
                {result.combinationsEvaluated} teams evaluated
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {team.memberIds.map((id, idx) => {
                const m = byId(id);
                return (
                  <div key={id} className="rounded-xl border border-border/70 bg-card p-3 text-center space-y-1.5">
                    <UserAvatar seed={m.avatarSeed} name={m.name} size="lg" className="mx-auto" />
                    <div className="text-xs font-bold leading-tight">{idx === 0 ? 'You' : m.name}</div>
                    <div className="text-[11px] text-muted-foreground">{m.preferredRoles[0]}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                {DOMAINS.map((d) => {
                  const v = team.byDomain[d.id];
                  const gap = team.gaps.includes(d.id);
                  return (
                    <div key={d.id} className="flex items-center gap-2 text-[11px]">
                      <span className="w-24 text-muted-foreground truncate">{d.label}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={cn('h-full rounded-full', gap ? 'bg-amber-500' : 'bg-primary')}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round(v * 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono">{Math.round(v * 100)}%</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 p-2.5">
                  <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Team score <b>{team.teamScore.toFixed(1)}</b>
                    {result.naive && option === 0 && result.liftOverNaive > 0 ? (
                      <>
                        {' '}
                        vs <b>{result.naive.teamScore.toFixed(1)}</b> if you just picked your top matches (
                        <b className="text-primary">+{result.liftOverNaive.toFixed(1)}</b>)
                      </>
                    ) : null}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {team.overlapHoursAll}h/day when all {team.memberIds.length} are free
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Average pair chemistry {team.avgPairScore.toFixed(0)}/100
                </div>
                {team.weakestLink && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Weakest link:{' '}
                    {byId(team.weakestLink.aId).name.split(' ')[0]} + {byId(team.weakestLink.bId).name.split(' ')[0]} (
                    {team.weakestLink.score})
                  </div>
                )}
                {team.gaps.length > 0 ? (
                  <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600">
                    Still thin on: {team.gaps.map((g) => DOMAINS.find((d) => d.id === g)?.label).join(', ')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600">
                    No capability gaps
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={inviteAll} className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Invite all {team.memberIds.length - 1}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && !result && !viewer.teamId && (
        <p className="text-xs text-muted-foreground">Not enough open participants to assemble a full team yet.</p>
      )}
    </section>
  );
}
