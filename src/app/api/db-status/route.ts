import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  const envInspection = {
    has_NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    has_SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    has_NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    has_SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    has_SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    resolved_url: supabaseUrl ? supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1...') : 'MISSING',
  };

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Environment variables Supabase belum terbaca di Vercel.',
        inspection: envInspection,
        solution:
          'Pastikan di Vercel Settings > Environment Variables terdapat NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY (atau SUPABASE_URL dan SUPABASE_ANON_KEY), lalu lakukan Redeploy.',
      },
      { status: 500 }
    );
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey);

    // Test 1: Query profiles table
    const { count: profileCount, error: profileErr } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { data: recentProfiles } = await client
      .from('profiles')
      .select('id, username, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Test 2: Query game_scores table
    const { count: scoreCount, error: scoreErr } = await client
      .from('game_scores')
      .select('*', { count: 'exact', head: true });

    const { data: recentScores } = await client
      .from('game_scores')
      .select('id, game_id, player_name, score, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      status: 'OK',
      message: 'Supabase berhasil terhubung dari server Vercel!',
      inspection: envInspection,
      database: {
        profiles_table: {
          exists: !profileErr,
          error: profileErr ? profileErr.message : null,
          total_rows: profileCount ?? 0,
          recent_samples: recentProfiles ?? [],
        },
        game_scores_table: {
          exists: !scoreErr,
          error: scoreErr ? scoreErr.message : null,
          total_rows: scoreCount ?? 0,
          recent_samples: recentScores ?? [],
        },
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Koneksi ke Supabase gagal.',
        error: errorMsg,
        inspection: envInspection,
      },
      { status: 500 }
    );
  }
}
