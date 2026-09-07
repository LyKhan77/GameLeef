import type { Metadata } from 'next';
import './globals.css';
import { GamePlayerProvider } from '@/context/GamePlayerContext';
import NowPlayingBar from '@/components/NowPlayingBar';
import GameTheaterModal from '@/components/GameTheaterModal';
import LeeKhanModal from '@/components/LeeKhanModal';
import OnboardingModal from '@/components/OnboardingModal';

export const metadata: Metadata = {
  title: 'Game Leef — Gateway Game HTML & Indie Hub by Lee Khan',
  description:
    'Streaming game HTML indie lebih segar dari daun, lebih ringan dari beban hidup. Curated by Lee Khan.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#121212] text-white min-h-screen antialiased selection:bg-[#1ed760] selection:text-black">
        <GamePlayerProvider>
          <div className="flex h-screen overflow-hidden pb-20">
            {children}
          </div>
          {/* Bottom Persistent Spotify Bar */}
          <NowPlayingBar />
          {/* Modal Theater View */}
          <GameTheaterModal />
          {/* Easter Egg & Creator Modal */}
          <LeeKhanModal />
          {/* Welcome Player Onboarding Modal */}
          <OnboardingModal />
        </GamePlayerProvider>
      </body>
    </html>
  );
}
