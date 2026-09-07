-- ============================================================================
-- GAME LEEF - SUPABASE DATABASE SCHEMA (Leaderboards & Player Profiles)
-- ============================================================================
-- Jalankan query SQL ini di Supabase SQL Editor (https://app.supabase.com)

-- 1. Table untuk profil pemain (auth.users extension)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_score BIGINT DEFAULT 0,
  games_played INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table untuk menyimpan log & skor leaderboard game
CREATE TABLE IF NOT EXISTS public.game_scores (
  id BIGSERIAL PRIMARY KEY,
  game_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  score BIGINT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index untuk mempercepat query leaderboard global per game
CREATE INDEX IF NOT EXISTS idx_game_scores_game_id_score 
ON public.game_scores(game_id, score DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Siapapun (publik) boleh membaca leaderboard
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Public scores are viewable by everyone" 
ON public.game_scores FOR SELECT USING (true);

-- Policy: Siapapun bisa mengirim skor (baik guest maupun user login)
CREATE POLICY "Anyone can submit a game score" 
ON public.game_scores FOR INSERT WITH CHECK (true);

-- Policy: Pengguna hanya dapat mengubah profil mereka sendiri
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);
