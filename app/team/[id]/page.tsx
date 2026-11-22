'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  computeTeamCoverage,
  computeTeamProficiency,
  computeTeamScore,
  computePairwiseMatch,
} from '@/lib/matching';
import { CoverageRadar } from '@/components/team/CoverageRadar';
import { GapCallout } from '@/components/team/GapCallout';
import { MemberList } from '@/components/team/MemberList';
import { SuggestionList } from '@/components/team/SuggestionList';
import { KickoffPlan } from '@/components/team/KickoffPlan';
import { InviteDialog } from '@/components/match/InviteDialog';
import { Domain, MatchBreakdown, Team, User } from '@/lib/types';
import { DOMAINS, ALL_DOMAINS } from '@/lib/taxonomy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Sparkles,
  Edit2,
  Check,
  RotateCcw,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamSpacePage() {
  const params = useParams();
  const router = useRouter();
  const teamId = (params?.id as string) || 'team-nexus';

  const {
    teams,
    users,
    currentUserId,
    weights,
    updateTeam,
    createTeam,
    invites,
  } = useAppStore();

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Find team by ID or fallback to current user's team or first team
  let team = teams.find((t) => t.id === teamId);
  if (!team && currentUser?.teamId) {
    team = teams.find((t) => t.id === currentUser.teamId);
  }
  if (!team && teams.length > 0) {
    team = teams[0];
  }

  // Editing state for team name and idea
  const [isEditing, setIsEditing] = React.useState(false);
  const [teamName, setTeamName] = React.useState('');
  const [teamIdea, setTeamIdea] = React.useState('');

  // What-if preview state on hover
  const [hoveredCandidate, setHoveredCandidate] = React.useState<User | null>(null);

  // Invite dialog state
  const [inviteModalCandidate, setInviteModalCandidate] = React.useState<User | null>(null);
  const [inviteModalBreakdown, setInviteModalBreakdown] = React.useState<MatchBreakdown | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (team) {
      setTeamName(team.name);
      setTeamIdea(team.idea || '');
    }
  }, [team?.id]);

  if (!currentUser) return null;

  // If no team found, provide quick creation button
  if (!team) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <Users className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">No Team Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You are currently an independent builder. Create a team space to analyze capability coverage and optimize recruitment.
        </p>
        <Button
          onClick={() => {
            const newTm = createTeam('Team Nexus', 'SkillSync Hackathon Prototype');
            router.push(`/team/${newTm.id}`);
          }}
          className="font-semibold"
        >
          Initialize Team Nexus
        </Button>
      </div>
    );
  }

  const members = team.memberIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => u !== undefined);

  // Current coverage & suggestions
  const coverageReport = computeTeamCoverage(team, users, weights);
  const currentTeamScore = computeTeamScore(members, team.requiredDomains, weights);

  // Projected coverage if hovering a candidate
  // (plain computation, not a hook: this runs after early returns)
  const projectedCoverage = hoveredCandidate
    ? computeTeamProficiency([...members, hoveredCandidate])
    : null;

  const handleSaveTeamDetails = () => {
    if (!team) return;
    updateTeam(team.id, {
      name: teamName.trim() || 'Team Nexus',
      idea: teamIdea.trim(),
    });
    setIsEditing(false);
    toast.success('Team details updated.');
  };

  const handleInviteCandidate = (candidate: User) => {
    const breakdown = computePairwiseMatch(currentUser, candidate, weights);
    setInviteModalCandidate(candidate);
    setInviteModalBreakdown(breakdown);
    setInviteModalOpen(true);
  };

  const pendingInvitedIds = invites
    .filter((inv) => inv.fromUserId === currentUser.id && inv.status === 'pending')
    .map((inv) => inv.toUserId);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Team Header Banner */}
      <div className="border-b border-border/70 bg-card/40 py-8 px-4 sm:px-8">
        <div className="container max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Team Space • Innovate India 2026
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {members.length} / {team.maxSize} builders
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-2 pt-1">
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="font-extrabold text-xl h-10"
                    placeholder="Team Name"
                  />
                  <Textarea
                    value={teamIdea}
                    onChange={(e) => setTeamIdea(e.target.value)}
                    className="text-xs resize-none"
                    rows={2}
                    placeholder="Project vision / hackathon idea pitch..."
                  />
                  <Button size="sm" onClick={handleSaveTeamDetails} className="h-8 gap-1.5 text-xs font-semibold">
                    <Check className="h-3.5 w-3.5" /> Save Changes
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {team.name}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit team details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {team.idea || 'No pitch added yet. Click edit to describe your hackathon project.'}
                  </p>
                </div>
              )}
            </div>

            {/* Team Score & Shared Overlap Badge */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-xs self-start md:self-auto">
              <div className="text-center pr-3 border-r border-border/60">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                  Team Score
                </span>
                <span className="font-mono font-extrabold text-2xl text-primary block leading-none mt-1">
                  {currentTeamScore}
                </span>
                <span className="text-[9px] text-muted-foreground font-mono">out of 100</span>
              </div>

              <div className="text-left space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{coverageReport.overlapHoursAll}h / day</span>
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  All-member overlap window
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="container max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Capability Radar & Domain Progress Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Radar Column */}
          <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Capability Coverage Radar
                </h2>
                <p className="text-xs text-muted-foreground">
                  8-domain full-stack analysis computed via probabilistic noisy-OR
                </p>
              </div>

              {hoveredCandidate && (
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono animate-pulse">
                  + {hoveredCandidate.name} What-if
                </Badge>
              )}
            </div>

            <CoverageRadar
              coverage={coverageReport.byDomain}
              projectedCoverage={projectedCoverage}
              projectedCandidateName={hoveredCandidate?.name}
            />
          </div>

          {/* Domain Breakdown Sliders */}
          <div className="lg:col-span-5 rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Domain Proficiencies
              </h2>
              <p className="text-xs text-muted-foreground">
                Individual domain coverage thresholds
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {ALL_DOMAINS.map((domainKey) => {
                const domainDef = DOMAINS.find((d) => d.id === domainKey);
                const curVal = Math.round((coverageReport.byDomain[domainKey] || 0) * 100);
                const isGap = curVal < 50;

                return (
                  <div key={domainKey} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {domainDef?.label || domainKey}
                        {isGap && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        )}
                      </span>
                      <span className={`font-mono font-bold ${isGap ? 'text-amber-500' : 'text-primary'}`}>
                        {curVal}%
                      </span>
                    </div>

                    <Progress
                      value={curVal}
                      indicatorClassName={isGap ? 'bg-amber-500' : 'bg-primary'}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gap Callouts */}
        <GapCallout
          gaps={coverageReport.gaps}
          coverage={coverageReport.byDomain}
          onTargetGap={() => router.push('/matches')}
        />

        {/* Team Members & Suggestions Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Member Roster */}
          <div className="lg:col-span-5 space-y-4">
            <MemberList
              team={team}
              members={members}
              currentUserId={currentUser.id}
            />
          </div>

          {/* Suggestions List */}
          <div className="lg:col-span-7 space-y-4">
            <SuggestionList
              suggestions={coverageReport.suggestions}
              allUsers={users}
              onHoverCandidate={setHoveredCandidate}
              onInviteCandidate={handleInviteCandidate}
              invitedIds={pendingInvitedIds}
              maxTeamReached={members.length >= team.maxSize}
            />
          </div>
        </div>

        {/* Kickoff Plan: roles & first milestone (re-keyed when the roster changes) */}
        <KickoffPlan
          key={`${team.id}:${team.memberIds.join(',')}`}
          team={team}
          members={members}
        />
      </div>

      {/* Invite Modal */}
      <InviteDialog
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        candidate={inviteModalCandidate}
        breakdown={inviteModalBreakdown}
      />
    </div>
  );
}
