'use client';

import * as React from 'react';
import { FactorBreakdown } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { formatVerdict, cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Cpu, Compass, Clock, Users } from 'lucide-react';

export function FactorRow({ factor }: { factor: FactorBreakdown }) {
  const [expanded, setExpanded] = React.useState(false);
  const verdictInfo = formatVerdict(factor.verdict);

  const iconMap = {
    skills: Cpu,
    track: Compass,
    availability: Clock,
    role: Users,
  };
  const Icon = iconMap[factor.key];

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 transition-all hover:bg-card/90">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{factor.label}</span>
              <span className="text-xs text-muted-foreground font-mono">
                ({Math.round(factor.weight * 100)}% weight)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {factor.headline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-mono font-bold text-sm text-primary">
            +{factor.points} pts
          </span>
          <Badge variant="outline" className={cn('text-[11px] font-medium capitalize', verdictInfo.badgeClass)}>
            {verdictInfo.label}
          </Badge>
          <button
            type="button"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle evidence details"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${Math.round(factor.score * 100)}%` }}
        />
      </div>

      {/* Expanded evidence */}
      {expanded && (
        <div className="mt-3.5 pt-3 border-t border-border/50 space-y-1.5 animate-in fade-in duration-200">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Supporting Evidence:
          </span>
          <ul className="space-y-1 text-xs text-foreground/90">
            {factor.evidence.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
