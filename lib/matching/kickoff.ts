import { Domain, Team, User } from '../types';
import { ALL_DOMAINS } from '../taxonomy';
import { getDomainProficiency } from './skills';
import { computeTeamProficiency } from './team';

export interface RoleSuggestion {
  assignments: Record<string, Domain>; // member id -> owned domain
  unowned: Domain[]; // required domains nobody can own yet
}

/**
 * Proposes who owns which domain. Greedy by strongest (member, domain) pair, one owner per domain.
 * Members left over (more people than domains) take their strongest domain as co-owner.
 * Deterministic: ties broken by id then domain order.
 */
export function suggestRoles(
  members: User[],
  requiredDomains?: Partial<Record<Domain, number>>
): RoleSuggestion {
  const wanted = ALL_DOMAINS.filter((d) =>
    requiredDomains && Object.keys(requiredDomains).length ? (requiredDomains[d] ?? 0) > 0 : true
  );
  const profs = members.map((m) => ({ id: m.id, p: getDomainProficiency(m.skills) }));

  const pairs: { id: string; d: Domain; v: number }[] = [];
  for (const m of profs) for (const d of wanted) if (m.p[d] > 0) pairs.push({ id: m.id, d, v: m.p[d] });
  pairs.sort(
    (a, b) =>
      b.v - a.v ||
      a.id.localeCompare(b.id) ||
      ALL_DOMAINS.indexOf(a.d) - ALL_DOMAINS.indexOf(b.d)
  );

  const assignments: Record<string, Domain> = {};
  const owned = new Set<Domain>();
  for (const { id, d } of pairs) {
    if (assignments[id] || owned.has(d)) continue;
    assignments[id] = d;
    owned.add(d);
  }

  // Leftover members become co-owners of their strongest domain.
  for (const m of profs) {
    if (assignments[m.id]) continue;
    const best = ALL_DOMAINS.filter((d) => m.p[d] > 0).sort((a, b) => m.p[b] - m.p[a])[0];
    if (best) assignments[m.id] = best;
  }

  return { assignments, unowned: wanted.filter((d) => !owned.has(d)) };
}

const DOMAIN_LABEL: Record<Domain, string> = {
  frontend: 'the UI',
  backend: 'the API & data layer',
  ai_ml: 'the AI/ML core',
  design: 'the UX flow & visuals',
  product: 'scope & the pitch',
  devops: 'deploy & CI',
  data: 'the data pipeline',
  mobile: 'the mobile client',
};

/** A concrete, editable first milestone drafted from the agreed roles and current gaps. */
export function suggestMilestone(team: Team, members: User[], assignments: Record<string, Domain>): string {
  const byId = new Map(members.map((m) => [m.id, m]));
  const lines = Object.entries(assignments)
    .filter(([id]) => byId.has(id))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, d]) => `• ${byId.get(id)!.name.split(' ')[0]} owns ${DOMAIN_LABEL[d]}`);

  const cov = computeTeamProficiency(members);
  const gaps = ALL_DOMAINS.filter(
    (d) =>
      (team.requiredDomains?.[d] ?? (Object.keys(team.requiredDomains ?? {}).length ? 0 : 1)) > 0 &&
      cov[d] < 0.5
  );

  const head = `By hour 6: a clickable end-to-end walking skeleton for "${team.idea?.trim() || team.name}".`;
  const gapLine = gaps.length
    ? `\nOpen risk: nobody covers ${gaps.map((g) => DOMAIN_LABEL[g]).join(', ')} yet. Recruit or learn it first.`
    : '\nNo capability gaps. Spend the saved time on polish and the demo.';
  return [head, ...lines].join('\n') + gapLine;
}
