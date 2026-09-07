-- ============================================================================
-- GAME LEEF - SUPABASE DATABASE SCHEMA & MIGRATION SCRIPT
-- ============================================================================
-- Jalankan query SQL ini di Supabase SQL Editor (https://supabase.com/dashboard)
-- Query ini dirancang aman (idempotent), bisa dijalankan berkali-kali tanpa error.

-- 1. Pastikan ekstensi UUID aktif
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Table profiles (Mendukung Guest Onboarding tanpa auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  avatar_url TEXT DEFAULT '🌿',
  total_score BIGINT DEFAULT 0,
  games_played INT DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Penyesuaian jika tabel profiles sudah terlanjur dibuat dengan constraint lama
DO $$ 
BEGIN
  -- Lepas foreign key ke auth.users jika ada agar guest player bisa tersimpan
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
  END IF;

  -- Pastikan kolom id memiliki default gen_random_uuid()
  ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
END $$;

-- 3. Table game_scores (Skor & Playtime Leaderboard Global)
CREATE TABLE IF NOT EXISTS public.game_scores (
  id BIGSERIAL PRIMARY KEY,
  game_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  user_id UUID,
  score BIGINT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'game_scores_user_id_fkey' AND table_name = 'game_scores'
  ) THEN
    ALTER TABLE public.game_scores DROP CONSTRAINT game_scores_user_id_fkey;
  END IF;
END $$;

-- 4. Index performa query leaderboard
CREATE INDEX IF NOT EXISTS idx_game_scores_game_id_score 
ON public.game_scores(game_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON public.profiles(username);

-- 5. Permission Grant untuk Anon, Authenticated, dan Service Role
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.game_scores TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 6. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Reset policies untuk menghindari error "policy already exists"
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert player profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;

DROP POLICY IF EXISTS "Public scores are viewable by everyone" ON public.game_scores;
DROP POLICY IF EXISTS "Anyone can submit a game score" ON public.game_scores;

-- Buat policies yang mengizinkan guest & registered player
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Anyone can insert player profile" 
ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their profile" 
ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public scores are viewable by everyone" 
ON public.game_scores FOR SELECT USING (true);

CREATE POLICY "Anyone can submit a game score" 
ON public.game_scores FOR INSERT WITH CHECK (true);

-- 7. Aktifkan Realtime WebSocket untuk tabel game_scores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'game_scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_scores;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Jika publication belum aktif di instance Supabase tertentu, abaikan
END $$;
