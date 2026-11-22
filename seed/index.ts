import { Team, User } from '../lib/types';
import rawUsers from './users.json';

export const SEED_USERS: User[] = rawUsers as User[];

export const SCENARIO_A = {
  users: SEED_USERS.map((u) => ({ ...u, teamId: u.id === 'siddharth' ? 'team-alpha' : u.id === 'zoya' ? 'team-cyber' : null })),
  teams: [
    {
      id: 'team-alpha',
      eventId: 'innovate-india-2026',
      name: 'Team Alpha',
      idea: 'Automated legal documentation scanner and risk assessment agent.',
      tracks: ['AI & Emerging Tech'],
      memberIds: ['siddharth'],
      maxSize: 4,
      requiredDomains: { ai_ml: 1, backend: 1, frontend: 1 },
      createdBy: 'siddharth',
    },
    {
      id: 'team-cyber',
      eventId: 'innovate-india-2026',
      name: 'Team Cyber',
      idea: 'Zero-trust enterprise authorization with hardware telemetry.',
      tracks: ['Web & Mobile'],
      memberIds: ['zoya'],
      maxSize: 4,
      requiredDomains: { design: 1, product: 1, backend: 1 },
      createdBy: 'zoya',
    },
  ] as Team[],
  currentUserId: 'ananya',
};

export const SCENARIO_B = {
  users: SEED_USERS.map((u) => {
    if (u.id === 'ananya' || u.id === 'karthik') {
      return { ...u, teamId: 'team-nexus' };
    }
    if (u.id === 'siddharth') return { ...u, teamId: 'team-alpha' };
    if (u.id === 'zoya') return { ...u, teamId: 'team-cyber' };
    return { ...u, teamId: null };
  }),
  teams: [
    {
      id: 'team-nexus',
      eventId: 'innovate-india-2026',
      name: 'Team Nexus',
      idea: 'SkillSync: Opt-in talent graph with an explainable compatibility engine.',
      tracks: ['AI & Emerging Tech', 'Web & Mobile'],
      memberIds: ['ananya', 'karthik'],
      maxSize: 4,
      requiredDomains: { frontend: 1, backend: 1, ai_ml: 1, design: 1 },
      createdBy: 'ananya',
    },
    {
      id: 'team-alpha',
      eventId: 'innovate-india-2026',
      name: 'Team Alpha',
      idea: 'Automated legal documentation scanner and risk assessment agent.',
      tracks: ['AI & Emerging Tech'],
      memberIds: ['siddharth'],
      maxSize: 4,
      requiredDomains: { ai_ml: 1, backend: 1, frontend: 1 },
      createdBy: 'siddharth',
    },
    {
      id: 'team-cyber',
      eventId: 'innovate-india-2026',
      name: 'Team Cyber',
      idea: 'Zero-trust enterprise authorization with hardware telemetry.',
      tracks: ['Web & Mobile'],
      memberIds: ['zoya'],
      maxSize: 4,
      requiredDomains: { design: 1, product: 1, backend: 1 },
      createdBy: 'zoya',
    },
  ] as Team[],
  currentUserId: 'ananya',
};
