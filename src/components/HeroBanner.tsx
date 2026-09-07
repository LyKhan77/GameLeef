'use client';

import React from 'react';
import { Play, Heart, Flame, Bot, History, Clock } from 'lucide-react';
import { GameItem } from '@/data/games';
import { useGamePlayer } from '@/context/GamePlayerContext';
import { formatTime } from '@/lib/utils';
import { sfx } from '@/lib/sfx';

interface HeroBannerProps {
  featuredGame: GameItem;
  isRecentlyPlayed?: boolean;
}

export default function HeroBanner({ featuredGame, isRecentlyPlayed }: HeroBannerProps) {
  const { launchGame, toggleLike, likedGameIds, getGamePlaytime, getGamePlayCount } = useGamePlayer();
  const isLiked = likedGameIds.includes(featuredGame.id);
  const totalPlaytime = getGamePlaytime(featuredGame.id);
  const playCount = getGamePlayCount(featuredGame.id);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181818] via-[#1f1f1f] to-[#121212] border border-[#282828] p-6 md:p-8 shadow-heavy group">
      {/* Background ambient decorative glow */}
      <div
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: featuredGame.accentColor }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Text Content */}
        <div className="space-y-3 max-w-2xl">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {isRecentlyPlayed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#1ed760] text-black shadow-glow">
                <History className="w-3.5 h-3.5" />
                Lanjutkan Terakhir Dimainkan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#1ed760] text-black shadow-glow">
                <Flame className="w-3.5 h-3.5 fill-black" />
                Game Spotlight Pilihan
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#539df5]/20 text-[#539df5] border border-[#539df5]/30">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Engine: {featuredGame.aiEngine}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffa42b]/20 text-[#ffa42b] border border-[#ffa42b]/30">
              {featuredGame.genre}
            </span>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {featuredGame.title}
          </h1>

          <p className="text-sm sm:text-base text-[#b3b3b3] font-normal leading-relaxed">
            {featuredGame.tagline}
          </p>

          {/* Humorous Quote & Creator Studio */}
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 inline-block space-y-1">
            <p className="text-xs italic text-[#cbcbcb]">
              {featuredGame.humorQuote}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#1ed760] font-semibold pt-0.5">
              <span>👑 {featuredGame.developer}</span>
              <span>•</span>
              <span>🤖 Model: {featuredGame.aiEngine}</span>
              {totalPlaytime > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[#ffa42b] inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Jam Terbang Kamu: {formatTime(totalPlaytime)} ({playCount}x main)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => launchGame(featuredGame)}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-xs sm:text-sm uppercase tracking-label transition-all shadow-glow hover:scale-105"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>{isRecentlyPlayed ? 'Lanjutkan Main' : 'Mainkan Sekarang'}</span>
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                toggleLike(featuredGame.id);
              }}
              className="p-3 rounded-full bg-[#252525] hover:bg-[#2e2e2e] text-white transition-all border border-[#333] hover:scale-105"
              title={isLiked ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked ? 'fill-[#f3727f] text-[#f3727f]' : 'text-white'
                }`}
              />
            </button>

            <div className="hidden sm:flex items-center gap-3 text-xs text-[#b3b3b3] pl-2">
              <span>🎮 {featuredGame.playsCount} Plays</span>
              <span>•</span>
              <span>⭐ {featuredGame.rating}</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Showcase / Mascot Visual */}
        <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-black/30 rounded-2xl border border-white/10 w-64 text-center">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-glow mb-3 transition-transform group-hover:scale-110 select-none"
            style={{ backgroundColor: `${featuredGame.accentColor}25` }}
          >
            {featuredGame.icon || '🎮'}
          </div>
          <p className="text-xs font-bold text-white">{featuredGame.title}</p>
          <p className="text-[10px] text-[#539df5] mt-1 font-semibold">🤖 Engine: {featuredGame.aiEngine}</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-[#1ed760] font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{totalPlaytime > 0 ? `Dimainkan ${formatTime(totalPlaytime)}` : 'Zero Lag / Instant Play'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
