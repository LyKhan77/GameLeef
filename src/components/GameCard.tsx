'use client';

import React from 'react';
import { Play, Heart, Bot } from 'lucide-react';
import { GameItem } from '@/data/games';
import { useGamePlayer } from '@/context/GamePlayerContext';

interface GameCardProps {
  game: GameItem;
}

export default function GameCard({ game }: GameCardProps) {
  const { launchGame, toggleLike, likedGameIds } = useGamePlayer();
  const isLiked = likedGameIds.includes(game.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    launchGame(game);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(game.id);
  };

  return (
    <div
      onClick={() => launchGame(game)}
      className="group relative flex flex-col p-4 bg-[#181818] hover:bg-[#282828] rounded-xl transition-all duration-200 cursor-pointer shadow-card hover:shadow-heavy border border-transparent hover:border-[#333]/50"
    >
      {/* Thumbnail Area with Aspect Ratio & Ambient Glow */}
      <div className="relative w-full aspect-square mb-3.5 rounded-lg overflow-hidden bg-[#1f1f1f] flex items-center justify-center">
        {/* Colorful gradient background */}
        <div
          className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, ${game.accentColor} 0%, #121212 100%)`,
          }}
        />

        {/* Mascot Emoji Icon */}
        <span className="relative z-10 text-5xl sm:text-6xl transform group-hover:scale-110 transition-transform duration-300 select-none">
          {game.icon || '🎮'}
        </span>

        {/* Top Badges (AI Engine & Category) */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 items-start">
          {game.featured && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1ed760] text-black uppercase tracking-wider shadow-sm">
              Featured
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-black/70 backdrop-blur-sm text-[#539df5] border border-[#539df5]/30">
            <Bot className="w-2.5 h-2.5" />
            <span>{game.aiEngine}</span>
          </span>
        </div>

        {/* Floating Circular Green Play Button (Spotify Signature) */}
        <button
          onClick={handlePlay}
          className="absolute bottom-2.5 right-2.5 z-20 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black flex items-center justify-center shadow-glow opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-110 focus:outline-none"
          title={`Mainkan ${game.title}`}
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      {/* Title & Metadata */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-white line-clamp-1">
              {game.title}
            </h3>
            <button
              onClick={handleLike}
              className="text-[#7c7c7c] hover:text-[#f3727f] transition-colors p-0.5"
              title={isLiked ? 'Hapus suka' : 'Sukai game'}
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? 'fill-[#f3727f] text-[#f3727f]' : ''
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-[#b3b3b3] line-clamp-2 mt-1 font-normal leading-relaxed">
            {game.tagline}
          </p>
        </div>

        {/* Footer Badges & Genre Info */}
        <div className="mt-3 pt-2 border-t border-[#252525] flex items-center justify-between text-[11px] text-[#7c7c7c]">
          <span className="truncate max-w-[130px] text-[#ffa42b] font-medium">
            {game.genre}
          </span>
          <span className="font-mono text-[#1ed760] font-semibold">
            {game.playsCount} Plays
          </span>
        </div>
      </div>
    </div>
  );
}
