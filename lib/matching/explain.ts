import {
  Domain,
  FactorBreakdown,
  Goal,
  MatchBreakdown,
  User,
  Verdict,
  Weights,
  DEFAULT_WEIGHTS,
} from '../types';
import { ALL_DOMAINS, DOMAINS, GOALS } from '../taxonomy';
import { getDomainProficiency } from './skills';
import { isComplementaryRolePair } from './roles';

export function getVerdict(score: number): Verdict {
  if (score >= 0.75) return 'strong';
  if (score >= 0.5) return 'good';
  if (score >= 0.3) return 'fair';
  return 'weak';
}

export function formatUtcHourToTz(utcHour: number, offsetMinutes: number): string {
  const localMinutes = ((utcHour * 60 + offsetMinutes) % 1440 + 1440) % 1440;
  const h = Math.floor(localMinutes / 60);
  const m = localMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function generateExplanations(
  viewer: User,
  candidate: User,
  scores: {
    skills: { score: number; gapFill: number; coverage: number; redundancy: number };
    track: {
      score: number;
      trackJaccard: number;
      goalsJaccard: number;
      ambitionScore: number;
      sharedTracks: string[];
      sharedGoals: Goal[];
    };
    availability: {
      score: number;
      overlapHours: number;
      overlapWindows: { startHour: number; endHour: number }[];
      hasCaution: boolean;
      cautionText?: string;
    };
    role: { score: number; roleScore: number; collabScore: number };
  },
  weights: Weights = DEFAULT_WEIGHTS
): MatchBreakdown {
  const profViewer = getDomainProficiency(viewer.skills);
  const profCand = getDomainProficiency(candidate.skills);

  // Identify Viewer gaps: domains where viewer has proficiency < 0.6
  const viewerGaps: { domain: Domain; label: string; viewerVal: number; candVal: number; deltaVal: number }[] = [];
  for (const d of ALL_DOMAINS) {
    const pU = profViewer[d] || 0;
    const pC = profCand[d] || 0;
    if (pU < 0.6 && pC > pU) {
      const domainDef = DOMAINS.find((dom) => dom.id === d);
      viewerGaps.push({
        domain: d,
        label: domainDef ? domainDef.label : d,
        viewerVal: Math.round(pU * 5),
        candVal: Math.round(pC * 5),
        deltaVal: Math.round(pC * 5) - Math.round(pU * 5),
      });
    }
  }

  // Sorted gaps by largest delta
  viewerGaps.sort((a, b) => b.deltaVal - a.deltaVal);

  // Skill Evidence & Headline
  const totalViewerGapsCount = ALL_DOMAINS.filter((d) => (profViewer[d] || 0) < 0.6).length;
  const skillsHeadline = viewerGaps.length > 0
    ? `${candidate.name} fills ${viewerGaps.length} of your ${totalViewerGapsCount} biggest gaps`
    : scores.skills.redundancy > 0.6
    ? `High skill overlap with ${candidate.name} — duplicate capabilities`
    : `${candidate.name} offers balanced skill alignment`;

  const skillsEvidence: string[] = [];
  for (const gap of viewerGaps.slice(0, 2)) {
    skillsEvidence.push(`${gap.label}: you ${gap.viewerVal}/5, ${candidate.name} ${gap.candVal}/5 (+${gap.deltaVal})`);
  }
  if (scores.skills.redundancy >= 0.4) {
    const overlappingDomains = ALL_DOMAINS.filter(
      (d) => (profViewer[d] || 0) >= 0.6 && (profCand[d] || 0) >= 0.6
    ).map((d) => DOMAINS.find((dom) => dom.id === d)?.label || d);
    if (overlappingDomains.length > 0) {
      skillsEvidence.push(`Overlap: you both rate ${overlappingDomains.slice(0, 2).join(', ')} 4+`);
    }
  }
  if (skillsEvidence.length === 0) {
    skillsEvidence.push('Complementary skill distributions across project domains');
  }

  // You Gain / They Gain
  const youGain: { domain: Domain; skill: string; delta: number }[] = [];
  for (const cs of candidate.skills) {
    const viewerMax = profViewer[cs.domain] * 5;
    if (cs.confidence > viewerMax) {
      youGain.push({
        domain: cs.domain,
        skill: cs.name,
        delta: cs.confidence - Math.round(viewerMax),
      });
    }
  }

  const theyGain: { domain: Domain; skill: string; delta: number }[] = [];
  for (const vs of viewer.skills) {
    const candMax = profCand[vs.domain] * 5;
    if (vs.confidence > candMax) {
      theyGain.push({
        domain: vs.domain,
        skill: vs.name,
        delta: vs.confidence - Math.round(candMax),
      });
    }
  }

  // Track Evidence & Headline
  const sharedTracks = scores.track.sharedTracks;
  const sharedGoals = scores.track.sharedGoals;
  let trackHeadline = 'Compatible track and project ambitions';
  if (sharedTracks.length > 0) {
    trackHeadline = sharedTracks.length > 1
      ? `You both target ${sharedTracks.join(' & ')}`
      : `Shared track: ${sharedTracks[0]}`;
  } else if (sharedGoals.includes('ship_startup')) {
    trackHeadline = 'Both aiming to ship a startup';
  } else if (sharedGoals.includes('win')) {
    trackHeadline = 'Both highly competitive aiming to win';
  }

  const trackEvidence: string[] = [];
  if (sharedTracks.length > 0) {
    trackEvidence.push(`Shared track: ${sharedTracks.join(', ')}`);
  }
  if (sharedGoals.length > 0) {
    const goalLabels = sharedGoals.map((g) => GOALS.find((gl) => gl.id === g)?.label || g);
    trackEvidence.push(`Shared goals: ${goalLabels.join(', ')}`);
  }
  if (Math.abs(viewer.ambition - candidate.ambition) <= 1) {
    trackEvidence.push(`Matched ambition level: ${viewer.ambition}/5 vs ${candidate.ambition}/5`);
  }

  // Availability Evidence & Headline
  const tzOffset = viewer.availability.utcOffsetMinutes || 330; // default IST 330
  const tzName = viewer.availability.timezone || 'Asia/Kolkata';
  const tzAbbr = tzName.includes('Kolkata') ? 'IST' : tzName.includes('Pacific') ? 'PT' : 'Local';
  const availHeadline = `${scores.availability.overlapHours}h/day of shared working time`;
  const availEvidence: string[] = [];

  if (scores.availability.overlapWindows.length > 0) {
    const winStrs = scores.availability.overlapWindows.map(
      (w) => `${formatUtcHourToTz(w.startHour, tzOffset)}-${formatUtcHourToTz(w.endHour, tzOffset)} ${tzAbbr}`
    );
    availEvidence.push(`Overlap: ${winStrs.join(', ')}`);
  } else {
    availEvidence.push('No concurrent working blocks available');
  }
  availEvidence.push(`${candidate.name} is available ~${candidate.availability.hoursPerDay}h/day in ${candidate.availability.timezone}`);

  // Role Evidence & Headline
  const roleA = viewer.preferredRoles[0] || 'Frontend';
  const roleB = candidate.preferredRoles[0] || 'Backend';
  let roleHeadline = `${roleA} + ${roleB} is a balanced pairing`;
  if (roleA === roleB) {
    roleHeadline = `Duplicate primary role (${roleA})`;
  } else if (isComplementaryRolePair(roleA, roleB)) {
    roleHeadline = `Ideal synergy: ${roleA} and ${roleB}`;
  }

  const roleEvidence: string[] = [];
  roleEvidence.push(`Primary roles: ${viewer.name} (${roleA}) + ${candidate.name} (${roleB})`);
  if (viewer.collab.pace !== candidate.collab.pace) {
    roleEvidence.push(`You prefer ${viewer.collab.pace}; ${candidate.name} prefers ${candidate.collab.pace} (mild mismatch)`);
  } else {
    roleEvidence.push(`Both prefer ${viewer.collab.pace} communication cadence`);
  }
  if (viewer.collab.structure === candidate.collab.structure) {
    roleEvidence.push(`Both follow ${viewer.collab.structure} execution style`);
  }

  // Cautions
  const cautions: string[] = [];
  if (scores.availability.hasCaution && scores.availability.cautionText) {
    cautions.push(scores.availability.cautionText);
  }
  if (roleA === roleB) {
    cautions.push(`Both prefer ${roleA} role — potential task division clash`);
  }
  if (scores.skills.redundancy >= 0.6) {
    cautions.push(`High skill redundancy (${Math.round(scores.skills.redundancy * 100)}%) with low gap-fill`);
  }

  // Mentorship bonus
  // Up to +5 points when one side is first_timer or has wantsToLearn skills and other is some/veteran with confidence>=4 in matching domain
  let mentorshipBonus = 0;
  const viewerIsLearner = viewer.experienceLevel === 'first_timer' || viewer.skills.some((s) => s.wantsToLearn);
  const candIsMentor = (candidate.experienceLevel === 'veteran' || candidate.experienceLevel === 'some');
  const candIsLearner = candidate.experienceLevel === 'first_timer' || candidate.skills.some((s) => s.wantsToLearn);
  const viewerIsMentor = (viewer.experienceLevel === 'veteran' || viewer.experienceLevel === 'some');

  let hasMentorship = false;
  if (viewerIsLearner && candIsMentor) {
    // Check if candidate has confidence >= 4 in a domain viewer wants to learn or has low confidence in
    const matchingDomain = viewer.skills.find(
      (s) => s.wantsToLearn && (profCand[s.domain] || 0) >= 0.8
    ) || ALL_DOMAINS.find((d) => (profViewer[d] || 0) < 0.4 && (profCand[d] || 0) >= 0.8);
    if (matchingDomain) {
      hasMentorship = true;
    }
  }
  if (!hasMentorship && candIsLearner && viewerIsMentor) {
    const matchingDomain = candidate.skills.find(
      (s) => s.wantsToLearn && (profViewer[s.domain] || 0) >= 0.8
    ) || ALL_DOMAINS.find((d) => (profCand[d] || 0) < 0.4 && (profViewer[d] || 0) >= 0.8);
    if (matchingDomain) {
      hasMentorship = true;
    }
  }

  if (hasMentorship) {
    mentorshipBonus = 5;
  }

  // Factor breakdowns
  const sScore = scores.skills.score;
  const tScore = scores.track.score;
  const aScore = scores.availability.score;
  const rScore = scores.role.score;

  const factors: FactorBreakdown[] = [
    {
      key: 'skills',
      label: 'Skill Complementarity',
      weight: weights.skills,
      score: sScore,
      points: Math.round(weights.skills * sScore * 100),
      verdict: getVerdict(sScore),
      headline: skillsHeadline,
      evidence: skillsEvidence,
    },
    {
      key: 'track',
      label: 'Track & Goals Alignment',
      weight: weights.track,
      score: tScore,
      points: Math.round(weights.track * tScore * 100),
      verdict: getVerdict(tScore),
      headline: trackHeadline,
      evidence: trackEvidence,
    },
    {
      key: 'availability',
      label: 'Schedule Overlap',
      weight: weights.availability,
      score: aScore,
      points: Math.round(weights.availability * aScore * 100),
      verdict: getVerdict(aScore),
      headline: availHeadline,
      evidence: availEvidence,
    },
    {
      key: 'role',
      label: 'Role & Collab Style',
      weight: weights.role,
      score: rScore,
      points: Math.round(weights.role * rScore * 100),
      verdict: getVerdict(rScore),
      headline: roleHeadline,
      evidence: roleEvidence,
    },
  ];

  const baseTotal = 100 * (
    weights.skills * sScore +
    weights.track * tScore +
    weights.availability * aScore +
    weights.role * rScore
  );

  const total = Math.min(100, Math.round(baseTotal + mentorshipBonus));

  // Summary sentence
  const topGain = viewerGaps[0];
  let summary = '';
  if (total >= 80) {
    summary = topGain
      ? `Strong match: ${candidate.name} covers your ${topGain.label} gap and overlaps ${scores.availability.overlapHours}h/day.`
      : `Strong match: ${candidate.name} provides high synergy and overlaps ${scores.availability.overlapHours}h/day.`;
  } else if (total >= 60) {
    summary = `Good match: ${candidate.name} brings solid capabilities with ${scores.availability.overlapHours}h shared schedule.`;
  } else if (total >= 40) {
    summary = `Fair match: moderate complementarity with some trade-offs in role or schedule.`;
  } else {
    summary = `Weak match: noticeable skill redundancy or schedule incompatibility.`;
  }

  return {
    viewerId: viewer.id,
    candidateId: candidate.id,
    total,
    factors,
    summary,
    youGain,
    theyGain,
    sharedTracks,
    sharedGoals,
    overlapWindowUtc: scores.availability.overlapWindows,
    overlapHours: scores.availability.overlapHours,
    cautions,
    mentorshipBonus: mentorshipBonus > 0 ? mentorshipBonus : undefined,
    weightsUsed: weights,
  };
}
