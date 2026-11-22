import { Domain, Skill, User } from '../types';
import { ALL_DOMAINS } from '../taxonomy';

export function getDomainProficiency(skills: Skill[]): Record<Domain, number> {
  const proficiencies: Record<Domain, number> = {
    frontend: 0,
    backend: 0,
    ai_ml: 0,
    design: 0,
    product: 0,
    devops: 0,
    data: 0,
    mobile: 0,
  };

  for (const s of skills) {
    if (s.confidence && s.confidence > 0) {
      const p = s.confidence / 5;
      if (p > proficiencies[s.domain]) {
        proficiencies[s.domain] = p;
      }
    }
  }

  return proficiencies;
}

export function computeSkillsScore(
  profViewer: Record<Domain, number>,
  profCandidate: Record<Domain, number>,
  weightsByDomain?: Partial<Record<Domain, number>>
): {
  score: number;
  gapFill: number;
  coverage: number;
  redundancy: number;
} {
  let gapFillNum = 0;
  let gapFillDen = 0;
  let covNum = 0;
  let covDen = 0;
  let redNum = 0;
  let redDen = 0;

  for (const d of ALL_DOMAINS) {
    const w = weightsByDomain?.[d] ?? 1;
    const pu = profViewer[d] ?? 0;
    const pc = profCandidate[d] ?? 0;

    // GapFill = Σ w_d·max(0, p_c(d) − p_u(d)) / Σ w_d·(1 − p_u(d))
    gapFillNum += w * Math.max(0, pc - pu);
    gapFillDen += w * (1 - pu);

    // Coverage = Σ w_d·max(p_u(d), p_c(d)) / Σ w_d
    covNum += w * Math.max(pu, pc);
    covDen += w;

    // Redundancy = Σ w_d·min(p_u(d), p_c(d)) / Σ w_d·max(p_u(d), p_c(d))
    redNum += w * Math.min(pu, pc);
    redDen += w * Math.max(pu, pc);
  }

  const gapFill = gapFillDen > 0 ? gapFillNum / gapFillDen : 0;
  const coverage = covDen > 0 ? covNum / covDen : 0;
  const redundancy = redDen > 0 ? redNum / redDen : 0;

  const S = Math.min(1, Math.max(0, 0.50 * gapFill + 0.30 * coverage + 0.20 * (1 - redundancy)));

  return {
    score: S,
    gapFill,
    coverage,
    redundancy,
  };
}
