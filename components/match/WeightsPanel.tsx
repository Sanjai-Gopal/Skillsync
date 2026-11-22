'use client';

import * as React from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, SlidersHorizontal, Info } from 'lucide-react';

export function WeightsPanel() {
  const { weights, setWeights, resetWeights } = useAppStore();

  const handleSliderChange = (key: 'skills' | 'track' | 'availability' | 'role', val: number) => {
    setWeights({ [key]: val / 100 });
  };

  const sumCheck = Math.round((weights.skills + weights.track + weights.availability + weights.role) * 100);

  return (
    <div className="rounded-2xl border border-border/80 bg-card/70 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Interactive Engine Weights</h3>
            <p className="text-xs text-muted-foreground">
              Adjust priorities live — scores normalize to sum 100%
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetWeights}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset weights
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Skills */}
        <div className="space-y-2 rounded-xl bg-background/50 p-3 border border-border/50">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Skills Complement</span>
            <span className="font-mono font-bold text-primary">
              {Math.round(weights.skills * 100)}%
            </span>
          </div>
          <Slider
            value={[Math.round(weights.skills * 100)]}
            min={5}
            max={80}
            step={1}
            onValueChange={([val]) => handleSliderChange('skills', val)}
            aria-label="Skill weight slider"
          />
        </div>

        {/* Track & Goals */}
        <div className="space-y-2 rounded-xl bg-background/50 p-3 border border-border/50">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Track & Goals</span>
            <span className="font-mono font-bold text-primary">
              {Math.round(weights.track * 100)}%
            </span>
          </div>
          <Slider
            value={[Math.round(weights.track * 100)]}
            min={5}
            max={80}
            step={1}
            onValueChange={([val]) => handleSliderChange('track', val)}
            aria-label="Track weight slider"
          />
        </div>

        {/* Availability */}
        <div className="space-y-2 rounded-xl bg-background/50 p-3 border border-border/50">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Schedule Overlap</span>
            <span className="font-mono font-bold text-primary">
              {Math.round(weights.availability * 100)}%
            </span>
          </div>
          <Slider
            value={[Math.round(weights.availability * 100)]}
            min={5}
            max={80}
            step={1}
            onValueChange={([val]) => handleSliderChange('availability', val)}
            aria-label="Availability weight slider"
          />
        </div>

        {/* Role & Collab */}
        <div className="space-y-2 rounded-xl bg-background/50 p-3 border border-border/50">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Role & Style</span>
            <span className="font-mono font-bold text-primary">
              {Math.round(weights.role * 100)}%
            </span>
          </div>
          <Slider
            value={[Math.round(weights.role * 100)]}
            min={5}
            max={80}
            step={1}
            onValueChange={([val]) => handleSliderChange('role', val)}
            aria-label="Role weight slider"
          />
        </div>
      </div>
    </div>
  );
}
