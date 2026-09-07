import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, avatar } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.trim();
    const cleanAvatar = avatar || '🌿';

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '';

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[API /sync-profile] Supabase env variables missing on server');
      return NextResponse.json({
        success: false,
        reason: 'Supabase unconfigured on server',
      });
    }

    const client = createClient(supabaseUrl, supabaseKey);

    // Check if player profile already exists with this username
    const { data: existing, error: findError } = await client
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername)
      .limit(1);

    if (findError) {
      console.warn('[API /sync-profile] Find existing error (continuing):', findError.message);
    }

    let responseData = null;

    if (existing && existing.length > 0) {
      const { data, error: updateError } = await client
        .from('profiles')
        .update({
          avatar_url: cleanAvatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id)
        .select();

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }
      responseData = data;
    } else {
      const { data, error: insertError } = await client
        .from('profiles')
        .insert([
          {
            username: cleanUsername,
            avatar_url: cleanAvatar,
            total_score: 0,
            games_played: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
      responseData = data;
    }

    console.info('[API /sync-profile] Profile successfully synced:', responseData);
    return NextResponse.json({ success: true, data: responseData });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
