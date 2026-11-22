import { describe, it, expect } from 'vitest';
import { SEED_USERS, SCENARIO_B } from '../seed';
import {
  computePairwiseMatch,
  normalizeWeights,
  computeRoleScore,
  computeAvailabilityScore,
  computeSkillsScore,
  getDomainProficiency,
  computeTeamProficiency,
  computeTeamScore,
  computeTeamCoverage,
} from '../lib/matching';
import { User } from '../lib/types';
import { ALL_DOMAINS } from '../lib/taxonomy';

describe('SkillSync Matching Engine Test Suite', () => {
  const ananya = SEED_USERS.find((u) => u.id === 'ananya')!;
  const rohan = SEED_USERS.find((u) => u.id === 'rohan')!;
  const vikram = SEED_USERS.find((u) => u.id === 'vikram')!;
  const emily = SEED_USERS.find((u) => u.id === 'emily')!;

  // 1. Popular trap: for Ananya, Rohan score > Vikram score
  it('1. Popular trap: for Ananya, complementary Rohan scores higher than redundant superstar Vikram', () => {
    expect(ananya).toBeDefined();
    expect(rohan).toBeDefined();
    expect(vikram).toBeDefined();

    const candidates = SEED_USERS.filter((u) => u.id !== ananya.id);
    const ranked = candidates
      .map((c) => ({
        name: c.name,
        id: c.id,
        role: c.preferredRoles[0],
        total: computePairwiseMatch(ananya, c).total,
        skillsScore: computePairwiseMatch(ananya, c).factors.find((f) => f.key === 'skills')?.score,
      }))
      .sort((a, b) => b.total - a.total);

    console.log('TOP 5 MATCHES FOR ANANYA:');
    ranked.slice(0, 5).forEach((m, idx) => {
      console.log(`${idx + 1}. ${m.name} (${m.role}) - Score: ${m.total}`);
    });
    console.log(`Vikram Shah rank: ${ranked.findIndex((r) => r.id === 'vikram') + 1} (Score: ${ranked.find((r) => r.id === 'vikram')?.total})`);

    const rohanMatch = computePairwiseMatch(ananya, rohan);
    const vikramMatch = computePairwiseMatch(ananya, vikram);

    // Rohan must be higher than Vikram for Ananya
    expect(rohanMatch.total).toBeGreaterThan(vikramMatch.total);
    expect(ranked[0].id).toBe('rohan');
    // Rohan fills Ananya's AI/ML gap
    expect(rohanMatch.factors.find((f) => f.key === 'skills')?.score).toBeGreaterThan(
      vikramMatch.factors.find((f) => f.key === 'skills')?.score!
    );
  });

  // 2. Zero availability overlap gives A = 0 and a caution string
  it('2. Zero availability overlap gives A = 0 and a caution string', () => {
    const zeroAvailCandidate: User = {
      ...rohan,
      id: 'zero-avail',
      availability: {
        timezone: 'Pacific/Honolulu',
        utcOffsetMinutes: -600,
        hoursUtc: new Array(24).fill(0),
        hoursPerDay: 0,
      },
    };

    const availScore = computeAvailabilityScore(ananya.availability, zeroAvailCandidate.availability);
    expect(availScore.score).toBe(0);
    expect(availScore.hasCaution).toBe(true);
    expect(availScore.cautionText).toBeDefined();
    expect(availScore.cautionText?.length).toBeGreaterThan(0);

    const match = computePairwiseMatch(ananya, zeroAvailCandidate);
    expect(match.cautions.length).toBeGreaterThan(0);
    expect(match.cautions.some((c) => c.toLowerCase().includes('overlap') || c.toLowerCase().includes('schedule'))).toBe(true);
  });

  // 3. User with empty skills does not crash; S is defined and in [0,1]
  it('3. User with empty skills does not crash; S is defined and in [0,1]', () => {
    const emptySkillUser: User = {
      ...ananya,
      id: 'empty-skills',
      skills: [],
    };

    const profEmpty = getDomainProficiency(emptySkillUser.skills);
    const profRohan = getDomainProficiency(rohan.skills);

    const sResult = computeSkillsScore(profEmpty, profRohan);
    expect(sResult.score).toBeGreaterThanOrEqual(0);
    expect(sResult.score).toBeLessThanOrEqual(1);
    expect(Number.isNaN(sResult.score)).toBe(false);

    const match = computePairwiseMatch(emptySkillUser, rohan);
    expect(match.total).toBeGreaterThanOrEqual(0);
    expect(match.total).toBeLessThanOrEqual(100);
  });

  // 4. Two same-role people get RoleScore 0.2; complement pair gets 1.0
  it('4. Two same-role people get RoleScore 0.2; complement pair gets 1.0', () => {
    const sameRoleScore = computeRoleScore('Frontend', 'Frontend');
    expect(sameRoleScore).toBe(0.2);

    const complementScore1 = computeRoleScore('Frontend', 'Backend');
    expect(complementScore1).toBe(1.0);

    const complementScore2 = computeRoleScore('Backend', 'AI/ML');
    expect(complementScore2).toBe(1.0);

    const complementScore3 = computeRoleScore('AI/ML', 'UI/UX');
    expect(complementScore3).toBe(1.0);

    const complementScore4 = computeRoleScore('PM', 'Frontend');
    expect(complementScore4).toBe(1.0);
  });

  // 5. Adding a member who fills a gap never lowers team domain coverage (monotonicity) and marginalGain > 0
  it('5. Monotonicity: adding a member never lowers team domain coverage, and marginalGain > 0', () => {
    const initialMembers = [ananya];
    const initialCoverage = computeTeamProficiency(initialMembers);
    const initialScore = computeTeamScore(initialMembers);

    const candidateToJoin = rohan;
    const newMembers = [...initialMembers, candidateToJoin];
    const newCoverage = computeTeamProficiency(newMembers);
    const newScore = computeTeamScore(newMembers);

    // Monotonicity check across all 8 domains
    for (const d of ALL_DOMAINS) {
      expect(newCoverage[d]).toBeGreaterThanOrEqual(initialCoverage[d]);
    }

    // AI/ML domain coverage must strictly increase
    expect(newCoverage.ai_ml).toBeGreaterThan(initialCoverage.ai_ml);
    expect(newScore).toBeGreaterThan(initialScore);
  });

  // 6. Weights always sum to 1 after normalization; total in [0,100]; determinism
  it('6. Weights always sum to 1 after normalization; total in [0,100]; same inputs give same output', () => {
    const customWeights = { skills: 0.8, track: 0.5, availability: 0.1, role: 0.2 };
    const normalized = normalizeWeights(customWeights);
    const sum = normalized.skills + normalized.track + normalized.availability + normalized.role;
    expect(Math.abs(sum - 1)).toBeLessThan(1e-6);

    const match1 = computePairwiseMatch(ananya, rohan, normalized);
    const match2 = computePairwiseMatch(ananya, rohan, normalized);

    expect(match1.total).toBe(match2.total);
    expect(match1.total).toBeGreaterThanOrEqual(0);
    expect(match1.total).toBeLessThanOrEqual(100);
    expect(JSON.stringify(match1)).toBe(JSON.stringify(match2));
  });

  // 7. Scenario B: top suggestion for Team Nexus is Rohan and AI/ML coverage rises after he is added
  it('7. Scenario B: top suggestion for Team Nexus is Rohan and AI/ML coverage rises after he is added', () => {
    const teamNexus = SCENARIO_B.teams.find((t) => t.id === 'team-nexus')!;
    expect(teamNexus).toBeDefined();

    const coverageReport = computeTeamCoverage(teamNexus, SCENARIO_B.users);
    console.log('Scenario B Suggestions:', coverageReport.suggestions.slice(0, 5));
    expect(coverageReport.gaps).toContain('ai_ml');
    expect(coverageReport.byDomain.ai_ml).toBeLessThan(0.3); // around 0% or ~20%

    // Top suggestion must be Rohan
    expect(coverageReport.suggestions.length).toBeGreaterThan(0);
    const topSuggestion = coverageReport.suggestions[0];
    expect(topSuggestion.userId).toBe('rohan');
    expect(topSuggestion.marginalGain).toBeGreaterThan(0);
    expect(topSuggestion.fillsDomains).toContain('ai_ml');

    // After adding Rohan
    const updatedMembers = [
      ...teamNexus.memberIds.map((id) => SCENARIO_B.users.find((u) => u.id === id)!),
      rohan,
    ];
    const updatedCoverage = computeTeamProficiency(updatedMembers);
    // Rohan has PyTorch 4/5 (0.8), so 1 - (1 - 0)(1 - 0.8) = 0.8 (80%)
    expect(updatedCoverage.ai_ml).toBeGreaterThanOrEqual(0.75);
  });
});

