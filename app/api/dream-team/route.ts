import { NextRequest, NextResponse } from 'next/server';
import { SEED_USERS } from '@/seed';
import { findDreamTeams, normalizeWeights } from '@/lib/matching';
import { Weights } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerId = searchParams.get('viewer');
    if (!viewerId) {
      return NextResponse.json({ error: 'viewer query parameter is required' }, { status: 400 });
    }
    const viewer = SEED_USERS.find((u) => u.id === viewerId);
    if (!viewer) {
      return NextResponse.json({ error: `User with id "${viewerId}" not found` }, { status: 404 });
    }

    const raw: Partial<Weights> = {};
    for (const k of ['skills', 'track', 'availability', 'role'] as const) {
      if (searchParams.has(k)) raw[k] = parseFloat(searchParams.get(k)!);
    }
    const size = Math.min(6, Math.max(2, parseInt(searchParams.get('size') ?? '4', 10) || 4));

    const result = findDreamTeams(viewer, SEED_USERS, { size, weights: normalizeWeights(raw) });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
