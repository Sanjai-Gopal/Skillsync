'use client';

import * as React from 'react';
import { ClipboardCheck, Copy, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Domain, Team, User } from '@/lib/types';
import { DOMAINS } from '@/lib/taxonomy';
import { suggestRoles, suggestMilestone } from '@/lib/matching';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';

/** "Agree on roles and a first milestone": step 03 of the SkillSync flow. */
export function KickoffPlan({ team, members }: { team: Team; members: User[] }) {
  const updateTeam = useAppStore((s) => s.updateTeam);

  const suggested = React.useMemo(
    () => suggestRoles(members, team.requiredDomains),
    [members, team.requiredDomains]
  );
  const [roles, setRoles] = React.useState<Record<string, Domain>>(
    () => ({ ...suggested.assignments, ...(team.roleAssignments ?? {}) })
  );
  const [milestone, setMilestone] = React.useState<string>(
    () => team.milestone ?? suggestMilestone(team, members, { ...suggested.assignments, ...(team.roleAssignments ?? {}) })
  );

  const label = (d: Domain) => DOMAINS.find((x) => x.id === d)?.label ?? d;

  const resuggest = () => {
    setRoles(suggested.assignments);
    setMilestone(suggestMilestone(team, members, suggested.assignments));
    toast.success('Roles and milestone re-drafted from current skills.');
  };

  const save = () => {
    updateTeam(team.id, { roleAssignments: roles, milestone });
    toast.success('Kickoff plan saved.');
  };

  const copy = async () => {
    const text = [
      `${team.name}: Kickoff Charter`,
      team.idea ? `Idea: ${team.idea}` : '',
      '',
      'Roles',
      ...members.map((m) => `- ${m.name}: ${roles[m.id] ? label(roles[m.id]) : 'unassigned'}`),
      '',
      'First milestone',
      milestone,
    ]
      .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Charter copied to clipboard.');
    } catch {
      toast.error('Could not access the clipboard.');
    }
  };

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-extrabold">
            <ClipboardCheck className="h-4 w-4 text-primary" /> Kickoff Plan: roles &amp; first milestone
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Drafted from everyone&apos;s strongest skills. Roles are suggestions: you and your team decide.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resuggest} className="gap-1.5 text-xs shrink-0">
          <Wand2 className="h-3.5 w-3.5" /> Re-suggest
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-2.5">
            <UserAvatar seed={m.avatarSeed} name={m.name} size="sm" />
            <span className="text-xs font-semibold flex-1 truncate">{m.name}</span>
            <select
              aria-label={`Owned domain for ${m.name}`}
              value={roles[m.id] ?? ''}
              onChange={(e) => setRoles((r) => ({ ...r, [m.id]: e.target.value as Domain }))}
              className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
            >
              <option value="" disabled>
                Choose…
              </option>
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {suggested.unowned.length > 0 && (
        <p className="text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 p-2.5">
          Nobody owns <b>{suggested.unowned.map(label).join(', ')}</b> yet. That is a recruiting or learning opportunity.
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold" htmlFor="milestone">
          First milestone
        </label>
        <Textarea
          id="milestone"
          rows={5}
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
          className="text-xs"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={copy} className="gap-1.5 text-xs">
          <Copy className="h-3.5 w-3.5" /> Copy charter
        </Button>
        <Button size="sm" onClick={save} className="gap-1.5 text-xs">
          <Save className="h-3.5 w-3.5" /> Save plan
        </Button>
      </div>
    </section>
  );
}
