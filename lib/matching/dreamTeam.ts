import { Domain, User, Weights, DEFAULT_WEIGHTS } from '../types';
import { ALL_DOMAINS } from '../taxonomy';
import { computePairwiseMatch } from './index';
import {
  computeTeamProficiency,
  computeTeamOverlapHours,
  computeTeamScore,
  getDomainWeight,
} from './team';

export interface DreamTeam {
  memberIds: string[]; // includes the viewer, viewer first
  teamScore: number; // 0..100 (same formula as Team Space)
  byDomain: Record<Domain, number>;
  gaps: Domain[];
  overlapHoursAll: number;
  avgPairScore: number; // 0..100
  weakestLink: { aId: string; bId: string; score: number } | null;
}

export interface DreamTeamResult {
  teams: DreamTeam[]; // best first
  /** The naive alternative: viewer + the K-1 individually highest-scoring candidates. */
  naive: DreamTeam | null;
  /** teams[0].teamScore - naive.teamScore (can be 0, never negative). */
  liftOverNaive: number;
  candidatesConsidered: number;
  combinationsEvaluated: number;
}

export interface DreamTeamOptions {
  size?: number; // default 4
  top?: number; // default 3
  weights?: Weights;
  requiredDomains?: Partial<Record<Domain, number>>;
  /** Cap on pool size to bound the combinatorics (pre-ranked by pairwise score with viewer). */
  poolCap?: number; // default 18
}

function combos<T>(arr: T[], k: number): T[][] {
  const out: T[][] = [];
  const cur: T[] = [];
  const rec = (start: number) => {
    if (cur.length === k) {
      out.push([...cur]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      cur.push(arr[i]);
      rec(i + 1);
      cur.pop();
    }
  };
  rec(0);
  return out;
}

/**
 * Finds the best whole teams around `viewer`, drawn from discoverable, unteamed users.
 * Pure + deterministic: ties are broken by member ids.
 */
export function findDreamTeams(
  viewer: User,
  allUsers: User[],
  opts: DreamTeamOptions = {}
): DreamTeamResult {
  const size = Math.max(2, opts.size ?? 4);
  const top = Math.max(1, opts.top ?? 3);
  const weights = opts.weights ?? DEFAULT_WEIGHTS;
  const poolCap = Math.max(size - 1, opts.poolCap ?? 18);

  // Pair cache: every pair is scored once, however many teams contain it.
  const cache = new Map<string, number>();
  const pairTotal = (a: User, b: User): number => {
    const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    let v = cache.get(key);
    if (v === undefined) {
      v = computePairwiseMatch(a, b, weights).total;
      cache.set(key, v);
    }
    return v;
  };

  const eligible = allUsers.filter(
    (u) => u.id !== viewer.id && u.isDiscoverable && !u.teamId
  );
  const ranked = [...eligible].sort(
    (a, b) => pairTotal(viewer, b) - pairTotal(viewer, a) || a.id.localeCompare(b.id)
  );
  const pool = ranked.slice(0, poolCap);

  const need = size - 1;
  if (pool.length < need) {
    return { teams: [], naive: null, liftOverNaive: 0, candidatesConsidered: pool.length, combinationsEvaluated: 0 };
  }

  const build = (others: User[]): DreamTeam => {
    const members = [viewer, ...others];
    const byDomain = computeTeamProficiency(members);
    const gaps = ALL_DOMAINS.filter(
      (d) => getDomainWeight(d, opts.requiredDomains) > 0 && byDomain[d] < 0.5
    );
    let sum = 0;
    let n = 0;
    let weakest: DreamTeam['weakestLink'] = null;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const s = pairTotal(members[i], members[j]);
        sum += s;
        n++;
        if (!weakest || s < weakest.score) {
          weakest = { aId: members[i].id, bId: members[j].id, score: s };
        }
      }
    }
    return {
      memberIds: members.map((m) => m.id),
      teamScore: Number(computeTeamScore(members, opts.requiredDomains, weights, pairTotal).toFixed(2)),
      byDomain,
      gaps,
      overlapHoursAll: computeTeamOverlapHours(members),
      avgPairScore: n ? Number((sum / n).toFixed(1)) : 0,
      weakestLink: weakest,
    };
  };

  const all = combos(pool, need).map(build);
  all.sort(
    (a, b) =>
      b.teamScore - a.teamScore || a.memberIds.join().localeCompare(b.memberIds.join())
  );

  const naive = build(ranked.slice(0, need));
  const best = all[0];
  return {
    teams: all.slice(0, top),
    naive,
    liftOverNaive: Number(Math.max(0, best.teamScore - naive.teamScore).toFixed(2)),
    candidatesConsidered: pool.length,
    combinationsEvaluated: all.length,
  };
}
