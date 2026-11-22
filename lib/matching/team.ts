import { Domain, Role, Team, TeamCoverage, User, Weights, DEFAULT_WEIGHTS } from '../types';
import { ALL_DOMAINS } from '../taxonomy';
import { getDomainProficiency } from './skills';
import { computePairwiseMatch } from './index';

export function getDomainWeight(d: Domain, requiredDomains?: Partial<Record<Domain, number>>): number {
  if (requiredDomains && Object.keys(requiredDomains).length > 0) {
    return requiredDomains[d] ?? 0;
  }
  return 1;
}

export function computeTeamProficiency(members: User[]): Record<Domain, number> {
  const coverage: Record<Domain, number> = {
    frontend: 0,
    backend: 0,
    ai_ml: 0,
    design: 0,
    product: 0,
    devops: 0,
    data: 0,
    mobile: 0,
  };

  if (members.length === 0) return coverage;

  const memberProfs = members.map((m) => getDomainProficiency(m.skills));

  for (const d of ALL_DOMAINS) {
    // Noisy-OR: p_T(d) = 1 − Π(1 − p_m(d))
    let productNotCovered = 1;
    for (const p of memberProfs) {
      productNotCovered *= (1 - (p[d] || 0));
    }
    coverage[d] = 1 - productNotCovered;
  }

  return coverage;
}

export function computeTeamOverlapHours(members: User[]): number {
  if (members.length === 0) return 0;
  let count = 0;
  for (let h = 0; h < 24; h++) {
    const allAvailable = members.every((m) => (m.availability?.hoursUtc?.[h] ?? 0) === 1);
    if (allAvailable) count++;
  }
  return count;
}

export function computeRoleImbalance(members: User[]): number {
  if (members.length <= 1) return 0;
  const counts: Partial<Record<Role, number>> = {};
  for (const m of members) {
    const primary = m.preferredRoles[0] || 'Frontend';
    counts[primary] = (counts[primary] || 0) + 1;
  }
  let maxCount = 0;
  for (const role in counts) {
    const val = counts[role as Role] || 0;
    if (val > maxCount) maxCount = val;
  }
  return (maxCount - 1) / (members.length - 1);
}

export function computeTeamScore(
  members: User[],
  requiredDomains?: Partial<Record<Domain, number>>,
  weights: Weights = DEFAULT_WEIGHTS,
  pairTotal?: (a: User, b: User) => number
): number {
  if (members.length === 0) return 0;
  const pairFn = pairTotal ?? ((a: User, b: User) => computePairwiseMatch(a, b, weights).total);

  const prof = computeTeamProficiency(members);
  let covNum = 0;
  let covDen = 0;
  for (const d of ALL_DOMAINS) {
    const w = getDomainWeight(d, requiredDomains);
    covNum += w * (prof[d] || 0);
    covDen += w;
  }
  const weightedCoverage = covDen > 0 ? covNum / covDen : 0;
  const roleImbalance = computeRoleImbalance(members);

  let avgPairwiseScore = 1.0;
  if (members.length >= 2) {
    let pairScoreSum = 0;
    let pairsCount = 0;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        pairScoreSum += pairFn(members[i], members[j]) / 100;
        pairsCount++;
      }
    }
    avgPairwiseScore = pairsCount > 0 ? pairScoreSum / pairsCount : 1.0;
  }

  const overlapHoursAll = computeTeamOverlapHours(members);

  // TeamScore = 100×(0.50·weightedCoverage + 0.20·(1 − roleImbalance) + 0.15·avgPairwiseScore + 0.15·min(1, overlapHoursAll/3))
  const rawScore = 100 * (
    0.50 * weightedCoverage +
    0.20 * (1 - roleImbalance) +
    0.15 * avgPairwiseScore +
    0.15 * Math.min(1, overlapHoursAll / 3)
  );

  return Math.min(100, Math.max(0, rawScore));
}

export function computeTeamCoverage(
  team: Team,
  allUsers: User[],
  weights: Weights = DEFAULT_WEIGHTS
): TeamCoverage {
  const members = team.memberIds
    .map((id) => allUsers.find((u) => u.id === id))
    .filter((u): u is User => u !== undefined);

  const byDomain = computeTeamProficiency(members);

  // gaps = domains with weight>0 and coverage<0.5
  const gaps: Domain[] = ALL_DOMAINS.filter((d) => {
    const w = getDomainWeight(d, team.requiredDomains);
    return w > 0 && (byDomain[d] || 0) < 0.5;
  });

  const overlapHoursAll = computeTeamOverlapHours(members);
  const currentTeamScore = computeTeamScore(members, team.requiredDomains, weights);

  // Suggestions: every discoverable, unteamed user ranked by TeamScore(T ∪ {c}) − TeamScore(T), with fillsDomains = gaps that c covers at p>=0.6.
  const suggestions: TeamCoverage['suggestions'] = [];

  const candidates = allUsers.filter(
    (u) => u.isDiscoverable && !u.teamId && !team.memberIds.includes(u.id)
  );

  for (const cand of candidates) {
    const nextMembers = [...members, cand];
    const nextScore = computeTeamScore(nextMembers, team.requiredDomains, weights);
    const marginalGain = Number((nextScore - currentTeamScore).toFixed(2));

    const candProf = getDomainProficiency(cand.skills);
    const fillsDomains = gaps.filter((g) => (candProf[g] || 0) >= 0.6);

    suggestions.push({
      userId: cand.id,
      marginalGain,
      fillsDomains,
    });
  }

  // Rank by marginal gain descending, then by average pairwise score with existing team members
  suggestions.sort((a, b) => {
    if (Math.abs(b.marginalGain - a.marginalGain) > 0.01) {
      return b.marginalGain - a.marginalGain;
    }
    const candA = allUsers.find((u) => u.id === a.userId);
    const candB = allUsers.find((u) => u.id === b.userId);
    if (!candA || !candB) return 0;
    const scoreA = members.reduce((acc, m) => acc + computePairwiseMatch(m, candA, weights).total, 0);
    const scoreB = members.reduce((acc, m) => acc + computePairwiseMatch(m, candB, weights).total, 0);
    return scoreB - scoreA;
  });

  return {
    byDomain,
    gaps,
    overlapHoursAll,
    suggestions,
  };
}
