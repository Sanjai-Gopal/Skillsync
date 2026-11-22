'use client';

import * as React from 'react';
import { Domain } from '@/lib/types';
import { DOMAINS } from '@/lib/taxonomy';
import { AlertCircle, AlertTriangle, CheckCircle2, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function GapCallout({
  gaps,
  coverage,
  onTargetGap,
}: {
  gaps: Domain[];
  coverage: Record<Domain, number>;
  onTargetGap?: (domain: Domain) => void;
}) {
  if (gaps.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        <div>
          <span className="font-bold text-sm block">Full Domain Coverage Achieved!</span>
          <span className="text-muted-foreground block mt-0.5">
            Your team has no critical coverage gaps across all target technical domains.
          </span>
        </div>
      </div>
    );
  }

  const roleRecommends: Record<Domain, string> = {
    frontend: 'a Frontend Developer',
    backend: 'a Backend Engineer',
    ai_ml: 'an AI/ML Practitioner',
    design: 'a UI/UX Designer',
    product: 'a Product Manager',
    devops: 'a DevOps / Cloud Architect',
    data: 'a Data Engineer',
    mobile: 'a Mobile App Developer',
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4" />
          Capability Gaps Detected ({gaps.length})
        </h3>
        <span className="text-[11px] text-muted-foreground font-mono">
          Coverage &lt; 50%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {gaps.map((gapDomain) => {
          const domainDef = DOMAINS.find((d) => d.id === gapDomain);
          const currentPercent = Math.round((coverage[gapDomain] || 0) * 100);
          const recRole = roleRecommends[gapDomain] || 'a specialist';

          return (
            <div
              key={gapDomain}
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {domainDef?.label || gapDomain}
                  </span>
                  <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono">
                    {currentPercent}% coverage
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Action: Invite {recRole} to eliminate this vulnerability.
                </p>
              </div>

              {onTargetGap && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTargetGap(gapDomain)}
                  className="h-7 text-[11px] border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium px-2.5 shrink-0"
                >
                  <UserPlus className="h-3 w-3 mr-1" /> Find Match
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
