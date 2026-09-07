'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  RotateCcw,
  Volume2,
  VolumeX,
  Keyboard,
  Trophy,
  Share2,
  Check,
  Bot,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useGamePlayer } from '@/context/GamePlayerContext';
import { formatTime } from '@/lib/utils';
import { sfx } from '@/lib/sfx';
import { fetchGameLeaderboard, subscribeToGameScores } from '@/lib/supabase';
import { LeaderboardEntry } from '@/data/games';

export default function GameTheaterModal() {
  const {
    activeGame,
    isTheaterOpen,
    closeTheater,
    restartGame,
    gameKey,
    sessionTime,
    playerProfile,
    getGamePlaytime,
  } = useGamePlayer();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'none' | 'controls' | 'leaderboard'>('none');
  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardEntry[]>([]);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeGame) {
      fetchGameLeaderboard(activeGame.id).then((res) => {
        setLiveLeaderboard(res);
      });

      // Subscribe to live score insertions via Supabase Realtime WebSocket
      const unsubscribe = subscribeToGameScores(activeGame.id, () => {
        fetchGameLeaderboard(activeGame.id).then((res) => {
          setLiveLeaderboard(res);
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [activeGame]);

  if (!isTheaterOpen || !activeGame) return null;

  const handleFrameFullscreen = () => {
    sfx.playLaunch();
    if (iframeContainerRef.current) {
      if (!document.fullscreenElement) {
        iframeContainerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleShare = () => {
    sfx.playCoin();
    const url = `${window.location.origin}/game/${activeGame.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const currentHighScore = playerProfile.highScores[activeGame.id] || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn select-none">
      {/* Modal Container */}
      <div className="w-full max-w-6xl h-full max-h-[92vh] bg-[#181818] rounded-2xl border border-[#282828] shadow-heavy flex flex-col overflow-hidden">
        {/* Top Bar Controls */}
        <div className="h-14 bg-[#1f1f1f] px-4 sm:px-6 flex items-center justify-between border-b border-[#282828] flex-shrink-0">
          {/* Game Title & AI Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 select-none"
              style={{ backgroundColor: `${activeGame.accentColor}30` }}
            >
              {activeGame.icon || '🎮'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {activeGame.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#539df5]/20 text-[#539df5] px-2 py-0.5 rounded-full border border-[#539df5]/30 hidden sm:inline">
                  <Bot className="w-3 h-3" />
                  <span>{activeGame.aiEngine}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#b3b3b3] truncate hidden sm:block">
                {activeGame.developer} • Sesi: {formatTime(sessionTime)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Leaderboard Toggle */}
            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab((prev) => (prev === 'leaderboard' ? 'none' : 'leaderboard'));
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                activeTab === 'leaderboard'
                  ? 'bg-[#ffa42b] text-black border-[#ffa42b]'
                  : 'bg-[#252525] text-[#b3b3b3] hover:text-white border-[#333]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            {/* Controls Guide Toggle */}
            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab((prev) => (prev === 'controls' ? 'none' : 'controls'));
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                activeTab === 'controls'
                  ? 'bg-white text-black border-white'
                  : 'bg-[#252525] text-[#b3b3b3] hover:text-white border-[#333]'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kontrol</span>
            </button>

            {/* Reload Game */}
            <button
              onClick={restartGame}
              title="Restart Game"
              className="w-8 h-8 rounded-full bg-[#252525] hover:bg-[#333] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-all hover:scale-105 border border-[#333]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Fullscreen Player */}
            <button
              onClick={handleFrameFullscreen}
              title="Fullscreen Game"
              className="w-8 h-8 rounded-full bg-[#252525] hover:bg-[#333] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-all hover:scale-105 border border-[#333]"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Share Link */}
            <button
              onClick={handleShare}
              title="Salin Link Game"
              className="w-8 h-8 rounded-full bg-[#252525] hover:bg-[#333] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-all hover:scale-105 border border-[#333]"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#1ed760]" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Close Theater Modal */}
            <button
              onClick={closeTheater}
              title="Tutup (Tetap berjalan di Now Playing bar)"
              className="w-8 h-8 rounded-full bg-[#f3727f]/10 hover:bg-[#f3727f] text-[#f3727f] hover:text-black flex items-center justify-center transition-all hover:scale-105 border border-[#f3727f]/30 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body: Iframe Screen & Info Drawer */}
        <div className="flex-1 flex flex-col md:flex-row relative bg-[#121212] overflow-hidden">
          {/* Game Iframe Canvas */}
          <div
            ref={iframeContainerRef}
            className="flex-1 w-full h-full relative bg-black flex items-center justify-center overflow-hidden"
          >
            <iframe
              key={gameKey}
              src={activeGame.gameUrl}
              title={activeGame.title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; gamepad"
              allowFullScreen
            />
          </div>

          {/* Collapsible Info / Leaderboard Drawer */}
          {activeTab !== 'none' && (
            <div className="w-full md:w-80 bg-[#181818] border-t md:border-t-0 md:border-l border-[#282828] p-5 overflow-y-auto custom-scrollbar flex flex-col justify-between flex-shrink-0 animate-fadeIn">
              {activeTab === 'leaderboard' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffa42b] flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" />
                      <span>Leaderboard Global</span>
                    </h4>
                    <span className="text-[10px] bg-[#ffa42b]/20 text-[#ffa42b] px-2 py-0.5 rounded-full font-bold">
                      {activeGame.metricName || 'Poin'}
                    </span>
                  </div>

                  {/* Player Stats Card (Score & Playtime) */}
                  <div className="p-3 bg-[#1f1f1f] rounded-xl border border-[#1ed760]/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#b3b3b3]">Pencapaian Kamu:</span>
                      <span className="font-mono font-bold text-[#1ed760]">
                        {currentHighScore.toLocaleString('id-ID')} {activeGame.metricUnit || 'pts'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-[#282828] pt-1.5">
                      <span className="text-[#b3b3b3] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#ffa42b]" />
                        Jam Terbang Santuy:
                      </span>
                      <span className="font-mono font-bold text-[#ffa42b]">
                        {formatTime(getGamePlaytime(activeGame.id))}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#7c7c7c]">
                      Player: {playerProfile.username}
                    </p>
                  </div>

                  {/* Leaderboard Entries List */}
                  {liveLeaderboard.length === 0 ? (
                    <div className="p-5 bg-[#1f1f1f] rounded-xl border border-[#282828] text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-[#282828] flex items-center justify-center text-lg mx-auto text-[#ffa42b]">
                        🏆
                      </div>
                      <h5 className="text-xs font-bold text-white">Belum Ada Skor di Database</h5>
                      <p className="text-[11px] text-[#7c7c7c] leading-relaxed">
                        Jadilah yang pertama mencetak rekor skor di Supabase untuk game ini!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {liveLeaderboard.map((entry) => (
                        <div
                          key={entry.rank}
                          className={`flex items-center justify-between p-2.5 rounded-lg text-xs border ${
                            entry.rank === 1
                              ? 'bg-[#ffa42b]/10 border-[#ffa42b]/40 text-white font-bold'
                              : 'bg-[#1f1f1f] border-[#282828] text-[#b3b3b3]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                entry.rank === 1
                                  ? 'bg-[#ffa42b] text-black'
                                  : entry.rank === 2
                                  ? 'bg-[#cbcbcb] text-black'
                                  : 'bg-[#282828] text-white'
                              }`}
                            >
                              {entry.rank}
                            </span>
                            <span className="font-semibold text-white truncate max-w-[110px]">
                              {entry.player}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-white text-[11px]">
                            {entry.score.toLocaleString('id-ID')} {activeGame.metricUnit || ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1ed760] mb-1">
                      Panduan Tombol
                    </h4>
                    <div className="space-y-2 mt-2">
                      {activeGame.controls.map((ctrl, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#1f1f1f] border border-[#282828] text-xs"
                        >
                          <span className="font-mono font-bold text-white bg-[#282828] px-2 py-0.5 rounded">
                            {ctrl.key}
                          </span>
                          <span className="text-[#b3b3b3]">{ctrl.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#282828]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#539df5] mb-1">
                      AI Engine
                    </h4>
                    <p className="text-xs text-[#b3b3b3] bg-[#1f1f1f] p-2.5 rounded-lg border border-[#282828]">
                      Developed with <b>{activeGame.aiEngine}</b> by <b>{activeGame.developer}</b>.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#282828]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7c7c7c] mb-1">
                      Humor Quote
                    </h4>
                    <p className="text-xs italic text-[#cbcbcb] bg-black/40 p-2.5 rounded-lg border border-white/5">
                      {activeGame.humorQuote}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-[#282828] text-center">
                <p className="text-[10px] text-[#7c7c7c]">
                  Game Leef Bridge SDK Active
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
