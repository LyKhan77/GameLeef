'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, User, Volume2, VolumeX, Trophy, Edit3, Check } from 'lucide-react';
import { CATEGORIES } from '@/data/games';
import { useGamePlayer } from '@/context/GamePlayerContext';
import { cn } from '@/lib/utils';
import { sfx } from '@/lib/sfx';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function TopNav({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}: TopNavProps) {
  const { openLeeModal, isMuted, toggleMute, playerProfile, updateUsername } = useGamePlayer();
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempName, setTempName] = useState(playerProfile.username);

  const handleCategoryClick = (cat: string) => {
    sfx.playClick();
    onSelectCategory(cat);
  };

  const handleSaveUsername = () => {
    sfx.playCoin();
    updateUsername(tempName);
    setIsEditingUser(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md px-6 py-3 border-b border-[#282828]/40 flex flex-col gap-3">
      {/* Top row: Navigation, Search, Audio SFX, Guest Player, Curator Badge */}
      <div className="flex items-center justify-between gap-4">
        {/* Navigation arrows & Search pill */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => sfx.playClick()}
              className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => sfx.playClick()}
              className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors"
              aria-label="Forward"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Spotify Pill Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#b3b3b3]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari game HTML, AI model, genre..."
              className="w-full pl-10 pr-4 py-2 bg-[#1f1f1f] text-white text-sm placeholder-[#7c7c7c] rounded-full focus:outline-none focus:ring-1 focus:ring-white border border-[#282828] transition-all hover:bg-[#252525]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#b3b3b3] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right side: Player Profile, SFX toggle, and Creator Profile */}
        <div className="flex items-center gap-2.5">
          {/* Guest Player Auth Foundation Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-[#181818] px-3 py-1.5 rounded-full border border-[#282828]">
            <span className="text-sm">🎮</span>
            {!isEditingUser ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                  {playerProfile.username}
                </span>
                <button
                  onClick={() => setIsEditingUser(true)}
                  className="text-[#7c7c7c] hover:text-white"
                  title="Ganti Nama Player"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-[#282828] text-white text-xs px-2 py-0.5 rounded outline-none w-24"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                />
                <button
                  onClick={handleSaveUsername}
                  className="text-[#1ed760] hover:scale-110"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="h-3 w-[1px] bg-[#333]" />
            <div className="flex items-center gap-1 text-[10px] text-[#ffa42b] font-mono font-bold">
              <Trophy className="w-3 h-3" />
              <span>{playerProfile.totalScore} pts</span>
            </div>
          </div>

          {/* Mute/Sound toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Nyalakan Efek Suara' : 'Matikan Efek Suara'}
            className="w-9 h-9 rounded-full bg-[#1f1f1f] hover:bg-[#282828] flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors border border-[#282828]"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#f3727f]" /> : <Volume2 className="w-4 h-4 text-[#1ed760]" />}
          </button>

          {/* Creator Pill Badge - Lee Khan */}
          <button
            onClick={openLeeModal}
            className="flex items-center gap-2 bg-[#1f1f1f] hover:bg-[#282828] text-white pl-2 pr-3.5 py-1.5 rounded-full border border-[#282828] hover:border-[#1ed760]/50 transition-all group"
          >
            <div className="w-6 h-6 rounded-full bg-[#1ed760] text-black font-bold text-xs flex items-center justify-center group-hover:rotate-12 transition-transform shadow-glow">
              LK
            </div>
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold tracking-tight">Lee Khan</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-pulse" />
              </div>
              <span className="text-[9px] text-[#b3b3b3] group-hover:text-[#1ed760] transition-colors leading-none">
                Sang Admin GameLeef
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Category Pills (Spotify Filter Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap',
              selectedCategory === cat
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-[#1f1f1f] text-white hover:bg-[#282828] hover:text-white border border-[#282828]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </header>
  );
}
