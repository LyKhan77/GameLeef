'use client';

import React, { useState } from 'react';
import { Leaf, Sparkles, ArrowRight, Dices, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGamePlayer } from '@/context/GamePlayerContext';
import { sfx } from '@/lib/sfx';

const AVATAR_OPTIONS = ['🌿', '🎮', '🐠', '🎸', '🌋', '🌪️', '🥔', '☕', '👑'];

const RANDOM_NICKNAMES = [
  'Pemain Santuy',
  'Penatap Magma',
  'Juragan Cupang',
  'Pembalap Truk',
  'Rocker Kamaran',
  'Pengabdi Kafein',
  'Pawang Tornado',
  'Spek Celeron Pro',
  'Nunggu Mie Matang',
  'Kolektor Daun Digital',
];

export default function OnboardingModal() {
  const { isOnboardingOpen, completeOnboarding } = useGamePlayer();
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🌿');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOnboardingOpen) return null;

  const handleRandomize = () => {
    sfx.playClick();
    const randomName =
      RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    const randomAvatar =
      AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
    setNickname(randomName);
    setSelectedAvatar(randomAvatar);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nickname.trim();
    if (!cleanName) {
      setErrorMsg('Tolong masukkan nama atau nickname kamu dulu ya!');
      return;
    }
    if (cleanName.length < 2) {
      setErrorMsg('Nama minimal 2 karakter.');
      return;
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#1ed760', '#539df5', '#ffa42b', '#ffffff'],
      });
    } catch {}

    completeOnboarding(cleanName, selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 select-none animate-fadeIn">
      {/* Modal Card */}
      <div className="w-full max-w-md bg-[#181818] rounded-3xl border border-[#282828] shadow-heavy overflow-hidden relative">
        {/* Glow ambient header */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-[#1ed760]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[#539df5]/15 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-6 pb-4 text-center relative z-10 border-b border-[#282828]/60">
          <div className="w-14 h-14 rounded-2xl bg-[#1f1f1f] border border-[#1ed760]/30 shadow-glow flex items-center justify-center text-3xl mx-auto mb-3">
            {selectedAvatar}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30 mb-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>Pendaftaran Player Game Leef</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Selamat Datang di Game Leef
          </h2>
          <p className="text-xs text-[#b3b3b3] mt-1 max-w-sm mx-auto leading-relaxed">
            Streaming game HTML indie ramah spek kentang. Siapa nama panggilanmu di leaderboard?
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 relative z-10">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7c7c7c] mb-2">
              Pilih Maskot / Avatar Kamu:
            </label>
            <div className="flex items-center justify-between gap-1.5 bg-[#121212] p-2 rounded-2xl border border-[#282828]">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => {
                    sfx.playClick();
                    setSelectedAvatar(emoji);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    selectedAvatar === emoji
                      ? 'bg-[#1ed760] scale-110 shadow-glow text-black'
                      : 'hover:bg-[#1f1f1f] hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7c7c7c]">
                Nickname Pemain:
              </label>
              <button
                type="button"
                onClick={handleRandomize}
                className="text-xs text-[#1ed760] hover:underline flex items-center gap-1 font-semibold"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Acak Nama</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Contoh: GamerSantuy, PengabdiMie..."
                maxLength={24}
                className="w-full px-4 py-3 bg-[#121212] text-white rounded-full border border-[#333] focus:border-[#1ed760] focus:ring-2 focus:ring-[#1ed760]/30 outline-none text-sm transition-all placeholder:text-[#7c7c7c]"
              />
              {nickname && (
                <button
                  type="button"
                  onClick={() => setNickname('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#7c7c7c] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {errorMsg ? (
              <p className="text-[11px] text-[#f3727f] mt-1.5 font-medium">
                {errorMsg}
              </p>
            ) : (
              <p className="text-[10px] text-[#7c7c7c] mt-1.5">
                Nama ini akan dicatat di Supabase Cloud Leaderboard & sertifikat santuy.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!nickname.trim()}
              className="w-full py-3.5 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-extrabold text-xs uppercase tracking-label transition-all shadow-glow hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <span>Masuk ke Game Leef</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Secure & Privacy Note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#7c7c7c] text-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1ed760]" />
            <span>Tanpa password ribet • Langsung main instan</span>
          </div>
        </form>
      </div>
    </div>
  );
}
