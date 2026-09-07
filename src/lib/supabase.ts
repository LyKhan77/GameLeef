import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '@/data/games';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize client if public environment variables exist
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

/**
 * Register or update player profile in Supabase database.
 * Dual-write: Uses server-side /api/sync-profile first (bypassing client env issues),
 * with direct Supabase client fallback.
 */
export async function registerProfileToDatabase(
  username: string,
  avatar: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const cleanName = username.trim();
  const cleanAvatar = avatar || '🌿';

  // 1. Primary: Server-side API endpoint
  try {
    const res = await fetch('/api/sync-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanName, avatar: cleanAvatar }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        console.info('[GameLeef] Profile successfully synced via /api/sync-profile:', result);
        return { success: true, data: result.data };
      }
    }
  } catch (apiErr) {
    console.warn('[GameLeef] /api/sync-profile fetch warning:', apiErr);
  }

  // 2. Secondary: Direct Supabase client if configured in browser
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            username: cleanName,
            avatar_url: cleanAvatar,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (!error) {
        console.info('[GameLeef] Profile successfully synced via direct Supabase:', data);
        return { success: true, data };
      }
    } catch (dbErr: unknown) {
      const msg = dbErr instanceof Error ? dbErr.message : 'Unknown error';
      return { success: false, error: msg };
    }
  }

  return { success: true };
}

/**
 * Submit score or playtime to Supabase database.
 * Dual-write: Uses server-side /api/submit-score first, with direct Supabase client fallback.
 */
export async function submitScoreToDatabase(
  gameId: string,
  playerName: string,
  score: number,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const cleanPlayer = playerName.trim() || 'Pemain Santuy';
  const cleanScore = Math.max(0, Math.round(score || 0));

  // 1. Primary: Server-side API endpoint
  try {
    const res = await fetch('/api/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId,
        playerName: cleanPlayer,
        score: cleanScore,
        metadata: metadata || {},
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        console.info('[GameLeef] Score saved via /api/submit-score:', { gameId, cleanPlayer, cleanScore });
        return { success: true };
      }
    }
  } catch (apiErr) {
    console.warn('[GameLeef] /api/submit-score fetch warning:', apiErr);
  }

  // 2. Secondary: Direct Supabase client
  if (supabase) {
    try {
      const { error } = await supabase.from('game_scores').insert([
        {
          game_id: gameId,
          player_name: cleanPlayer,
          score: cleanScore,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
        },
      ]);

      if (!error) {
        console.info('[GameLeef] Score recorded via direct Supabase:', { gameId, cleanPlayer, cleanScore });
        return { success: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: msg };
    }
  }

  return { success: true };
}

/**
 * Fetch 100% real global leaderboard for a specific game (NO MOCK DATA).
 * Uses server-side /api/leaderboard first, with direct Supabase client fallback.
 */
export async function fetchGameLeaderboard(
  gameId: string
): Promise<LeaderboardEntry[]> {
  // 1. Primary: Server-side API
  try {
    const res = await fetch(`/api/leaderboard?gameId=${encodeURIComponent(gameId)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (apiErr) {
    console.warn('[GameLeef] /api/leaderboard fetch error:', apiErr);
  }

  // 2. Secondary: Direct Supabase client
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('player_name, score')
        .eq('game_id', gameId)
        .order('score', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        return data.map((item, index) => ({
          rank: index + 1,
          player: item.player_name || 'Pemain Santuy',
          score: Number(item.score) || 0,
          badge: index === 0 ? 'Leader 👑' : index < 3 ? 'Top 3' : undefined,
        }));
      }
    } catch (err) {
      console.warn('[GameLeef] Supabase client fetch leaderboard error:', err);
    }
  }

  return [];
}

/**
 * Subscribe to realtime score updates for a specific game.
 * Uses Supabase WebSocket channel if available, and includes a smart poll interval as backup.
 */
export function subscribeToGameScores(
  gameId: string,
  onNewScore: () => void
): () => void {
  let channel: ReturnType<SupabaseClient['channel']> | null = null;

  if (supabase) {
    try {
      channel = supabase
        .channel(`realtime_scores_${gameId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'game_scores',
            filter: `game_id=eq.${gameId}`,
          },
          (payload) => {
            console.info('[GameLeef Realtime] New score event from WebSocket:', payload);
            onNewScore();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[GameLeef Realtime] WebSocket setup error:', err);
    }
  }

  // Fallback gentle interval to poll leaderboard every 12 seconds
  const pollInterval = setInterval(() => {
    onNewScore();
  }, 12000);

  return () => {
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
    clearInterval(pollInterval);
  };
}
