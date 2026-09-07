'use client';

import React, { useEffect, useState } from 'react';
import { X, Award, Sparkles, Coffee, CheckCircle2, Leaf, Gamepad2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGamePlayer } from '@/context/GamePlayerContext';
import { sfx } from '@/lib/sfx';

export default function LeeKhanModal() {
  const { isLeeModalOpen, closeLeeModal } = useGamePlayer();
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (isLeeModalOpen) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1ed760', '#ffffff', '#ffa42b', '#539df5'],
        });
      } catch {}
    }
  }, [isLeeModalOpen]);

  if (!isLeeModalOpen) return null;

  const handleClaimCertificate = () => {
    sfx.playEasterEgg();
    setClaimed(true);
    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#1ed760', '#539df5', '#f3727f', '#ffa42b'],
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-lg bg-[#181818] rounded-2xl border border-[#1ed760]/40 shadow-heavy overflow-hidden relative">
        {/* Decorative Top Banner */}
        <div className="h-28 bg-gradient-to-r from-[#121212] via-[#1ed760]/20 to-[#121212] p-6 flex items-center justify-between border-b border-[#282828] relative">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#1ed760] text-black font-black text-2xl flex items-center justify-center shadow-glow border-2 border-white">
              LK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Sang Admin GameLeef
                </h3>
                <span className="bg-[#1ed760] text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Official Admin
                </span>
              </div>
              <p className="text-xs text-[#1ed760] font-semibold">
                Lee Khan • Chief Leef Officer & Game Curator
              </p>
            </div>
          </div>

          <button
            onClick={closeLeeModal}
            className="w-8 h-8 rounded-full bg-[#252525] hover:bg-[#333] text-[#b3b3b3] hover:text-white flex items-center justify-center transition-colors border border-[#333]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Philosophy Statement */}
          <div className="bg-[#1f1f1f] p-4 rounded-xl border border-[#282828] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1ed760]">
              <Leaf className="w-4 h-4" />
              <span>Filosofi Game Leef</span>
            </div>
            <p className="text-xs text-[#b3b3b3] leading-relaxed italic">
              &quot;Game-game di Game Leef hadir agar kamu bisa rehat sejenak, menertawakan bug kehidupan, dan menikmati game HTML indie tanpa perlu memikirkan spek PC.&quot;
            </p>
            <div className="pt-2 border-t border-[#282828] flex items-center justify-between text-[11px] text-[#b3b3b3]">
              <span>Kurator & Penyedia Platform Game</span>
              <span className="text-[#1ed760] font-bold">100% Indie Spirit</span>
            </div>
          </div>

          {/* Humorous Dev Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-[#1f1f1f] rounded-xl border border-[#282828]">
              <Gamepad2 className="w-4 h-4 text-[#1ed760] mx-auto mb-1" />
              <div className="text-sm font-bold text-white">Kurasi Game</div>
              <div className="text-[10px] text-[#b3b3b3]">HTML5 Terpilih</div>
            </div>

            <div className="p-3 bg-[#1f1f1f] rounded-xl border border-[#282828]">
              <Coffee className="w-4 h-4 text-[#ffa42b] mx-auto mb-1" />
              <div className="text-sm font-bold text-white">∞ Kopi</div>
              <div className="text-[10px] text-[#b3b3b3]">Bahan Bakar Harian</div>
            </div>

            <div className="p-3 bg-[#1f1f1f] rounded-xl border border-[#282828]">
              <Sparkles className="w-4 h-4 text-[#1ed760] mx-auto mb-1" />
              <div className="text-sm font-bold text-white">Spek Kentang</div>
              <div className="text-[10px] text-[#b3b3b3]">Standar Resmi</div>
            </div>
          </div>

          {/* Interactive Claim Certificate Easter Egg */}
          <div className="text-center pt-2">
            {!claimed ? (
              <button
                onClick={handleClaimCertificate}
                className="w-full py-3 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-xs uppercase tracking-label transition-all shadow-glow hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Klaim Sertifikat Pemain Santuy</span>
              </button>
            ) : (
              <div className="p-3 bg-[#1ed760]/10 border border-[#1ed760]/30 rounded-xl text-center animate-fadeIn">
                <div className="flex items-center justify-center gap-1.5 text-[#1ed760] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sertifikat Terverifikasi oleh Sang Admin GameLeef (Lee Khan)!</span>
                </div>
                <p className="text-[11px] text-[#b3b3b3] mt-0.5">
                  Kamu resmi dinobatkan sebagai Gamer Daun Paling Santuy Se-Indonesia.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#121212] border-t border-[#282828] text-center">
          <p className="text-[10px] text-[#7c7c7c]">
            Game Leef v1.0 • Sang Admin GameLeef • Curated by Lee Khan
          </p>
        </div>
      </div>
    </div>
  );
}
