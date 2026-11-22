import { NextRequest, NextResponse } from 'next/server';
import { SCENARIO_B, SEED_USERS } from '@/seed';
import { computeTeamCoverage, normalizeWeights } from '@/lib/matching';
import { Weights } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'teamId query parameter is required' }, { status: 400 });
    }

    // Check predefined teams in scenario or fallback
    const team = SCENARIO_B.teams.find((t) => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: `Team with id "${teamId}" not found` }, { status: 404 });
    }

    const rawWeights: Partial<Weights> = {};
    if (searchParams.has('skills')) rawWeights.skills = parseFloat(searchParams.get('skills')!);
    if (searchParams.has('track')) rawWeights.track = parseFloat(searchParams.get('track')!);
    if (searchParams.has('availability')) rawWeights.availability = parseFloat(searchParams.get('availability')!);
    if (searchParams.has('role')) rawWeights.role = parseFloat(searchParams.get('role')!);

    const weights = normalizeWeights(rawWeights);
    const coverage = computeTeamCoverage(team, SEED_USERS, weights);

    return NextResponse.json({
      team,
      coverage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
