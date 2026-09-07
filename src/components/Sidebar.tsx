'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Sparkles, Cpu, Award, Heart, PlusCircle, ExternalLink, Leaf } from 'lucide-react';
import { useGamePlayer } from '@/context/GamePlayerContext';
import { PLAYLISTS, GAMES_CATALOG } from '@/data/games';
import { cn } from '@/lib/utils';
import { sfx } from '@/lib/sfx';

interface SidebarProps {
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  selectedPlaylistId?: string | null;
  onSelectPlaylist?: (id: string | null) => void;
}

export default function Sidebar({
  selectedCategory,
  onSelectCategory,
  selectedPlaylistId,
  onSelectPlaylist,
}: SidebarProps) {
  const pathname = usePathname();
  const { openLeeModal, likedGameIds, launchGame } = useGamePlayer();

  const handleNavClick = () => {
    sfx.playClick();
    if (onSelectPlaylist) onSelectPlaylist(null);
    if (onSelectCategory) onSelectCategory('Semua');
  };

  const handlePlaylistClick = (id: string) => {
    sfx.playClick();
    if (onSelectPlaylist) onSelectPlaylist(id);
  };

  const handlePotatoArenaClick = () => {
    sfx.playClick();
    if (onSelectCategory) onSelectCategory('Retro');
    if (onSelectPlaylist) onSelectPlaylist('spek-kentang');
  };

  return (
    <aside className="w-64 bg-[#121212] flex flex-col h-full border-r border-[#282828]/40 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <Link
          href="/"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 text-white group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-full bg-[#1ed760] flex items-center justify-center text-black shadow-glow group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#1ed760] transition-colors">
                Game Leef
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#1ed760]/20 text-[#1ed760] px-1.5 py-0.5 rounded-full border border-[#1ed760]/30">
                Indie
              </span>
            </div>
            <p className="text-[10px] text-[#b3b3b3] font-normal">Streaming Game Sentuh Daun</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1">
        <Link
          href="/"
          onClick={handleNavClick}
          className={cn(
            'flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group',
            pathname === '/' && !selectedPlaylistId
              ? 'text-white bg-[#1f1f1f]'
              : 'text-[#b3b3b3] hover:text-white hover:bg-[#181818]'
          )}
        >
          <Home className={cn('w-5 h-5 transition-colors', pathname === '/' && !selectedPlaylistId ? 'text-[#1ed760]' : 'text-[#b3b3b3] group-hover:text-white')} />
          <span>Home</span>
        </Link>

        <button
          onClick={() => {
            sfx.playClick();
            if (onSelectCategory) onSelectCategory('Semua');
            if (onSelectPlaylist) onSelectPlaylist(null);
          }}
          className={cn(
            'w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group text-left',
            selectedCategory === 'Semua' && !selectedPlaylistId
              ? 'text-white'
              : 'text-[#b3b3b3] hover:text-white hover:bg-[#181818]'
          )}
        >
          <Compass className="w-5 h-5 text-[#b3b3b3] group-hover:text-white" />
          <span>Explore Semua Game</span>
        </button>

        <button
          onClick={handlePotatoArenaClick}
          className={cn(
            'w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group text-left',
            selectedPlaylistId === 'spek-kentang'
              ? 'text-white bg-[#1f1f1f]'
              : 'text-[#b3b3b3] hover:text-white hover:bg-[#181818]'
          )}
        >
          <Cpu className="w-5 h-5 text-[#ffa42b] group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between flex-1">
            <span>Arena Spek Kentang</span>
            <span className="text-[10px] bg-[#ffa42b]/20 text-[#ffa42b] px-1.5 py-0.5 rounded font-mono font-bold">
              🥔
            </span>
          </div>
        </button>

        <button
          onClick={openLeeModal}
          className="w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#b3b3b3] hover:text-white hover:bg-[#181818] transition-all group text-left"
        >
          <Award className="w-5 h-5 text-[#1ed760] group-hover:rotate-12 transition-transform" />
          <div className="flex items-center justify-between flex-1">
            <span>Sang Admin GameLeef</span>
            <span className="text-[9px] bg-[#1ed760]/20 text-[#1ed760] px-1.5 py-0.5 rounded-full font-bold uppercase">
              Admin
            </span>
          </div>
        </button>
      </nav>

      {/* Divider */}
      <div className="px-6 my-3">
        <div className="h-[1px] bg-[#282828]" />
      </div>

      {/* Playlist Section (Spotify style) */}
      <div className="flex-1 px-3 overflow-y-auto overflow-x-hidden space-y-1 custom-scrollbar">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#7c7c7c]">
          Koleksi & Kurasi
        </div>

        {PLAYLISTS.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => handlePlaylistClick(playlist.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all group',
              selectedPlaylistId === playlist.id
                ? 'text-[#1ed760] bg-[#1f1f1f] font-bold'
                : 'text-[#b3b3b3] hover:text-white hover:bg-[#181818]'
            )}
          >
            <span className="text-base group-hover:scale-125 transition-transform">{playlist.icon}</span>
            <span className="truncate">{playlist.title}</span>
          </button>
        ))}

        {likedGameIds.length > 0 && (
          <div className="pt-3">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#7c7c7c] flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-[#f3727f] fill-[#f3727f]" />
              <span>Game Favorit ({likedGameIds.length})</span>
            </div>
            {likedGameIds.map((id) => {
              const g = GAMES_CATALOG.find((item) => item.id === id);
              if (!g) return null;
              return (
                <button
                  key={id}
                  onClick={() => launchGame(g)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#b3b3b3] hover:text-white hover:bg-[#181818] text-left truncate transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760]" />
                  <span className="truncate">{g.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Creator Tag & Vercel Footer */}
      <div className="p-4 bg-[#181818]/60 border-t border-[#282828]/40 m-2 rounded-xl text-center">
        <p className="text-[11px] text-[#b3b3b3]">
          Curated with ☕ by{' '}
          <button
            onClick={openLeeModal}
            className="text-[#1ed760] font-bold hover:underline inline-flex items-center gap-0.5"
          >
            Lee Khan
          </button>
        </p>
        <p className="text-[10px] text-[#7c7c7c] mt-0.5">Vercel Ready • 100% Indie Spirit</p>
      </div>
    </aside>
  );
}
