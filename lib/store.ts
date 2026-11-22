import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Invite, Team, User, Weights, DEFAULT_WEIGHTS } from './types';
import { SCENARIO_A, SCENARIO_B } from '../seed';

export interface AppState {
  users: User[];
  teams: Team[];
  invites: Invite[];
  currentUserId: string;
  weights: Weights;
  activeScenario: 'A' | 'B';
  hasHydrated: boolean;
  eventConfig: { maxTeamSize: number };

  // Actions
  setHasHydrated: (state: boolean) => void;
  setEventConfig: (config: Partial<{ maxTeamSize: number }>) => void;
  setCurrentUserId: (id: string) => void;
  setWeights: (weights: Partial<Weights>) => void;
  resetWeights: () => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  deleteUserData: (userId: string) => void;
  sendInvite: (
    fromUserId: string,
    toUserId: string,
    teamId: string | null,
    message: string,
    matchScoreSnapshot: number
  ) => Invite;
  respondToInvite: (inviteId: string, response: 'accepted' | 'declined') => void;
  withdrawInvite: (inviteId: string) => void;
  createTeam: (name: string, idea?: string, tracks?: string[]) => Team;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  resetToScenario: (scenario: 'A' | 'B') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: SCENARIO_A.users,
      teams: SCENARIO_A.teams,
      invites: [],
      currentUserId: 'ananya',
      weights: { ...DEFAULT_WEIGHTS },
      activeScenario: 'A',
      hasHydrated: false,
      eventConfig: { maxTeamSize: 4 },

      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

      setEventConfig: (config) =>
        set((state) => {
          const maxTeamSize = Math.min(6, Math.max(2, Math.round(config.maxTeamSize ?? state.eventConfig.maxTeamSize)));
          return {
            eventConfig: { ...state.eventConfig, maxTeamSize },
            teams: state.teams.map((t) => ({ ...t, maxSize: Math.max(maxTeamSize, t.memberIds.length) })),
          };
        }),

      setCurrentUserId: (id: string) => set({ currentUserId: id }),

      setWeights: (newWeights: Partial<Weights>) => {
        const current = get().weights;
        const s = Math.max(0, newWeights.skills ?? current.skills);
        const t = Math.max(0, newWeights.track ?? current.track);
        const a = Math.max(0, newWeights.availability ?? current.availability);
        const r = Math.max(0, newWeights.role ?? current.role);
        const sum = s + t + a + r || 1;

        set({
          weights: {
            skills: Number((s / sum).toFixed(4)),
            track: Number((t / sum).toFixed(4)),
            availability: Number((a / sum).toFixed(4)),
            role: Number((r / sum).toFixed(4)),
          },
        });
      },

      resetWeights: () => set({ weights: { ...DEFAULT_WEIGHTS } }),

