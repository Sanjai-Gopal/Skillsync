'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppStore } from '@/lib/store';
import { Confidence, Domain, Goal, Role, Skill, User } from '@/lib/types';
import { ALL_DOMAINS, DOMAINS, GOALS, ROLES, TRACKS, TIME_BLOCKS } from '@/lib/taxonomy';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { UserAvatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Save,
  Trash2,
  Plus,
  X,
  ShieldCheck,
  Sparkles,
  Clock,
  Compass,
  Briefcase,
  Layers,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  headline: z.string().min(5, 'Headline is required'),
  bio: z.string().min(10, 'Bio is required'),
  contact: z.string().optional(),
  experienceLevel: z.enum(['first_timer', 'some', 'veteran']),
  isDiscoverable: z.boolean(),
  ambition: z.number().min(1).max(5),
  pace: z.enum(['async', 'sync']),
  structure: z.enum(['planned', 'exploratory']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { users, currentUserId, updateUserProfile, deleteUserData } = useAppStore();
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const [skills, setSkills] = React.useState<Skill[]>(currentUser?.skills || []);
  const [preferredRoles, setPreferredRoles] = React.useState<Role[]>(currentUser?.preferredRoles || ['Frontend']);
  const [tracks, setTracks] = React.useState<string[]>(currentUser?.tracks || ['AI & Emerging Tech']);
  const [goals, setGoals] = React.useState<Goal[]>(currentUser?.goals || ['win', 'learn']);
  const [selectedTimeBlocks, setSelectedTimeBlocks] = React.useState<string[]>(['evening']);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // New skill addition state
  const [newSkillName, setNewSkillName] = React.useState('');
  const [newSkillDomain, setNewSkillDomain] = React.useState<Domain>('frontend');
  const [newSkillConfidence, setNewSkillConfidence] = React.useState<Confidence>(4);
  const [newSkillWantsLearn, setNewSkillWantsLearn] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      headline: currentUser?.headline || '',
      bio: currentUser?.bio || '',
      contact: currentUser?.contact || '',
      experienceLevel: currentUser?.experienceLevel || 'first_timer',
      isDiscoverable: currentUser?.isDiscoverable ?? true,
      ambition: currentUser?.ambition || 4,
      pace: currentUser?.collab.pace || 'async',
      structure: currentUser?.collab.structure || 'planned',
    },
  });

  // Re-sync when persona switches
  React.useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name,
        headline: currentUser.headline,
        bio: currentUser.bio,
        contact: currentUser.contact || '',
        experienceLevel: currentUser.experienceLevel,
        isDiscoverable: currentUser.isDiscoverable,
        ambition: currentUser.ambition,
        pace: currentUser.collab.pace,
        structure: currentUser.collab.structure,
      });
      setSkills(currentUser.skills);
      setPreferredRoles(currentUser.preferredRoles);
      setTracks(currentUser.tracks);
      setGoals(currentUser.goals);
    }
  }, [currentUser?.id, reset]);

  if (!currentUser) return null;

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Skill name is required');
      return;
    }
    const skill: Skill = {
      name: newSkillName.trim(),
      domain: newSkillDomain,
      confidence: newSkillConfidence,
      wantsToLearn: newSkillWantsLearn,
    };
    setSkills([...skills, skill]);
    setNewSkillName('');
    toast.success(`Added ${skill.name}`);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleToggleRole = (role: Role) => {
    if (preferredRoles.includes(role)) {
      if (preferredRoles.length > 1) {
        setPreferredRoles(preferredRoles.filter((r) => r !== role));
      } else {
        toast.error('At least one preferred role is required.');
      }
    } else {
      setPreferredRoles([...preferredRoles, role]);
    }
  };

  const handleToggleTrack = (track: string) => {
    if (tracks.includes(track)) {
      if (tracks.length > 1) {
        setTracks(tracks.filter((t) => t !== track));
      }
    } else {
      setTracks([...tracks, track]);
    }
  };

  const handleToggleGoal = (goal: Goal) => {
    if (goals.includes(goal)) {
      if (goals.length > 1) {
        setGoals(goals.filter((g) => g !== goal));
      }
    } else {
      setGoals([...goals, goal]);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    // Convert 6 local time blocks to hoursUtc using user's timezone offset
    const tzOffsetMinutes = currentUser.availability.utcOffsetMinutes || 330;
    const hoursUtc = new Array(24).fill(0);

    for (const blockId of selectedTimeBlocks) {
      const block = TIME_BLOCKS.find((b) => b.id === blockId);
      if (block) {
        for (const localHour of block.hours) {
          // Convert local hour to UTC
          const localTotalMinutes = localHour * 60;
          const utcTotalMinutes = ((localTotalMinutes - tzOffsetMinutes) % 1440 + 1440) % 1440;
          const utcHour = Math.floor(utcTotalMinutes / 60);
          hoursUtc[utcHour] = 1;
        }
      }
    }

    const hoursPerDay = hoursUtc.filter((h) => h === 1).length;

    updateUserProfile(currentUser.id, {
      name: data.name,
      headline: data.headline,
      bio: data.bio,
      contact: data.contact,
      experienceLevel: data.experienceLevel,
      isDiscoverable: data.isDiscoverable,
      ambition: data.ambition as 1 | 2 | 3 | 4 | 5,
      collab: {
        pace: data.pace,
        structure: data.structure,
      },
      skills,
      preferredRoles,
      tracks,
      goals,
      availability: {
        ...currentUser.availability,
        hoursUtc,
        hoursPerDay,
      },
    });

    toast.success('Profile updated successfully!');
  };

  const handleDeleteData = () => {
    deleteUserData(currentUser.id);
    setDeleteDialogOpen(false);
    toast.info('Your profile and personal matching graph data have been permanently deleted.');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page Header */}
      <div className="border-b border-border/70 bg-card/40 py-8 px-4 sm:px-8">
        <div className="container max-w-4xl mx-auto space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Privacy-First Profile
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Opt-in • No sensitive attributes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Edit Hackathon Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Configure your technical skills, work schedule, and collaboration style. The matching engine evaluates only objective capabilities and preferences.
          </p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 sm:px-8 pt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Identity & Basic Info Card */}
          <div className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4 pb-2 border-b border-border/60">
              <UserAvatar seed={currentUser.avatarSeed} name={currentUser.name} size="lg" />
              <div>
                <h2 className="text-base font-bold text-foreground">Identity & Visibility</h2>
                <p className="text-xs text-muted-foreground">
                  Public profile details shown on match cards and team space
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <Input {...register('name')} placeholder="Your Name" className="text-xs" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Contact Handle (revealed upon team invite accept)</label>
                <Input {...register('contact')} placeholder="@username / Discord / Telegram" className="text-xs" />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Professional Headline</label>
                <Input {...register('headline')} placeholder="Frontend Architect | Next.js & UI Systems" className="text-xs" />
                {errors.headline && <p className="text-xs text-destructive">{errors.headline.message}</p>}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Bio / Experience Summary</label>
                <Textarea {...register('bio')} rows={3} placeholder="Brief description of what you love building..." className="text-xs resize-none" />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Experience Level</label>
                <select
                  {...register('experienceLevel')}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                >
                  <option value="first_timer">First-timer (Welcome! Mentorship bonus eligible)</option>
                  <option value="some">Some hackathons (Intermediate)</option>
                  <option value="veteran">Veteran (Experienced builder & mentor)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold block text-foreground">Discoverable in Feed</span>
                  <span className="text-[11px] text-muted-foreground block">
                    Allow other participants to find and invite you
                  </span>
                </div>
                <Controller
                  name="isDiscoverable"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Skills & Confidence Sliders */}
          <div className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div>
                <h2 className="text-base font-bold text-foreground">Technical Skills & Domains</h2>
                <p className="text-xs text-muted-foreground">
                  Confidence scale 1 (beginner) to 5 (expert). Powers the skill complementarity engine.
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {skills.length} skills listed
              </Badge>
            </div>

            {/* Existing Skills List */}
            <div className="space-y-2.5">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border/60 bg-background/50 gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-xs text-foreground">{skill.name}</span>
                    <Badge variant="outline" className="text-[10px] capitalize font-mono">
                      {DOMAINS.find((d) => d.id === skill.domain)?.label || skill.domain}
                    </Badge>
                    {skill.wantsToLearn && (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        Wants to learn
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-36 flex items-center gap-2">
                      <Slider
                        value={[skill.confidence]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={([val]) => {
                          const updated = [...skills];
                          updated[idx] = { ...skill, confidence: val as Confidence };
                          setSkills(updated);
                        }}
                      />
                      <span className="text-xs font-mono font-bold text-primary w-6 text-right">
                        {skill.confidence}/5
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                      title="Remove skill"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Skill Sub-form */}
            <div className="pt-3 border-t border-border/50 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Add a Skill
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Skill Name</label>
                  <Input
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. PyTorch, Next.js, Figma"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Domain</label>
                  <select
                    value={newSkillDomain}
                    onChange={(e) => setNewSkillDomain(e.target.value as Domain)}
                    className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 text-xs"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Confidence</span>
                    <span className="font-mono text-primary">{newSkillConfidence}/5</span>
                  </div>
                  <Slider
                    value={[newSkillConfidence]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={([val]) => setNewSkillConfidence(val as Confidence)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Button type="button" size="sm" onClick={handleAddSkill} className="w-full h-8 text-xs font-semibold gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Preferred Roles & Tracks */}
          <div className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm space-y-6">
            {/* Roles */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Preferred Roles (Ordered Priority)
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => {
                  const isSelected = preferredRoles.includes(r.id);
                  const rank = preferredRoles.indexOf(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleToggleRole(r.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background text-muted-foreground border-input hover:text-foreground'
                      }`}
                    >
                      {isSelected && (
                        <span className="h-4 w-4 rounded-full bg-primary-foreground/20 text-primary-foreground text-[10px] flex items-center justify-center font-mono">
                          {rank + 1}
                        </span>
                      )}
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tracks */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Target Hackathon Tracks
              </label>
              <div className="flex flex-wrap gap-2">
                {TRACKS.map((t) => {
                  const isSelected = tracks.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToggleTrack(t)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-background text-muted-foreground border-input hover:text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Hackathon Primary Goals
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GOALS.map((g) => {
                  const isSelected = goals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleToggleGoal(g.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'bg-background text-muted-foreground border-input hover:text-foreground'
                      }`}
                    >
                      <span className="block">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Collaboration Style & Availability Time Blocks */}
          <div className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm space-y-6">
            <div className="pb-2 border-b border-border/60">
              <h2 className="text-base font-bold text-foreground">Schedule & Work Cadence</h2>
              <p className="text-xs text-muted-foreground">
                Timezone: {currentUser.availability.timezone} (UTC{currentUser.availability.utcOffsetMinutes >= 0 ? '+' : ''}{currentUser.availability.utcOffsetMinutes / 60}h)
              </p>
            </div>

            {/* Availability Blocks */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Daily Availability Time Blocks (Local Time)
              </label>
              <ToggleGroup
                type="multiple"
                value={selectedTimeBlocks}
                onValueChange={(val) => {
                  if (val.length > 0) setSelectedTimeBlocks(val);
                }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
              >
                {TIME_BLOCKS.map((block) => (
                  <ToggleGroupItem
                    key={block.id}
                    value={block.id}
                    className="flex flex-col py-3 px-2 rounded-xl border border-input data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary h-auto"
                  >
                    <span className="font-bold text-xs">{block.label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{block.range}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Ambition Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-foreground">Ambition Level</span>
                <Controller
                  name="ambition"
                  control={control}
                  render={({ field }) => (
                    <span className="font-mono font-bold text-primary">{field.value} / 5</span>
                  )}
                />
              </div>
              <Controller
                name="ambition"
                control={control}
                render={({ field }) => (
                  <Slider
                    value={[field.value]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={([val]) => field.onChange(val)}
                  />
                )}
              />
            </div>

            {/* Collab Pace and Structure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Communication Pace</label>
                <select
                  {...register('pace')}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs"
                >
                  <option value="async">Async First (Docs, Slack, Loom, structured syncs)</option>
                  <option value="sync">Live Huddle (Continuous Discord voice / pairing)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Sprint Structure</label>
                <select
                  {...register('structure')}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-xs"
                >
                  <option value="planned">Planned (Milestones, task tracking, scoping)</option>
                  <option value="exploratory">Exploratory (Rapid iterative prototyping)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/80">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="w-full sm:w-auto text-xs gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete My Data
            </Button>

            <Button type="submit" size="sm" className="w-full sm:w-auto text-xs font-bold gap-1.5 px-6">
              <Save className="h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Data Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete Profile & Talent Graph
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure? This will permanently delete your persona from the local client state and remove all team invites.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteData}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
