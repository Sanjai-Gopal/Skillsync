'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Shield, Users, Send, CheckCircle2, Baby, Eye, Handshake, Settings2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  computeExposureAudit,
  computeTeamCoverage,
  eligiblePool,
  suggestIntroductions,
} from '@/lib/matching';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';

function Kpi({ icon: Icon, label, value, hint }: { icon: React.ElementType; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

const pct = (n: number, d: number) => (d > 0 ? `${Math.round((100 * n) / d)}%` : 'n/a');

export default function OrganizerPage() {
  const { users, teams, invites, weights, eventConfig, setEventConfig, sendInvite, hasHydrated } = useAppStore();

  const audit = React.useMemo(() => computeExposureAudit(users, weights), [users, weights]);
  const intros = React.useMemo(() => suggestIntroductions(users, weights), [users, weights]);

  if (!hasHydrated) return <div className="p-8 text-center text-sm text-muted-foreground">Loading event data…</div>;

  const byId = (id: string) => users.find((u) => u.id === id)!;
  const participants = users.filter((u) => u.isDiscoverable || u.teamId);
  const open = eligiblePool(users);
  const realTeams = teams.filter((t) => t.memberIds.length >= 2);
  const teamed = users.filter((u) => u.teamId);
  const firstTimers = users.filter((u) => u.experienceLevel === 'first_timer');
  const firstTimersTeamed = firstTimers.filter((u) => u.teamId);
  const inviters = new Set(invites.map((i) => i.fromUserId));
  const responded = invites.filter((i) => i.status === 'accepted' || i.status === 'declined');
  const accepted = invites.filter((i) => i.status === 'accepted');
  const hidden = users.filter((u) => !u.isDiscoverable && !u.teamId);

  const teamRows = teams.map((t) => ({ t, cov: computeTeamCoverage(t, users, weights) }));
  const balanced = teamRows.filter((r) => r.t.memberIds.length >= 2 && r.cov.gaps.length === 0).length;

  const maxExposure = Math.max(1, ...audit.entries.map((e) => e.exposure));
  const gap = (a: number | null, b: number | null) => (a !== null && b !== null ? a - b : null);
  const ftVsVet = gap(audit.avgByExperience.first_timer, audit.avgByExperience.veteran);

  const sendIntro = (aId: string, bId: string, score: number) => {
    const a = byId(aId);
    const b = byId(bId);
    sendInvite(
      aId,
      bId,
      null,
      `Introduced by the organizers: ${a.name.split(' ')[0]} and ${b.name.split(' ')[0]} complement each other's skills.`,
      score
    );
    toast.success(`Introduction sent: ${a.name.split(' ')[0]} → ${b.name.split(' ')[0]}`, {
      description: 'It appears in the recipient’s Invite Inbox. Nobody is placed on a team automatically.',
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-border/70 bg-card/40 py-8 px-4 sm:px-8">
        <div className="container max-w-6xl mx-auto space-y-2">
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            Organizer view · Innovate India 2026
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Event Health &amp; Fairness</h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            The pilot metrics from our idea brief, live. Aggregate only: no private profile data, and no automatic team decisions.
          </p>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-10">
        {/* Participation rules */}
        <section className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-extrabold">
              <Settings2 className="h-4 w-4 text-primary" /> Participation rules
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Organizers set the rules; the engine and Dream Team Assembler follow them.
            </p>
          </div>
          <label className="flex items-center gap-3 text-xs font-semibold">
            Max team size
            <select
              value={eventConfig.maxTeamSize}
              onChange={(e) => setEventConfig({ maxTeamSize: Number(e.target.value) })}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} members
                </option>
              ))}
            </select>
          </label>
        </section>

        {/* Pilot metrics */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pilot metrics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi icon={Users} label="Participants teamed" value={pct(teamed.length, participants.length)} hint={`${teamed.length} of ${participants.length} · ${open.length} still open`} />
            <Kpi icon={Send} label="Invitation rate" value={pct(inviters.size, participants.length)} hint={`${invites.length} invites sent by ${inviters.size} people`} />
            <Kpi icon={Handshake} label="Acceptance rate" value={pct(accepted.length, responded.length)} hint={`${accepted.length} accepted of ${responded.length} answered`} />
            <Kpi icon={CheckCircle2} label="Balanced teams" value={pct(balanced, realTeams.length)} hint={`${balanced} of ${realTeams.length} teams cover every required role`} />
            <Kpi icon={Baby} label="First-timers on a team" value={pct(firstTimersTeamed.length, firstTimers.length)} hint={`${firstTimersTeamed.length} of ${firstTimers.length} first-time hackers`} />
            <Kpi icon={Eye} label="Opted out (hidden)" value={String(hidden.length)} hint="Profiles hidden by their owners, so they are never matched" />
          </div>
        </section>

        {/* Fairness audit */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exposure audit</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-3xl">
              We simulate every open participant&apos;s Top-{audit.topN} feed and count who gets seen. A healthy engine spreads attention instead of crowning a few &ldquo;stars&rdquo;.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Kpi icon={Shield} label="Inequality (Gini)" value={audit.gini.toFixed(2)} hint="0 = everyone seen equally · 1 = one person gets all views" />
            <Kpi icon={Eye} label="Most-seen vs average" value={`${audit.concentration.toFixed(1)}×`} hint="How concentrated attention is on the top profile" />
            <Kpi
              icon={Baby}
              label="First-timer vs veteran"
              value={ftVsVet === null ? 'n/a' : `${ftVsVet >= 0 ? '+' : ''}${ftVsVet.toFixed(1)} views`}
              hint={`avg ${audit.avgByExperience.first_timer ?? '–'} vs ${audit.avgByExperience.veteran ?? '–'} appearances per person`}
            />
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-1.5">
            {audit.entries.map((e) => {
              const u = byId(e.userId);
              return (
                <div key={e.userId} className="flex items-center gap-3 text-xs">
                  <span className="w-28 truncate font-medium">{u.name}</span>
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={e.exposure === 0 ? 'h-full bg-destructive' : 'h-full bg-primary'}
                      style={{ width: `${Math.max(2, (100 * e.exposure) / maxExposure)}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono">{e.exposure}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Introductions */}
        <section className="space-y-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organizer-led introductions</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-3xl">
              Cold-start safety net. The least-seen participants are paired with their best <b>mutual</b> fit (the lower of both directions), so nobody is left out. Each introduction is only an invite; the recipient decides.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {intros.map((i) => {
              const a = byId(i.aId);
              const b = byId(i.bId);
              const unseen = audit.unseenIds.includes(i.aId);
              return (
                <div key={`${i.aId}-${i.bId}`} className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar seed={a.avatarSeed} name={a.name} size="md" />
                    <span className="text-muted-foreground">+</span>
                    <UserAvatar seed={b.avatarSeed} name={b.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">
                        {a.name} &amp; {b.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">Mutual fit {i.mutualScore}/100</div>
                    </div>
                    {unseen && (
                      <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive shrink-0">
                        Unseen
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{i.reason}</p>
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1.5" onClick={() => sendIntro(i.aId, i.bId, i.mutualScore)}>
                    <Send className="h-3.5 w-3.5" /> Send introduction
                  </Button>
                </div>
              );
            })}
            {intros.length === 0 && <p className="text-xs text-muted-foreground">Everyone open is already on a team.</p>}
          </div>
        </section>

        {/* Team health */}
        {teamRows.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Team health</h2>
            <div className="rounded-2xl border border-border/80 bg-card divide-y divide-border/60">
              {teamRows.map(({ t, cov }) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 p-3.5 text-xs">
                  <div className="font-bold">
                    {t.name} <span className="font-normal text-muted-foreground">· {t.memberIds.length}/{t.maxSize} members</span>
                  </div>
                  {cov.gaps.length === 0 ? (
                    <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600">All required roles covered</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600">{cov.gaps.length} role gap{cov.gaps.length > 1 ? 's' : ''}: {cov.gaps.join(', ')}</Badge>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