      updateUserProfile: (userId: string, updates: Partial<User>) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
        }));
      },

      deleteUserData: (userId: string) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
          currentUserId: state.currentUserId === userId ? (state.users[0]?.id || '') : state.currentUserId,
          invites: state.invites.filter((inv) => inv.fromUserId !== userId && inv.toUserId !== userId),
          teams: state.teams.map((tm) => ({
            ...tm,
            memberIds: tm.memberIds.filter((id) => id !== userId),
          })),
        }));
      },

      sendInvite: (fromUserId, toUserId, teamId, message, matchScoreSnapshot) => {
        const newInvite: Invite = {
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fromUserId,
          toUserId,
          teamId,
          message,
          matchScoreSnapshot,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          invites: [newInvite, ...state.invites],
        }));

        return newInvite;
      },

      respondToInvite: (inviteId, response) => {
        const state = get();
        const invite = state.invites.find((i) => i.id === inviteId);
        if (!invite) return;

        const now = new Date().toISOString();

        if (response === 'declined') {
          set({
            invites: state.invites.map((i) =>
              i.id === inviteId ? { ...i, status: 'declined', respondedAt: now } : i
            ),
          });
          return;
        }

        // Response is 'accepted'
        // If inviter already has a team, add candidate to it
        // If candidate or inviter has no team, create "Team Nexus"
        let targetTeamId = invite.teamId;
        const inviter = state.users.find((u) => u.id === invite.fromUserId);
        const recipient = state.users.find((u) => u.id === invite.toUserId);

        let updatedTeams = [...state.teams];

        if (targetTeamId) {
          const tm = updatedTeams.find((t) => t.id === targetTeamId);
          if (tm && !tm.memberIds.includes(invite.toUserId)) {
            updatedTeams = updatedTeams.map((t) =>
              t.id === targetTeamId
                ? { ...t, memberIds: [...t.memberIds, invite.toUserId] }
                : t
            );
          }
        } else {
          // Check if inviter already has teamId
          if (inviter?.teamId) {
            targetTeamId = inviter.teamId;
            updatedTeams = updatedTeams.map((t) =>
              t.id === targetTeamId && !t.memberIds.includes(invite.toUserId)
                ? { ...t, memberIds: [...t.memberIds, invite.toUserId] }
                : t
            );
          } else {
            // Create a new team
            targetTeamId = `team-${Date.now()}`;
            const newTeam: Team = {
              id: targetTeamId,
              eventId: 'innovate-india-2026',
              name: 'Team Nexus',
              idea: 'SkillSync: Opt-in talent graph with an explainable compatibility engine.',
              tracks: inviter?.tracks?.length ? inviter.tracks : ['AI & Emerging Tech'],
              memberIds: [invite.fromUserId, invite.toUserId],
              maxSize: 4,
              requiredDomains: { frontend: 1, backend: 1, ai_ml: 1, design: 1 },
              createdBy: invite.fromUserId,
            };
            updatedTeams.push(newTeam);
          }
        }

        // Update users teamId
        const updatedUsers = state.users.map((u) => {
          if (u.id === invite.fromUserId || u.id === invite.toUserId) {
            return { ...u, teamId: targetTeamId };
          }
          return u;
        });

        // Update invite status
        const updatedInvites = state.invites.map((i) =>
          i.id === inviteId ? { ...i, status: 'accepted' as const, respondedAt: now } : i
        );

        set({
          teams: updatedTeams,
          users: updatedUsers,
          invites: updatedInvites,
        });
      },

      withdrawInvite: (inviteId) => {
        set((state) => ({
          invites: state.invites.map((i) =>
            i.id === inviteId ? { ...i, status: 'withdrawn' } : i
          ),
        }));
      },

      createTeam: (name, idea, tracks = ['AI & Emerging Tech', 'Web & Mobile']) => {
        const state = get();
        const currentUserId = state.currentUserId;
        const teamId = `team-${Date.now()}`;

        const newTeam: Team = {
          id: teamId,
          eventId: 'innovate-india-2026',
          name,
          idea,
          tracks,
          memberIds: [currentUserId],
          maxSize: 4,
          requiredDomains: { frontend: 1, backend: 1, ai_ml: 1, design: 1 },
          createdBy: currentUserId,
        };

        set({
          teams: [...state.teams, newTeam],
          users: state.users.map((u) => (u.id === currentUserId ? { ...u, teamId } : u)),
        });

        return newTeam;
      },

      updateTeam: (teamId, updates) => {
        set((state) => ({
          teams: state.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
        }));
      },

      resetToScenario: (scenario: 'A' | 'B') => {
        if (scenario === 'A') {
          set({
            users: SCENARIO_A.users,
            teams: SCENARIO_A.teams,
            invites: [],
            currentUserId: SCENARIO_A.currentUserId,
            weights: { ...DEFAULT_WEIGHTS },
            activeScenario: 'A',
          });
        } else {
          set({
            users: SCENARIO_B.users,
            teams: SCENARIO_B.teams,
            invites: [],
            currentUserId: SCENARIO_B.currentUserId,
            weights: { ...DEFAULT_WEIGHTS },
            activeScenario: 'B',
          });
        }
      },
    }),
    {
      name: 'skillsync_store_v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
