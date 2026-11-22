'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { PersonaSwitcher } from './PersonaSwitcher';
import { InviteInbox } from './InviteInbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Users,
  User,
  RotateCcw,
  Sun,
  Moon,
  Layers,
  Shield,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUserId, users, teams, resetToScenario, activeScenario } = useAppStore();

  const currentUser = users.find((u) => u.id === currentUserId);
  const currentTeamId = currentUser?.teamId || teams[0]?.id || 'team-nexus';

  // Dark mode state
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Check initial system / html dark mode
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleResetDemo = (scenario: 'A' | 'B') => {
    resetToScenario(scenario);
    toast.success(`Demo restored to Scenario ${scenario} successfully!`, {
      description: scenario === 'A'
        ? 'Ananya Rao initialized with no team; fresh matching feed.'
        : 'Team Nexus initialized with Ananya & Karthik; AI/ML gap active.',
    });
    router.refresh();
  };

  const navLinks = [
    { href: '/matches', label: 'Matches', icon: Sparkles },
    { href: `/team/${currentTeamId}`, label: 'My Team', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/organizer', label: 'Organizer', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
        {/* Logo & Hackathon Tag */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-primary text-white shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-1.5">
                SkillSync
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                  v1.0
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
                Innovate India 2026 • Team Nexus
              </span>
            </div>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href.split('?')[0]);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools: Persona, Inbox, Scenario, Dark */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Scenario A/B Reset */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 text-[11px]">
            <span className="text-muted-foreground px-1.5 font-medium">Demo:</span>
            <button
              onClick={() => handleResetDemo('A')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                activeScenario === 'A'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Scenario A: Fresh Ananya, no team"
            >
              Scen A
            </button>
            <button
              onClick={() => handleResetDemo('B')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                activeScenario === 'B'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Scenario B: Team Nexus formed, Rohan #1 suggestion"
            >
              Scen B
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleResetDemo(activeScenario === 'A' ? 'A' : 'B')}
            className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden"
            title="Reset demo data"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Persona Switcher Dropdown */}
          <PersonaSwitcher />

          {/* Invite Inbox Bell */}
          <InviteInbox />

          {/* Dark / Light Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Toggle color theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-border/60 bg-background/95 py-2 px-4">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href.split('?')[0]);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
