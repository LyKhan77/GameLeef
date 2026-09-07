import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '@/data/games';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize client if environment variables exist
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
 * Register or update player profile in Supabase database
 */
export async function registerProfileToDatabase(
  username: string,
  avatar: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  if (!supabase) {
    console.info('[GameLeef] Supabase not configured. Operating in local mode.');
    return { success: true };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          username,
          avatar_url: avatar,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('[GameLeef] Supabase profile sync warning:', error.message);
      return { success: false, error: error.message };
    }

    console.info('[GameLeef] Profile successfully synced to Supabase:', data);
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

/**
 * Submit score or playtime to Supabase database
 */
export async function submitScoreToDatabase(
  gameId: string,
  playerName: string,
  score: number,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    console.info('[GameLeef] Score saved locally (Supabase not configured):', { gameId, playerName, score });
    return { success: true };
  }

  try {
    const { error } = await supabase.from('game_scores').insert([
      {
        game_id: gameId,
        player_name: playerName,
        score: score,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('[GameLeef] Supabase score insert warning:', error.message);
      return { success: false, error: error.message };
    }

    console.info('[GameLeef] Score successfully recorded to Supabase:', { gameId, playerName, score });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

/**
 * Fetch 100% real global leaderboard for a specific game (NO MOCK DATA)
 */
export async function fetchGameLeaderboard(
  gameId: string
): Promise<LeaderboardEntry[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('game_scores')
      .select('player_name, score')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((item, index) => ({
      rank: index + 1,
      player: item.player_name || 'Player Santuy',
      score: item.score,
      badge: index === 0 ? 'Leader 👑' : index < 3 ? 'Top 3' : undefined,
    }));
  } catch (err) {
    console.warn('[GameLeef] Failed to fetch leaderboard:', err);
    return [];
  }
}

/**
 * Subscribe to realtime score updates for a specific game via WebSocket
 */
export function subscribeToGameScores(
  gameId: string,
  onNewScore: () => void
): () => void {
  if (!supabase) {
    return () => {};
  }

  const channel = supabase
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
        console.info('[GameLeef Realtime] New score detected on server:', payload);
        onNewScore();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
