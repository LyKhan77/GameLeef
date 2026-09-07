import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: true, data: [] });
    }

    const client = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await client
      .from('game_scores')
      .select('player_name, score')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(10);

    if (error || !data) {
      return NextResponse.json({ success: true, data: [] });
    }

    const leaderboard = data.map((item, index) => ({
      rank: index + 1,
      player: item.player_name || 'Player Santuy',
      score: Number(item.score) || 0,
      badge: index === 0 ? 'Leader 👑' : index < 3 ? 'Top 3' : undefined,
    }));

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg, data: [] }, { status: 500 });
  }
}