import { findDreamTeams } from '../lib/matching';

describe('Dream Team Assembler', () => {
  const users = SCENARIO_B.users as User[];
  const ananya = users.find((u) => u.id === 'ananya')!;
  const free = (u: User) => u.isDiscoverable && !u.teamId && u.id !== 'ananya';

  it('8. returns full-size teams that start with the viewer and use only free, discoverable people', () => {
    const r = findDreamTeams(ananya, users, { size: 4, top: 3 });
    expect(r.teams.length).toBe(3);
    for (const t of r.teams) {
      expect(t.memberIds.length).toBe(4);
      expect(t.memberIds[0]).toBe('ananya');
      expect(new Set(t.memberIds).size).toBe(4);
      for (const id of t.memberIds.slice(1)) {
        expect(free(users.find((u) => u.id === id)!)).toBe(true);
      }
    }
  });

  it('9. is deterministic and sorted best-first', () => {
    const a = findDreamTeams(ananya, users);
    const b = findDreamTeams(ananya, users);
    expect(a).toEqual(b);
    for (let i = 1; i < a.teams.length; i++) {
      expect(a.teams[i - 1].teamScore).toBeGreaterThanOrEqual(a.teams[i].teamScore);
    }
  });

  it('10. never loses to the naive "top individual matches" team', () => {
    for (const viewer of users.filter((u) => u.isDiscoverable)) {
      const r = findDreamTeams(viewer, users);
      if (!r.naive) continue;
      expect(r.teams[0].teamScore).toBeGreaterThanOrEqual(r.naive.teamScore);
      expect(r.liftOverNaive).toBeGreaterThanOrEqual(0);
    }
  });

  it('11. matches Team Space scoring for the same members', () => {
    const r = findDreamTeams(ananya, users);
    const t = r.teams[0];
    const members = t.memberIds.map((id) => users.find((u) => u.id === id)!);
    expect(t.teamScore).toBeCloseTo(computeTeamScore(members), 1);
  });

  it('12. returns no teams when the pool is too small', () => {
    const r = findDreamTeams(ananya, users.slice(0, 3), { size: 4 });
    expect(r.teams).toEqual([]);
  });
});

