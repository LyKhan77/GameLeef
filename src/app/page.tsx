'use client';

import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import HeroBanner from '@/components/HeroBanner';
import GameGrid from '@/components/GameGrid';
import { GAMES_CATALOG, PLAYLISTS } from '@/data/games';
import { useGamePlayer } from '@/context/GamePlayerContext';
import { Heart, Sparkles, Coffee } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Filter games based on search, category, and playlist
  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((game) => {
      // Playlist filter
      if (selectedPlaylistId) {
        const playlist = PLAYLISTS.find((p) => p.id === selectedPlaylistId);
        if (playlist && !playlist.gameIds.includes(game.id)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'Semua' && game.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = game.title.toLowerCase().includes(q);
        const matchesTagline = game.tagline.toLowerCase().includes(q);
        const matchesCategory = game.category.toLowerCase().includes(q);
        const matchesGenre = game.genre.toLowerCase().includes(q);
        const matchesAi = game.aiEngine.toLowerCase().includes(q);
        const matchesDev = game.developer.toLowerCase().includes(q);
        const matchesBadges = game.humorBadges.some((b) => b.toLowerCase().includes(q));
        if (!matchesTitle && !matchesTagline && !matchesCategory && !matchesGenre && !matchesAi && !matchesDev && !matchesBadges) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedPlaylistId]);

  const { openLeeModal, lastPlayedGame } = useGamePlayer();

  const spotlightGame = useMemo(() => {
    return lastPlayedGame || GAMES_CATALOG.find((g) => g.featured) || GAMES_CATALOG[0];
  }, [lastPlayedGame]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedPlaylistId(null);
  };

  return (
    <div className="flex w-full h-full bg-[#121212] overflow-hidden">
      {/* Fixed Left Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedPlaylistId(null);
          }}
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={(id) => {
            setSelectedPlaylistId(id);
            if (id) setSelectedCategory('Semua');
          }}
        />
      </div>

      {/* Main Scrollable Canvas Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pb-24">
        {/* Sticky Top Bar */}
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedPlaylistId(null);
          }}
        />

        {/* Content Container */}
        <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Hero Banner (Shown only when not actively searching) */}
          {!searchQuery && selectedCategory === 'Semua' && !selectedPlaylistId && (
            <HeroBanner
              featuredGame={spotlightGame}
              isRecentlyPlayed={Boolean(lastPlayedGame)}
            />
          )}

          {/* Game Catalog Grid */}
          <GameGrid
            games={filteredGames}
            selectedCategory={selectedCategory}
            selectedPlaylistId={selectedPlaylistId}
            searchQuery={searchQuery}
            onResetFilters={handleResetFilters}
          />

          {/* Humorous Footer Note */}
          <footer className="pt-12 pb-8 border-t border-[#282828] text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-[#b3b3b3]">
              <span>Dibuat dengan</span>
              <Coffee className="w-4 h-4 text-[#ffa42b]" />
              <span>dan dedikasi indie oleh</span>
              <button
                onClick={openLeeModal}
                className="text-[#1ed760] font-bold hover:underline"
              >
                Lee Khan
              </button>
            </div>
            <p className="text-xs text-[#7c7c7c]">
              Game Leef • The Spotify-Inspired HTML Game Gateway • Siap Dideploy ke Vercel
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
