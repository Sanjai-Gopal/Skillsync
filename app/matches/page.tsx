'use client';

import * as React from 'react';
import { useAppStore } from '@/lib/store';
import { computePairwiseMatch } from '@/lib/matching';
import { MatchCard } from '@/components/match/MatchCard';
import { WeightsPanel } from '@/components/match/WeightsPanel';
import { BreakdownSheet } from '@/components/match/BreakdownSheet';
import { InviteDialog } from '@/components/match/InviteDialog';
import { MatchBreakdown, Role, User } from '@/lib/types';
import { ROLES, TRACKS } from '@/lib/taxonomy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Sparkles,
  Filter,
  Lock,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Compass,
  Users,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/avatar';
import { DreamTeamPanel } from '@/components/match/DreamTeamPanel';

export default function MatchesPage() {
  const { users, currentUserId, weights, invites, hasHydrated } = useAppStore();

  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [selectedTrack, setSelectedTrack] = React.useState<string>('all');
  const [beginnerOnly, setBeginnerOnly] = React.useState<boolean>(false);
  const [showAllRanks, setShowAllRanks] = React.useState<boolean>(false);
  const [showUnavailable, setShowUnavailable] = React.useState<boolean>(false);

  // Breakdown & Invite Sheet States
  const [selectedMatch, setSelectedMatch] = React.useState<{
    candidate: User;
    breakdown: MatchBreakdown;
  } | null>(null);
  const [breakdownOpen, setBreakdownOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Calculate pairwise matches for all candidates
  const allMatches = React.useMemo(() => {
    if (!currentUser) return [];

    const otherUsers = users.filter((u) => u.id !== currentUser.id);

    return otherUsers.map((candidate) => {
      const breakdown = computePairwiseMatch(currentUser, candidate, weights);
      return {
        candidate,
        breakdown,
      };
    });
  }, [currentUser, users, weights]);

  // Separate discoverable & unteamed vs unavailable
  const availableMatches = React.useMemo(() => {
    let list = allMatches.filter((m) => m.candidate.isDiscoverable && !m.candidate.teamId);

    // Apply filters
    if (selectedRole !== 'all') {
      list = list.filter((m) => m.candidate.preferredRoles.includes(selectedRole as Role));
    }

    if (selectedTrack !== 'all') {
      list = list.filter((m) => m.candidate.tracks.includes(selectedTrack));
    }

    if (beginnerOnly) {
      list = list.filter(
        (m) =>
          m.candidate.experienceLevel === 'first_timer' ||
          m.candidate.skills.some((s) => s.wantsToLearn)
      );
    }

    // Sort descending by total match score
    list.sort((a, b) => b.breakdown.total - a.breakdown.total);

    // If not "browse beyond top matches", slice top 8
    if (!showAllRanks && list.length > 8) {
      return list.slice(0, 8);
    }

    return list;
  }, [allMatches, selectedRole, selectedTrack, beginnerOnly, showAllRanks]);

  const unavailableMatches = React.useMemo(() => {
    return allMatches.filter((m) => !m.candidate.isDiscoverable || Boolean(m.candidate.teamId));
  }, [allMatches]);

  if (!currentUser) {
    return <div className="p-8 text-center">Loading personas...</div>;
  }

  const handleOpenBreakdown = (item: { candidate: User; breakdown: MatchBreakdown }) => {
    setSelectedMatch(item);
    setBreakdownOpen(true);
  };

  const handleOpenInvite = (item: { candidate: User; breakdown: MatchBreakdown }) => {
    setSelectedMatch(item);
    setInviteOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Hero Section */}
      <div className="border-b border-border/70 bg-card/40 py-8 px-4 sm:px-8">
        <div className="container max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Explainable Matching Engine
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Zero randomness • Deterministic
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1.5">
                Talent Graph for {currentUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                Ranked by complementary skill coverage, schedule overlap, and role harmony — never by popularity or prestige.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-xs">
              <UserAvatar seed={currentUser.avatarSeed} name={currentUser.name} size="md" />
              <div className="text-left">
                <span className="text-xs font-bold block">{currentUser.name}</span>
                <span className="text-[11px] text-muted-foreground block">
                  {currentUser.preferredRoles.join(', ')} • {currentUser.experienceLevel.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Weights Panel */}
          <div className="pt-2">
            <WeightsPanel />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        <DreamTeamPanel />

        {/* Filters and Controls Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card/50">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold flex items-center gap-1.5 text-muted-foreground mr-1">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Roles</option>
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>

            {/* Track Filter */}
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Tracks</option>
              {TRACKS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Beginner Friendly Toggle */}
            <button
              onClick={() => setBeginnerOnly(!beginnerOnly)}
              className={`h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
                beginnerOnly
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-input hover:text-foreground'
              }`}
            >
              Beginner-Friendly Only
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
              <Switch checked={showAllRanks} onCheckedChange={setShowAllRanks} />
              <span>Browse beyond top matches ({allMatches.length})</span>
            </label>
          </div>
        </div>

        {/* Matches Feed Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Available Candidates ({availableMatches.length})
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              Live sorted by compatibility score
            </span>
          </div>

          {availableMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
              <Users className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="font-bold text-foreground">No matching candidates found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try loosening your role or track filters to discover more participants.
              </p>
              <Button variant="outline" size="sm" onClick={() => { setSelectedRole('all'); setSelectedTrack('all'); setBeginnerOnly(false); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {availableMatches.map((item) => {
                const hasPendingInvite = invites.some(
                  (inv) =>
                    inv.fromUserId === currentUser.id &&
                    inv.toUserId === item.candidate.id &&
                    inv.status === 'pending'
                );

                return (
                  <MatchCard
                    key={item.candidate.id}
                    candidate={item.candidate}
                    breakdown={item.breakdown}
                    onWhyMatch={() => handleOpenBreakdown(item)}
                    onInvite={() => handleOpenInvite(item)}
                    hasPendingInvite={hasPendingInvite}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Collapsed Unavailable Section */}
        {unavailableMatches.length > 0 && (
          <div className="pt-6 border-t border-border/60 space-y-3">
            <button
              onClick={() => setShowUnavailable(!showUnavailable)}
              className="flex items-center justify-between w-full p-4 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Not Available ({unavailableMatches.length} Participants)
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  — Already on a team or set to private
                </span>
              </div>
              {showUnavailable ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showUnavailable && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {unavailableMatches.map((item) => (
                  <div
                    key={item.candidate.id}
                    className="p-3.5 rounded-xl border border-border/60 bg-card/40 opacity-75 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar seed={item.candidate.avatarSeed} name={item.candidate.name} size="md" />
                      <div>
                        <span className="text-xs font-semibold block">{item.candidate.name}</span>
                        <span className="text-[11px] text-muted-foreground block line-clamp-1">
                          {item.candidate.headline}
                        </span>
                      </div>
                    </div>

                    <Badge variant="secondary" className="text-[10px] shrink-0 font-medium">
                      {item.candidate.teamId ? 'Already on Team' : 'Private Profile'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Breakdown Sheet Modal */}
      <BreakdownSheet
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
        breakdown={selectedMatch?.breakdown || null}
        viewer={currentUser}
        candidate={selectedMatch?.candidate || null}
        onInvite={() => {
          setBreakdownOpen(false);
          setInviteOpen(true);
        }}
      />

      {/* Invite Dialog Modal */}
      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        candidate={selectedMatch?.candidate || null}
        breakdown={selectedMatch?.breakdown || null}
      />
    </div>
  );
}
