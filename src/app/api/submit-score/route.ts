import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, playerName, score, metadata } = body;

    if (!gameId) {
      return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
    }

    const cleanPlayerName = (playerName || 'Pemain Santuy').trim();
    const numericScore = Math.max(0, Math.round(Number(score) || 0));

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '';

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[API /submit-score] Supabase env variables missing on server');
      return NextResponse.json({
        success: false,
        reason: 'Supabase unconfigured on server',
      });
    }

    const client = createClient(supabaseUrl, supabaseKey);

    // 1. Insert into game_scores
    const { data: scoreData, error: scoreError } = await client
      .from('game_scores')
      .insert([
        {
          game_id: gameId,
          player_name: cleanPlayerName,
          score: numericScore,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (scoreError) {
      console.error('[API /submit-score] Database error:', scoreError.message);
      return NextResponse.json(
        { success: false, error: scoreError.message },
        { status: 500 }
      );
    }

    // 2. Optionally update player profile total_score & games_played
    try {
      const { data: profileList } = await client
        .from('profiles')
        .select('id, total_score, games_played')
        .eq('username', cleanPlayerName)
        .limit(1);

      if (profileList && profileList.length > 0) {
        const cur = profileList[0];
        await client
          .from('profiles')
          .update({
            total_score: (cur.total_score || 0) + numericScore,
            games_played: (cur.games_played || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cur.id);
      }
    } catch (profileErr) {
      console.warn('[API /submit-score] Profile score sync non-fatal error:', profileErr);
    }

    console.info('[API /submit-score] Score recorded successfully:', {
      gameId,
      player: cleanPlayerName,
      score: numericScore,
    });

    return NextResponse.json({ success: true, data: scoreData });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
