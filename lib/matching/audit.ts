import { User, Weights, DEFAULT_WEIGHTS } from '../types';
import { computePairwiseMatch } from './index';

/** Mutual fit: a pairing is only as good as its worse direction (score is not symmetric). */
export function computeMutualScore(a: User, b: User, weights: Weights = DEFAULT_WEIGHTS): number {
  return Math.min(
    computePairwiseMatch(a, b, weights).total,
    computePairwiseMatch(b, a, weights).total
  );
}

export interface ExposureEntry {
  userId: string;
  /** In how many other participants' Top-N feeds this person appears. */
  exposure: number;
}

export interface ExposureAudit {
  topN: number;
  eligibleCount: number;
  entries: ExposureEntry[]; // sorted: most exposed first
  /** Inequality of exposure: 0 = everyone seen equally, 1 = one person gets all attention. */
  gini: number;
  avgByExperience: Record<User['experienceLevel'], number | null>;
  /** Eligible participants who appear in nobody's Top-N. */
  unseenIds: string[];
  /** Highest exposure divided by mean exposure (popularity concentration). */
  concentration: number;
}

export function eligiblePool(users: User[]): User[] {
  return users.filter((u) => u.isDiscoverable && !u.teamId);
}

export function gini(values: number[]): number {
  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  if (n === 0 || sum === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  let weighted = 0;
  sorted.forEach((v, i) => (weighted += (i + 1) * v));
  return Number(((2 * weighted) / (n * sum) - (n + 1) / n).toFixed(3));
}

/**
 * Exposure audit: simulates every eligible participant's Top-N feed and counts who gets seen.
 * Supports the brief's safeguard "audit exposure across participants".
 */
export function computeExposureAudit(
  users: User[],
  weights: Weights = DEFAULT_WEIGHTS,
  topN = 5
): ExposureAudit {
  const pool = eligiblePool(users);
  const counts = new Map<string, number>(pool.map((u) => [u.id, 0]));

  for (const viewer of pool) {
    const ranked = pool
      .filter((c) => c.id !== viewer.id)
      .map((c) => ({ id: c.id, total: computePairwiseMatch(viewer, c, weights).total }))
      .sort((a, b) => b.total - a.total || a.id.localeCompare(b.id))
      .slice(0, topN);
    for (const r of ranked) counts.set(r.id, (counts.get(r.id) ?? 0) + 1);
  }

  const entries = [...counts.entries()]
    .map(([userId, exposure]) => ({ userId, exposure }))
    .sort((a, b) => b.exposure - a.exposure || a.userId.localeCompare(b.userId));

  const avg = (level: User['experienceLevel']): number | null => {
    const group = pool.filter((u) => u.experienceLevel === level);
    if (!group.length) return null;
    return Number((group.reduce((s, u) => s + (counts.get(u.id) ?? 0), 0) / group.length).toFixed(2));
  };

  const total = entries.reduce((s, e) => s + e.exposure, 0);
  const mean = entries.length ? total / entries.length : 0;

  return {
    topN,
    eligibleCount: pool.length,
    entries,
    gini: gini(entries.map((e) => e.exposure)),
    avgByExperience: { first_timer: avg('first_timer'), some: avg('some'), veteran: avg('veteran') },
    unseenIds: entries.filter((e) => e.exposure === 0).map((e) => e.userId),
    concentration: mean > 0 ? Number((entries[0].exposure / mean).toFixed(2)) : 0,
  };
}

export interface Introduction {
  aId: string;
  bId: string;
  mutualScore: number;
  reason: string;
}

/**
 * Cold-start helper ("organizer-led introductions"): pairs the least-exposed participants
 * with their best mutual match, so nobody is left out of the feed.
 */
export function suggestIntroductions(
  users: User[],
  weights: Weights = DEFAULT_WEIGHTS,
  max = 6,
  topN = 5
): Introduction[] {
  const audit = computeExposureAudit(users, weights, topN);
  const pool = eligiblePool(users);
  const byId = new Map(pool.map((u) => [u.id, u]));
  const used = new Set<string>();
  const out: Introduction[] = [];

  const lowFirst = [...audit.entries].sort(
    (a, b) => a.exposure - b.exposure || a.userId.localeCompare(b.userId)
  );

  for (const { userId } of lowFirst) {
    if (out.length >= max) break;
    if (used.has(userId)) continue;
    const a = byId.get(userId)!;
    let best: { u: User; s: number } | null = null;
    for (const b of pool) {
      if (b.id === a.id || used.has(b.id)) continue;
      const s = computeMutualScore(a, b, weights);
      if (!best || s > best.s || (s === best.s && b.id < best.u.id)) best = { u: b, s };
    }
    if (!best) continue;
    const m = computePairwiseMatch(a, best.u, weights);
    const g = m.youGain[0];
    const t = m.theyGain[0];
    const parts: string[] = [];
    if (g) parts.push(`${best.u.name.split(' ')[0]} adds ${g.skill}`);
    if (t) parts.push(`${a.name.split(' ')[0]} adds ${t.skill}`);
    if (m.overlapHours >= 2) parts.push(`${m.overlapHours}h shared time`);
    used.add(a.id);
    used.add(best.u.id);
    out.push({
      aId: a.id,
      bId: best.u.id,
      mutualScore: best.s,
      reason: parts.join(' · ') || 'Balanced fit',
    });
  }
  return out;
}
