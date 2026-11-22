import { Goal, User } from '../types';

export function jaccard<T>(setA: T[], setB: T[]): number {
  if (setA.length === 0 && setB.length === 0) return 0;
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  const setBSet = new Set(setB);
  const intersection = setA.filter((item) => setBSet.has(item));
  return intersection.length / union.size;
}

export function computeGoalsScore(
  userA: Pick<User, 'tracks' | 'goals' | 'ambition'>,
  userB: Pick<User, 'tracks' | 'goals' | 'ambition'>
): {
  score: number;
  trackJaccard: number;
  goalsJaccard: number;
  ambitionScore: number;
  sharedTracks: string[];
  sharedGoals: Goal[];
} {
  const sharedTracks = userA.tracks.filter((t) => userB.tracks.includes(t));
  const sharedGoals = userA.goals.filter((g) => userB.goals.includes(g));

  const trackJaccard = jaccard(userA.tracks, userB.tracks);
  const goalsJaccard = jaccard(userA.goals, userB.goals);

  // Ambition is 1..5. Difference in 0..4.
  const diffAmbition = Math.abs(userA.ambition - userB.ambition);
  const ambitionScore = Math.max(0, 1 - diffAmbition / 4);

  // G = 0.50·Jaccard(tracks_u, tracks_c) + 0.30·Jaccard(goals_u, goals_c) + 0.20·(1 − |ambition_u − ambition_c|/4)
  const score = Math.min(
    1,
    Math.max(0, 0.50 * trackJaccard + 0.30 * goalsJaccard + 0.20 * ambitionScore)
  );

  return {
    score,
    trackJaccard,
    goalsJaccard,
    ambitionScore,
    sharedTracks,
    sharedGoals,
  };
}
