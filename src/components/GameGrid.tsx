'use client';

import React from 'react';
import { GameItem, PLAYLISTS } from '@/data/games';
import GameCard from '@/components/GameCard';
import { Flame, Bot, Sparkles, Gamepad2 } from 'lucide-react';
import { sfx } from '@/lib/sfx';

interface GameGridProps {
  games: GameItem[];
  selectedCategory: string;
  selectedPlaylistId: string | null;
  searchQuery: string;
  onResetFilters: () => void;
}

export default function GameGrid({
  games,
  selectedCategory,
  selectedPlaylistId,
  searchQuery,
  onResetFilters,
}: GameGridProps) {
  // If there is an active playlist or search query or specific category, render a focused grid
  const activePlaylist = selectedPlaylistId
    ? PLAYLISTS.find((p) => p.id === selectedPlaylistId)
    : null;

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-[#181818]/40 rounded-2xl border border-[#282828] my-6">
        <div className="w-16 h-16 rounded-full bg-[#1f1f1f] flex items-center justify-center text-3xl mb-4 text-[#ffa42b]">
          🎮
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Tidak Ada Game yang Cocok</h3>
        <p className="text-sm text-[#b3b3b3] max-w-md mb-6">
          Pencarian untuk &quot;{searchQuery || selectedCategory}&quot; belum menemukan game.
        </p>
        <button
          onClick={() => {
            sfx.playClick();
            onResetFilters();
          }}
          className="px-6 py-2.5 rounded-full bg-[#1ed760] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#1db954] transition-all shadow-glow"
        >
          Reset Filter & Tampilkan Semua
        </button>
      </div>
    );
  }

  // If a playlist or search is active, show flat grid with header
  if (activePlaylist || searchQuery || selectedCategory !== 'Semua') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {activePlaylist ? (
                <>
                  <span>{activePlaylist.icon}</span>
                  <span>{activePlaylist.title}</span>
                </>
              ) : searchQuery ? (
                <>
                  <Gamepad2 className="w-6 h-6 text-[#1ed760]" />
                  <span>Hasil Pencarian: &quot;{searchQuery}&quot;</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-[#1ed760]" />
                  <span>Kategori: {selectedCategory}</span>
                </>
              )}
            </h2>
            <p className="text-xs text-[#b3b3b3] mt-1">
              {activePlaylist
                ? activePlaylist.description
                : `Menampilkan ${games.length} game siap main`}
            </p>
          </div>

          {(activePlaylist || searchQuery || selectedCategory !== 'Semua') && (
            <button
              onClick={() => {
                sfx.playClick();
                onResetFilters();
              }}
              className="text-xs text-[#1ed760] hover:underline font-semibold"
            >
              Lihat Semua
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    );
  }

  // Default Home View: Multiple curated rows
  const featuredPicks = games.filter((g) => g.featured);
  const simulationAndPhysics = games.filter((g) => g.category === 'Simulation' || g.genre.includes('Physics'));
  const arcadeAndMusic = games.filter((g) => g.category === 'Arcade' || g.category === 'Music' || g.category === 'Action');

  return (
    <div className="space-y-10">
      {/* Row 1: Featured Spotlight */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#f3727f] fill-[#f3727f]" />
              <span>Trending & Spotlight Pilihan</span>
            </h2>
            <p className="text-xs text-[#b3b3b3]">
              Game pilihan dengan gameplay paling seru dan rating tertinggi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {featuredPicks.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Row 2: 3D Simulations & Science */}
      {simulationAndPhysics.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="text-xl">🌋</span>
                <span>Simulasi & Fisika Atmosfer 3D</span>
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Ekosistem akuarium santai, letusan vulkanik, dan amukan pusaran badai
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {simulationAndPhysics.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Row 3: Arcade, Rhythm & Action */}
      {arcadeAndMusic.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="text-xl">🎸</span>
                <span>Arcade, Ritme Musik & Taruhan Jalanan</span>
              </h2>
              <p className="text-xs text-[#b3b3b3]">
                Petik senar gitar, pasang taruhan kendaraan, dan tantang refleks jari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {arcadeAndMusic.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Row 4: All Games */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#1ed760]" />
              <span>Semua Game HTML Game Leef</span>
            </h2>
            <p className="text-xs text-[#b3b3b3]">
              Seluruh katalog game HTML karya Lee Khan Studios ditenagai AI Models
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
