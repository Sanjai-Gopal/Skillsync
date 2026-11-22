import { Availability } from '../types';

export function computeOverlapHours(hoursA: number[], hoursB: number[]): number {
  let overlap = 0;
  for (let i = 0; i < 24; i++) {
    if ((hoursA[i] ?? 0) === 1 && (hoursB[i] ?? 0) === 1) {
      overlap++;
    }
  }
  return overlap;
}

export interface OverlapWindow {
  startHour: number;
  endHour: number;
}

export function computeOverlapWindows(hoursA: number[], hoursB: number[]): OverlapWindow[] {
  const overlappingHours: number[] = [];
  for (let i = 0; i < 24; i++) {
    if ((hoursA[i] ?? 0) === 1 && (hoursB[i] ?? 0) === 1) {
      overlappingHours.push(i);
    }
  }

  if (overlappingHours.length === 0) {
    return [];
  }

  // Find contiguous ranges, handling 24h wrap
  const isOverlap = new Array(24).fill(false);
  for (const h of overlappingHours) isOverlap[h] = true;

  const windows: OverlapWindow[] = [];
  let visited = new Array(24).fill(false);

  for (let i = 0; i < 24; i++) {
    if (isOverlap[i] && !visited[i]) {
      let start = i;
      let curr = i;
      visited[curr] = true;

      while (isOverlap[(curr + 1) % 24] && !visited[(curr + 1) % 24]) {
        curr = (curr + 1) % 24;
        visited[curr] = true;
        if (curr === start) break; // full 24h
      }

      // If wrapped across 0 (e.g. from 22 to 2), start can be higher than end
      // For display, startHour to (endHour + 1)
      const endHour = (curr + 1) % 24;
      windows.push({ startHour: start, endHour });
    }
  }

  return windows;
}

export function computeAvailabilityScore(
  availA: Availability,
  availB: Availability
): {
  score: number;
  overlapHours: number;
  overlapWindows: OverlapWindow[];
  hasCaution: boolean;
  cautionText?: string;
} {
  const overlapHours = computeOverlapHours(availA.hoursUtc, availB.hoursUtc);
  const overlapWindows = computeOverlapWindows(availA.hoursUtc, availB.hoursUtc);

  // A = min(1, overlapHrs/4). Caution if overlapHrs < 2.
  const score = Math.min(1, overlapHours / 4);
  const hasCaution = overlapHours < 2;
  const cautionText = hasCaution
    ? overlapHours === 0
      ? 'Zero schedule overlap — collaboration across timezones will be tough'
      : `Only ${overlapHours}h schedule overlap (less than 2h)`
    : undefined;

  return {
    score,
    overlapHours,
    overlapWindows,
    hasCaution,
    cautionText,
  };
}
