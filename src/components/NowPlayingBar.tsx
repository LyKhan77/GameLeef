'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Tv,
  Heart,
  Volume2,
  VolumeX,
  Gamepad2,
} from 'lucide-react';
import { useGamePlayer } from '@/context/GamePlayerContext';
import { formatTime } from '@/lib/utils';
import { sfx } from '@/lib/sfx';

export default function NowPlayingBar() {
  const {
    activeGame,
    isPlaying,
    sessionTime,
    isTheaterOpen,
    isMuted,
    likedGameIds,
    openTheater,
    togglePlay,
    restartGame,
    toggleLike,
    toggleMute,
  } = useGamePlayer();

  if (!activeGame) return null;

  const isLiked = likedGameIds.includes(activeGame.id);

  const handleFullscreen = () => {
    sfx.playLaunch();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-20 bg-[#181818] border-t border-[#282828] px-4 sm:px-6 flex items-center justify-between select-none shadow-heavy">
      {/* Left: Active Game Info */}
      <div className="flex items-center gap-3 w-1/3 min-w-0">
        <div
          onClick={openTheater}
          className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1f1f1f] flex-shrink-0 cursor-pointer group flex items-center justify-center border border-white/5"
        >
          <div
            className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity"
            style={{ backgroundColor: activeGame.accentColor }}
          />
          <span className="relative z-10 text-2xl group-hover:scale-110 transition-transform select-none">
            {activeGame.icon || '🎮'}
          </span>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4
              onClick={openTheater}
              className="text-sm font-bold text-white truncate cursor-pointer hover:underline"
            >
              {activeGame.title}
            </h4>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-ping hidden sm:inline-block" />
          </div>
          <p className="text-[11px] text-[#b3b3b3] truncate">
            {activeGame.genre} • 🤖 {activeGame.aiEngine}
          </p>
        </div>

        <button
          onClick={() => {
            sfx.playClick();
            toggleLike(activeGame.id);
          }}
          className="text-[#7c7c7c] hover:text-[#f3727f] p-1.5 transition-colors hidden sm:block"
          title={isLiked ? 'Hapus dari Favorit' : 'Sukai Game'}
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? 'fill-[#f3727f] text-[#f3727f]' : ''
            }`}
          />
        </button>
      </div>

      {/* Center: Spotify-Style Player Controls & Play Timer */}
      <div className="flex flex-col items-center justify-center gap-1 w-1/3">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Reload Game Frame */}
          <button
            onClick={restartGame}
            title="Muat Ulang / Restart Game"
            className="text-[#b3b3b3] hover:text-white transition-colors p-1.5 hover:scale-110"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary Play/Pause Circular Pill Button */}
          <button
            onClick={() => {
              if (!isTheaterOpen) {
                openTheater();
              } else {
                togglePlay();
              }
            }}
            title={isPlaying ? 'Pause Sesi Main' : 'Mulai Main / Buka Theater'}
            className="w-10 h-10 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black flex items-center justify-center shadow-glow transition-transform hover:scale-105 focus:outline-none"
          >
            {isPlaying && isTheaterOpen ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>

          {/* Open Theater Mode */}
          <button
            onClick={openTheater}
            title="Buka Game Theater Player"
            className="text-[#b3b3b3] hover:text-[#1ed760] transition-colors p-1.5 hover:scale-110"
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>

        {/* Play Duration Progress Bar / Timer */}
        <div className="flex items-center gap-2 w-full max-w-xs">
          <span className="text-[10px] font-mono text-[#b3b3b3]">
            {formatTime(sessionTime)}
          </span>
          <div className="flex-1 h-1 bg-[#282828] rounded-full overflow-hidden relative group cursor-pointer">
            <div
              className="h-full bg-[#1ed760] group-hover:bg-[#1db954] transition-all duration-300"
              style={{
                width: `${Math.min(100, (sessionTime % 180) / 1.8)}%`,
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#7c7c7c] hidden sm:inline">
            LIVE
          </span>
        </div>
      </div>

      {/* Right: Quick Launch, SFX, Fullscreen */}
      <div className="flex items-center justify-end gap-3 w-1/3">
        {/* Play in Theater CTA Pill Button */}
        <button
          onClick={openTheater}
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#282828] text-white text-xs font-bold uppercase tracking-wider border border-[#282828] transition-all hover:border-[#1ed760]/40"
        >
          <Gamepad2 className="w-3.5 h-3.5 text-[#1ed760]" />
          <span>Layar Game</span>
        </button>

        {/* SFX Mute */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Nyalakan Efek Suara' : 'Matikan Suara'}
          className="text-[#b3b3b3] hover:text-white p-2 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-[#f3727f]" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#1ed760]" />
          )}
        </button>

        {/* Native Fullscreen */}
        <button
          onClick={handleFullscreen}
          title="Fullscreen Browser"
          className="text-[#b3b3b3] hover:text-white p-2 transition-colors hover:scale-110 hidden sm:block"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
