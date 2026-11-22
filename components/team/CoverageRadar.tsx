'use client';

import * as React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Domain } from '@/lib/types';
import { DOMAINS, ALL_DOMAINS } from '@/lib/taxonomy';

export interface CoverageRadarProps {
  coverage: Record<Domain, number>;
  projectedCoverage?: Record<Domain, number> | null;
  projectedCandidateName?: string | null;
}

export function CoverageRadar({
  coverage,
  projectedCoverage,
  projectedCandidateName,
}: CoverageRadarProps) {
  const chartData = ALL_DOMAINS.map((domainKey) => {
    const domainDef = DOMAINS.find((d) => d.id === domainKey);
    const label = domainDef ? domainDef.label : domainKey;
    const currentVal = Math.round((coverage[domainKey] || 0) * 100);
    const projectedVal = projectedCoverage
      ? Math.round((projectedCoverage[domainKey] || 0) * 100)
      : currentVal;

    return {
      domain: label,
      current: currentVal,
      projected: projectedVal,
      fullMark: 100,
    };
  });

  return (
    <div className="w-full h-[320px] sm:h-[360px] relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="domain"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
            stroke="hsl(var(--border))"
          />

          {/* Current Team Coverage Area */}
          <Radar
            name="Current Team"
            dataKey="current"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.35}
            strokeWidth={2}
          />

          {/* Projected Overlay when hovering "what if" candidate */}
          {projectedCoverage && (
            <Radar
              name={projectedCandidateName ? `+ ${projectedCandidateName}` : 'Projected Team'}
              dataKey="projected"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              strokeWidth={2.5}
              strokeDasharray="4 4"
            />
          )}

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md text-xs">
                    <span className="font-bold text-foreground block mb-1">{data.domain}</span>
                    <span className="text-primary font-mono block">
                      Current Coverage: {data.current}%
                    </span>
                    {projectedCoverage && (
                      <span className="text-emerald-500 font-mono block">
                        Projected Coverage: {data.projected}% (+{data.projected - data.current}%)
                      </span>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend Badge */}
      <div className="absolute bottom-1 right-2 flex items-center gap-3 text-[11px] bg-background/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-border/60">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-muted-foreground font-medium">Current Team</span>
        </div>
        {projectedCoverage && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono">
              + {projectedCandidateName || 'Preview'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
