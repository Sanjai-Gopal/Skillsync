import { NextRequest, NextResponse } from 'next/server';
import { SEED_USERS } from '@/seed';
import { computePairwiseMatch, normalizeWeights } from '@/lib/matching';
import { Weights } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerId = searchParams.get('viewer');

    if (!viewerId) {
      return NextResponse.json({ error: 'Viewer ID query parameter is required' }, { status: 400 });
    }

    const viewer = SEED_USERS.find((u) => u.id === viewerId);
    if (!viewer) {
      return NextResponse.json({ error: `User with id "${viewerId}" not found` }, { status: 404 });
    }

    const rawWeights: Partial<Weights> = {};
    if (searchParams.has('skills')) rawWeights.skills = parseFloat(searchParams.get('skills')!);
    if (searchParams.has('track')) rawWeights.track = parseFloat(searchParams.get('track')!);
    if (searchParams.has('availability')) rawWeights.availability = parseFloat(searchParams.get('availability')!);
    if (searchParams.has('role')) rawWeights.role = parseFloat(searchParams.get('role')!);

    const weights = normalizeWeights(rawWeights);

    // Compute pairwise matches for all other users
    const candidates = SEED_USERS.filter((u) => u.id !== viewer.id);
    const matches = candidates.map((candidate) => {
      const breakdown = computePairwiseMatch(viewer, candidate, weights);
      return {
        candidate,
        breakdown,
      };
    });

    // Sort descending by match total
    matches.sort((a, b) => b.breakdown.total - a.breakdown.total);

    return NextResponse.json({
      viewer,
      weightsUsed: weights,
      matches,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
