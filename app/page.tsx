'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/match/ScoreRing';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Compass,
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  Layers,
  HeartHandshake,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const steps = [
    {
      step: '01',
      title: 'Opt-in Talent Profile',
      desc: 'Declare your core technical capabilities, timezone availability, and preferred roles. No resumes or popularity metrics.',
      icon: Users,
    },
    {
      step: '02',
      title: 'Explainable Compatibility',
      desc: 'Our deterministic mathematical engine computes complementary gap-fills, schedule overlap, and role harmony with transparent point breakdowns.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Team Space Optimization',
      desc: 'Inspect your full 8-domain radar coverage in real time, identify vulnerabilities before writing code, and preview "what-if" additions.',
      icon: Layers,
    },
  ];

  const principles = [
    {
      title: 'Complementarity over Popularity',
      desc: 'Having three 10x React frontend developers creates redundancy. We reward teams that assemble diverse, complementary capabilities.',
      icon: Layers,
    },
    {
      title: 'Explainable by Design',
      desc: 'Every compatibility score displays its exact factors, evidence bullets, and points. No black-box AI verdicts or opaque ranking tricks.',
      icon: CheckCircle2,
    },
    {
      title: 'Welcoming to Beginners',
      desc: 'First-time builders and learners receive mentorship bonuses when pairing with seasoned guides, creating accessible entry paths.',
      icon: HeartHandshake,
    },
    {
      title: 'Privacy & Agency First',
      desc: 'Zero demographic scoring. You decide who to invite. Hide or permanently delete your data with a single click at any time.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/60">
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent pointer-events-none" />

        <div className="container max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2"
          >
            <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Innovate India 2026 • Team Nexus
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.12]"
          >
            Build a stronger hackathon team <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              before the first line of code.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            An opt-in talent graph with an <strong>explainable compatibility engine</strong> that rewards complementary skill coverage over popularity, eliminating duplicated skills and midnight gaps.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
          >
            <Button asChild size="lg" className="h-12 px-8 text-base font-bold shadow-lg shadow-primary/25 gap-2">
              <Link href="/matches">
                Try the Demo Feed
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6 text-sm font-semibold">
              <Link href="/team/team-nexus">
                Explore Team Nexus Space
              </Link>
            </Button>
          </motion.div>

          {/* Interactive Hero Score Card Teaser */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 max-w-xl mx-auto rounded-2xl border border-border/80 bg-card/80 p-5 shadow-xl text-left backdrop-blur-md"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  AR
                </div>
                <div>
                  <span className="text-xs font-bold block">Ananya Rao ↔ Rohan Mehta</span>
                  <span className="text-[11px] text-muted-foreground block">Frontend Architect + AI/ML Researcher</span>
                </div>
              </div>
              <ScoreRing score={77} size={48} strokeWidth={4.5} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-700 dark:text-emerald-300 font-medium">
                ✓ Rohan fills Ananya's AI/ML gap (+3)
              </div>
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2 text-indigo-700 dark:text-indigo-300 font-medium">
                ✓ 6h/day IST Evening Schedule Overlap
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3-Step How It Works */}
      <section className="py-16 md:py-24 border-b border-border/60 bg-muted/20">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              How SkillSync Works in 3 Steps
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              From talent profile to optimized hackathon team before opening your IDE
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="rounded-2xl border border-border/80 bg-card p-6 space-y-3 shadow-xs relative overflow-hidden"
                >
                  <span className="text-3xl font-black text-muted-foreground/30 font-mono absolute top-4 right-4">
                    {st.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">{st.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Four Core Principles */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Guiding Ethos
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Built on 4 Core Principles
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Designed to solve the real problems hackathon builders face
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {principles.map((pr) => {
              const Icon = pr.icon;
              return (
                <div
                  key={pr.title}
                  className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-2.5 shadow-xs transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{pr.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pr.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
