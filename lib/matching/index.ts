import { MatchBreakdown, User, Weights, DEFAULT_WEIGHTS } from '../types';
import { getDomainProficiency, computeSkillsScore } from './skills';
import { computeGoalsScore } from './goals';
import { computeAvailabilityScore } from './availability';
import { computeRolesAndCollabScore } from './roles';
import { generateExplanations } from './explain';

export function normalizeWeights(weights: Partial<Weights>): Weights {
  const s = Math.max(0, weights.skills ?? DEFAULT_WEIGHTS.skills);
  const t = Math.max(0, weights.track ?? DEFAULT_WEIGHTS.track);
  const a = Math.max(0, weights.availability ?? DEFAULT_WEIGHTS.availability);
  const r = Math.max(0, weights.role ?? DEFAULT_WEIGHTS.role);

  const sum = s + t + a + r;
  if (sum === 0) {
    return { ...DEFAULT_WEIGHTS };
  }

  return {
    skills: s / sum,
    track: t / sum,
    availability: a / sum,
    role: r / sum,
  };
}

export function computePairwiseMatch(
  viewer: User,
  candidate: User,
  weightsInput?: Partial<Weights>
): MatchBreakdown {
  const weights = weightsInput ? normalizeWeights(weightsInput) : DEFAULT_WEIGHTS;

  const profViewer = getDomainProficiency(viewer.skills);
  const profCand = getDomainProficiency(candidate.skills);

  const skillsScore = computeSkillsScore(profViewer, profCand);
  const trackScore = computeGoalsScore(viewer, candidate);
  const availScore = computeAvailabilityScore(viewer.availability, candidate.availability);
  const roleScore = computeRolesAndCollabScore(viewer, candidate);

  return generateExplanations(
    viewer,
    candidate,
    {
      skills: skillsScore,
      track: trackScore,
      availability: availScore,
      role: roleScore,
    },
    weights
  );
}

export * from './skills';
export * from './goals';
export * from './availability';
export * from './roles';
export * from './explain';
export * from './team';
export * from './dreamTeam';
export * from './audit';
export * from './kickoff';
