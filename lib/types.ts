export type Domain = 'frontend' | 'backend' | 'ai_ml' | 'design' | 'product' | 'devops' | 'data' | 'mobile';

export type Role = 'Frontend' | 'Backend' | 'AI/ML' | 'UI/UX' | 'PM';

export type Confidence = 1 | 2 | 3 | 4 | 5;

export type Goal = 'win' | 'learn' | 'ship_startup' | 'network' | 'portfolio' | 'fun';

export type CollabStyle = {
  pace: 'async' | 'sync';
  structure: 'planned' | 'exploratory';
};

export interface Skill {
  name: string;
  domain: Domain;
  confidence: Confidence;
  wantsToLearn?: boolean;
}

export interface Availability {
  timezone: string;
  utcOffsetMinutes: number;
  hoursUtc: number[]; /* 24 ints 0|1 */
  hoursPerDay: number;
}

export interface User {
  id: string;
  name: string;
  avatarSeed: string;
  headline: string;
  bio: string;
  skills: Skill[];
  preferredRoles: Role[]; /* ordered */
  tracks: string[];
  goals: Goal[];
  ambition: 1 | 2 | 3 | 4 | 5;
  collab: CollabStyle;
  availability: Availability;
  experienceLevel: 'first_timer' | 'some' | 'veteran';
  isDiscoverable: boolean;
  teamId: string | null;
  contact?: string;
}

export interface Team {
  id: string;
  eventId: string;
  name: string;
  idea?: string;
  tracks: string[];
  memberIds: string[];
  maxSize: number; /* default 4 */
  requiredDomains: Partial<Record<Domain, number>>;
  createdBy: string;
  /** Agreed owner domain per member id (Kickoff Plan). */
  roleAssignments?: Record<string, Domain>;
  /** Agreed first milestone (Kickoff Plan). */
  milestone?: string;
}

export interface TeamCoverage {
  byDomain: Record<Domain, number>;
  gaps: Domain[];
  overlapHoursAll: number;
  suggestions: {
    userId: string;
    marginalGain: number;
    fillsDomains: Domain[];
  }[];
}

export type Verdict = 'strong' | 'good' | 'fair' | 'weak';

export interface Weights {
  skills: number;
  track: number;
  availability: number;
  role: number;
} // sum to 1

export const DEFAULT_WEIGHTS: Weights = {
  skills: 0.40,
  track: 0.25,
  availability: 0.20,
  role: 0.15,
};

export interface FactorBreakdown {
  key: 'skills' | 'track' | 'availability' | 'role';
  label: string;
  weight: number;
  score: number; /* 0..1 */
  points: number; /* weight * score * 100 */
  verdict: Verdict;
  headline: string;
  evidence: string[];
}

export interface MatchBreakdown {
  viewerId: string;
  candidateId: string;
  total: number; /* 0..100 rounded */
  factors: FactorBreakdown[];
  summary: string;
  youGain: { domain: Domain; skill: string; delta: number }[];
  theyGain: { domain: Domain; skill: string; delta: number }[];
  sharedTracks: string[];
  sharedGoals: Goal[];
  overlapWindowUtc: { startHour: number; endHour: number }[];
  overlapHours: number;
  cautions: string[];
  mentorshipBonus?: number;
  weightsUsed: Weights;
}

export interface Invite {
  id: string;
  fromUserId: string;
  toUserId: string;
  teamId: string | null;
  message: string;
  matchScoreSnapshot: number;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  createdAt: string;
  respondedAt?: string;
}
