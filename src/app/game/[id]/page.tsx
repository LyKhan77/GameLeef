'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  ChevronLeft,
  RotateCcw,
  Maximize2,
  Share2,
  Heart,
  Keyboard,
  Trophy,
  Bot,
  Check,
  Clock,
} from 'lucide-react';
import { GAMES_CATALOG, LeaderboardEntry } from '@/data/games';
import { useGamePlayer } from '@/context/GamePlayerContext';
import { sfx } from '@/lib/sfx';
import { formatTime } from '@/lib/utils';
import { fetchGameLeaderboard, subscribeToGameScores } from '@/lib/supabase';

export default function GameDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const game = GAMES_CATALOG.find((g) => g.id === id);

  const {
    toggleLike,
    likedGameIds,
    restartGame,
    gameKey,
    playerProfile,
    getGamePlaytime,
  } = useGamePlayer();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'leaderboard'>('details');
  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardEntry[]>([]);
  const iframeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (game) {
      fetchGameLeaderboard(game.id).then((res) => {
        setLiveLeaderboard(res);
      });

      // Subscribe to live score insertions via Supabase Realtime WebSocket
      const unsubscribe = subscribeToGameScores(game.id, () => {
        fetchGameLeaderboard(game.id).then((res) => {
          setLiveLeaderboard(res);
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [game]);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#121212] w-full">
        <h1 className="text-2xl font-bold text-white mb-2">Game Tidak Ditemukan</h1>
        <p className="text-sm text-[#b3b3b3] mb-6">
          Game yang kamu cari mungkin sedang diseduh kopi oleh developer.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[#1ed760] text-black font-bold text-xs uppercase tracking-wider"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const isLiked = likedGameIds.includes(game.id);
  const currentHighScore = playerProfile.highScores[game.id] || 0;

  const handleFullscreen = () => {
    sfx.playLaunch();
    if (iframeRef.current) {
      if (!document.fullscreenElement) {
        iframeRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleShare = () => {
    sfx.playCoin();
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] flex flex-col overflow-y-auto custom-scrollbar">
      {/* Top Bar Header */}
      <header className="h-16 px-6 bg-[#181818] border-b border-[#282828] flex items-center justify-between sticky top-0 z-30">
        <Link
          href="/"
          onClick={() => sfx.playClick()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#b3b3b3] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Kembali ke Katalog Game Leef</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1f1f1f] hover:bg-[#282828] text-white text-xs font-semibold border border-[#282828] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1ed760]" />
                <span className="text-[#1ed760]">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              toggleLike(game.id);
            }}
            className="p-2 rounded-full bg-[#1f1f1f] hover:bg-[#282828] text-white border border-[#282828] transition-colors"
            title={isLiked ? 'Hapus dari Favorit' : 'Sukai Game'}
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? 'fill-[#f3727f] text-[#f3727f]' : 'text-[#b3b3b3]'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Game Canvas Box */}
        <div
          ref={iframeRef}
          className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#282828] shadow-heavy flex flex-col"
        >
          <iframe
            key={gameKey}
            src={game.gameUrl}
            title={game.title}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad"
            allowFullScreen
          />

          {/* Quick overlay controls in bottom corner */}
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <button
              onClick={restartGame}
              title="Restart Game"
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleFullscreen}
              title="Fullscreen"
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls (Details vs Leaderboard) */}
        <div className="flex items-center gap-3 border-b border-[#282828] pb-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'details'
                ? 'bg-white text-black'
                : 'text-[#b3b3b3] hover:text-white bg-[#1f1f1f]'
            }`}
          >
            Detail & Panduan
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-[#ffa42b] text-black'
                : 'text-[#b3b3b3] hover:text-white bg-[#1f1f1f]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard Global</span>
          </button>
        </div>

        {/* Game Details or Leaderboard Section */}
        {activeTab === 'details' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Description & Controls */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1ed760] text-black">
                    {game.category}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#539df5]/20 text-[#539df5] border border-[#539df5]/30">
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Engine: {game.aiEngine}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffa42b]/20 text-[#ffa42b] border border-[#ffa42b]/30">
                    {game.potatoScore}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {game.title}
                </h1>

                <p className="text-sm text-[#b3b3b3] leading-relaxed">
                  {game.description}
                </p>
              </div>

              {/* Controls Guide */}
              <div className="p-5 bg-[#181818] rounded-xl border border-[#282828] space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Keyboard className="w-4 h-4 text-[#1ed760]" />
                  <span>Panduan Tombol & Kontrol</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {game.controls.map((ctrl, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#1f1f1f] border border-[#282828] text-xs"
                    >
                      <span className="font-mono font-bold text-white bg-[#282828] px-2 py-0.5 rounded">
                        {ctrl.key}
                      </span>
                      <span className="text-[#b3b3b3]">{ctrl.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges List */}
              <div className="flex flex-wrap gap-2">
                {game.humorBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-[#181818] border border-[#282828] text-xs font-medium text-[#b3b3b3]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Col: Curator Card & Humor */}
            <div className="space-y-4">
              <div className="p-5 bg-[#181818] rounded-xl border border-[#282828] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c7c7c]">
                  Developer & Studio
                </h3>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black font-bold flex items-center justify-center text-sm shadow-glow">
                    LK
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{game.developer}</h4>
                    <p className="text-xs text-[#1ed760]">
                      {game.developerRole || 'Creator & Curator'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#1f1f1f] rounded-lg border border-[#282828] text-xs text-[#539df5]">
                  <b>AI Engine:</b> {game.aiEngine}
                </div>

                <p className="text-xs text-[#b3b3b3] italic border-t border-[#282828] pt-3">
                  {game.humorQuote}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Leaderboard Tab */
          <div className="max-w-2xl bg-[#181818] p-6 rounded-2xl border border-[#282828] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Trophy className="w-5 h-5 text-[#ffa42b]" />
                <span>Peringkat Skor Global - {game.title}</span>
              </div>
              <span className="text-xs bg-[#ffa42b]/20 text-[#ffa42b] px-3 py-1 rounded-full font-bold">
                Supabase Live
              </span>
            </div>

            {/* Player High Score & Playtime */}
            <div className="p-4 bg-[#1f1f1f] rounded-xl border border-[#1ed760]/30 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#b3b3b3]">Pencapaian Kamu ({playerProfile.username})</span>
                  <div className="text-lg font-mono font-bold text-[#1ed760]">
                    {currentHighScore.toLocaleString('id-ID')} {game.metricUnit || 'pts'}
                  </div>
                </div>
                <span className="text-xs bg-[#ffa42b]/20 text-[#ffa42b] px-3 py-1 rounded-full font-bold">
                  {game.metricName || 'Poin'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-[#282828] pt-2">
                <span className="text-[#b3b3b3] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#ffa42b]" />
                  Jam Terbang Santuy:
                </span>
                <span className="font-mono font-bold text-[#ffa42b]">
                  {formatTime(getGamePlaytime(game.id))}
                </span>
              </div>
            </div>

            {/* Leaderboard Table */}
            {liveLeaderboard.length === 0 ? (
              <div className="p-8 bg-[#1f1f1f] rounded-xl border border-[#282828] text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#282828] flex items-center justify-center text-2xl mx-auto text-[#ffa42b]">
                  🏆
                </div>
                <h4 className="text-sm font-bold text-white">Belum Ada Skor di Database</h4>
                <p className="text-xs text-[#7c7c7c] max-w-sm mx-auto leading-relaxed">
                  Jadilah pemain pertama yang mencatatkan rekor skor di Supabase untuk game {game.title}!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {liveLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                      entry.rank === 1
                        ? 'bg-[#ffa42b]/10 border-[#ffa42b]/40 text-white font-bold'
                        : 'bg-[#1f1f1f] border-[#282828] text-[#b3b3b3]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          entry.rank === 1
                            ? 'bg-[#ffa42b] text-black'
                            : entry.rank === 2
                            ? 'bg-[#cbcbcb] text-black'
                            : 'bg-[#282828] text-white'
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <span className="text-white font-medium">{entry.player}</span>
                      {entry.badge && (
                        <span className="text-[10px] bg-[#282828] px-2 py-0.5 rounded text-[#1ed760]">
                          {entry.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-white">
                      {entry.score.toLocaleString('id-ID')} {game.metricUnit || ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