import {
  computeExposureAudit,
  computeMutualScore,
  suggestIntroductions,
  suggestRoles,
  suggestMilestone,
  gini,
} from '../lib/matching';

describe('Fairness audit, introductions and kickoff plan', () => {
  const users = SCENARIO_B.users as User[];

  it('13. gini is 0 for equal exposure and approaches 1 for concentrated exposure', () => {
    expect(gini([3, 3, 3, 3])).toBe(0);
    expect(gini([0, 0, 0, 12])).toBeGreaterThan(0.7);
    expect(gini([])).toBe(0);
  });

  it('14. exposure audit is deterministic and each viewer contributes exactly topN views', () => {
    const a = computeExposureAudit(users, undefined, 5);
    expect(a).toEqual(computeExposureAudit(users, undefined, 5));
    const total = a.entries.reduce((s, e) => s + e.exposure, 0);
    expect(total).toBe(a.eligibleCount * Math.min(5, a.eligibleCount - 1));
    expect(a.gini).toBeGreaterThanOrEqual(0);
    expect(a.gini).toBeLessThanOrEqual(1);
  });

  it('15. mutual score never exceeds either direction', () => {
    const [a, b] = [users[0], users[1]];
    const m = computeMutualScore(a, b);
    expect(m).toBeLessThanOrEqual(computePairwiseMatch(a, b).total);
    expect(m).toBeLessThanOrEqual(computePairwiseMatch(b, a).total);
  });

  it('16. introductions are disjoint pairs of eligible participants', () => {
    const intros = suggestIntroductions(users);
    const seen = new Set<string>();
    expect(intros.length).toBeGreaterThan(0);
    for (const i of intros) {
      expect(seen.has(i.aId) || seen.has(i.bId)).toBe(false);
      seen.add(i.aId);
      seen.add(i.bId);
      for (const id of [i.aId, i.bId]) {
        const u = users.find((x) => x.id === id)!;
        expect(u.isDiscoverable && !u.teamId).toBe(true);
      }
    }
  });

  it('17. role suggestion gives each required domain one owner, preferring the strongest member', () => {
    const team = SCENARIO_B.teams.find((t) => t.id === 'team-nexus')!;
    const members = team.memberIds.map((id) => users.find((u) => u.id === id)!);
    const { assignments, unowned } = suggestRoles(members, team.requiredDomains);
    expect(Object.keys(assignments).sort()).toEqual([...team.memberIds].sort());
    // Team Nexus lacks AI/ML and design at the start
    expect(unowned).toContain('ai_ml');
    const text = suggestMilestone(team, members, assignments);
    expect(text).toContain('Open risk');
  });
});
