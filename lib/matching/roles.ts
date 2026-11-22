import { CollabStyle, Role, User } from '../types';

export const COMPLEMENTARY_PAIRS: [Role, Role][] = [
  ['Frontend', 'Backend'],
  ['Backend', 'Frontend'],
  ['Frontend', 'UI/UX'],
  ['UI/UX', 'Frontend'],
  ['Backend', 'AI/ML'],
  ['AI/ML', 'Backend'],
  ['AI/ML', 'UI/UX'],
  ['UI/UX', 'AI/ML'],
];

export function isComplementaryRolePair(roleA: Role, roleB: Role): boolean {
  if ((roleA === 'PM' && roleB !== 'PM') || (roleB === 'PM' && roleA !== 'PM')) {
    return true;
  }
  return COMPLEMENTARY_PAIRS.some(([a, b]) => a === roleA && b === roleB);
}

export function computeRoleScore(roleViewer: Role, roleCandidate: Role): number {
  if (roleViewer === roleCandidate) {
    return 0.2;
  }
  if (isComplementaryRolePair(roleViewer, roleCandidate)) {
    return 1.0;
  }
  return 0.6;
}

export function computeCollabScore(collabA: CollabStyle, collabB: CollabStyle): number {
  const paceDiff = collabA.pace === collabB.pace ? 0 : 1;
  const structureDiff = collabA.structure === collabB.structure ? 0 : 1;
  return 1 - (paceDiff + structureDiff) / 2;
}

export function computeRolesAndCollabScore(
  userA: Pick<User, 'preferredRoles' | 'collab'>,
  userB: Pick<User, 'preferredRoles' | 'collab'>,
  teamRolesFilled?: Role[]
): {
  score: number;
  roleScore: number;
  collabScore: number;
} {
  const roleA = userA.preferredRoles[0] || 'Frontend';
  const roleB = userB.preferredRoles[0] || 'Frontend';

  let roleScore = 0.6;
  if (teamRolesFilled && teamRolesFilled.length > 0) {
    // In team mode: candidate primary role vs roles already filled:
    // 0.2 if already taken, 1.0 if untaken and complements any member, else 0.6.
    if (teamRolesFilled.includes(roleB)) {
      roleScore = 0.2;
    } else if (teamRolesFilled.some((r) => isComplementaryRolePair(r, roleB))) {
      roleScore = 1.0;
    } else {
      roleScore = 0.6;
    }
  } else {
    roleScore = computeRoleScore(roleA, roleB);
  }

  const collabScore = computeCollabScore(userA.collab, userB.collab);

  // R = 0.65·RoleScore + 0.35·Collab
  const score = Math.min(1, Math.max(0, 0.65 * roleScore + 0.35 * collabScore));

  return {
    score,
    roleScore,
    collabScore,
  };
}
