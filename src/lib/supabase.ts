import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '@/data/games';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize client if environment variables exist
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

/**
 * Submit score to Supabase database (with graceful local fallback)
 */
export async function submitScoreToDatabase(
  gameId: string,
  playerName: string,
  score: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    // Supabase not yet connected -> Stored in local state
    return { success: true };
  }

  try {
    const { error } = await supabase.from('game_scores').insert([
      {
        game_id: gameId,
        player_name: playerName,
        score: score,
        user_id: userId || null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase score insert warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

/**
 * Fetch global leaderboard for a specific game
 */
export async function fetchGameLeaderboard(
  gameId: string,
  fallbackLeaderboard: LeaderboardEntry[] = []
): Promise<LeaderboardEntry[]> {
  if (!supabase) {
    return fallbackLeaderboard;
  }

  try {
    const { data, error } = await supabase
      .from('game_scores')
      .select('player_name, score')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return fallbackLeaderboard;
    }

    return data.map((item, index) => ({
      rank: index + 1,
      player: item.player_name || 'Anonymous',
      score: item.score,
      badge: index === 0 ? 'Leader 👑' : index < 3 ? 'Top 3' : undefined,
    }));
  } catch {
    return fallbackLeaderboard;
  }
}
