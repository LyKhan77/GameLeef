'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { GameItem, GAMES_CATALOG } from '@/data/games';
import { sfx } from '@/lib/sfx';
import { GameBridgeMessage } from '@/lib/gameBridge';
import { submitScoreToDatabase } from '@/lib/supabase';

export interface PlayerProfile {
  username: string;
  avatar: string;
  totalScore: number;
  gamesPlayed: number;
  highScores: Record<string, number>;
  playtimes: Record<string, number>; // total seconds played per game
  playCounts: Record<string, number>; // times launched
  lastPlayedGameId?: string;
}

interface GamePlayerContextType {
  activeGame: GameItem | null;
  lastPlayedGame: GameItem | null;
  isPlaying: boolean;
  sessionTime: number;
  isTheaterOpen: boolean;
  isMuted: boolean;
  isLeeModalOpen: boolean;
  likedGameIds: string[];
  playerProfile: PlayerProfile;
  lastScoreSubmitted: { gameId: string; score: number } | null;
  launchGame: (game: GameItem) => void;
  closeTheater: () => void;
  openTheater: () => void;
  togglePlay: () => void;
  restartGame: () => void;
  toggleLike: (gameId: string) => void;
  toggleMute: () => void;
  openLeeModal: () => void;
  closeLeeModal: () => void;
  updateUsername: (name: string) => void;
  getGamePlaytime: (gameId: string) => number;
  getGamePlayCount: (gameId: string) => number;
  gameKey: number; // Increment to force iframe reload
}

const DEFAULT_PROFILE: PlayerProfile = {
  username: 'Guest Player #1337',
  avatar: '🎮',
  totalScore: 0,
  gamesPlayed: 0,
  highScores: {},
  playtimes: {},
  playCounts: {},
};

const GamePlayerContext = createContext<GamePlayerContextType | undefined>(undefined);

export function GamePlayerProvider({ children }: { children: ReactNode }) {
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [isTheaterOpen, setIsTheaterOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLeeModalOpen, setIsLeeModalOpen] = useState<boolean>(false);
  const [likedGameIds, setLikedGameIds] = useState<string[]>([]);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [lastScoreSubmitted, setLastScoreSubmitted] = useState<{ gameId: string; score: number } | null>(null);
  const [gameKey, setGameKey] = useState<number>(1);

  // Set default game and load persistent localStorage profile & favorites
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('gameleef_liked_games');
      if (savedLikes) setLikedGameIds(JSON.parse(savedLikes));

      const savedProfile = localStorage.getItem('gameleef_player_profile');
      if (savedProfile) {
        const parsed: PlayerProfile = JSON.parse(savedProfile);
        setPlayerProfile({
          ...DEFAULT_PROFILE,
          ...parsed,
          playtimes: parsed.playtimes || {},
          playCounts: parsed.playCounts || {},
        });
        if (parsed.lastPlayedGameId) {
          const found = GAMES_CATALOG.find((g) => g.id === parsed.lastPlayedGameId);
          if (found) setActiveGame(found);
        }
      }
    } catch {
      // Ignore storage errors
    }

    if (GAMES_CATALOG.length > 0 && !activeGame) {
      setActiveGame(GAMES_CATALOG[0]);
    }
  }, []);

  const lastPlayedGame = useMemo(() => {
    if (playerProfile.lastPlayedGameId) {
      return GAMES_CATALOG.find((g) => g.id === playerProfile.lastPlayedGameId) || null;
    }
    return null;
  }, [playerProfile.lastPlayedGameId]);

  // Window postMessage Listener for Game Bridge events & score submissions
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as GameBridgeMessage;
      if (data && data.type === 'GAMELEEF_SUBMIT_SCORE') {
        sfx.playCoin();
        setLastScoreSubmitted({ gameId: data.gameId, score: data.score });
        
        // Push to Supabase if connected
        submitScoreToDatabase(data.gameId, playerProfile.username, data.score);

        setPlayerProfile((prev) => {
          const currentHigh = prev.highScores[data.gameId] || 0;
          const newHigh = Math.max(currentHigh, data.score);
          const updated: PlayerProfile = {
            ...prev,
            totalScore: prev.totalScore + data.score,
            gamesPlayed: prev.gamesPlayed + 1,
            highScores: {
              ...prev.highScores,
              [data.gameId]: newHigh,
            },
          };
          try {
            localStorage.setItem('gameleef_player_profile', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playerProfile.username]);

  // Timer interval for game session duration and accumulated playtime
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && isTheaterOpen && activeGame) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);

        // Accumulate playtime for active game
        setPlayerProfile((prev) => {
          const gameId = activeGame.id;
          const updatedPlaytimes = {
            ...prev.playtimes,
            [gameId]: (prev.playtimes[gameId] || 0) + 1,
          };
          const updated = {
            ...prev,
            playtimes: updatedPlaytimes,
          };
          // Save every 5 seconds to reduce storage writes
          if (sessionTime % 5 === 0) {
            try {
              localStorage.setItem('gameleef_player_profile', JSON.stringify(updated));
            } catch {}
          }
          return updated;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isTheaterOpen, activeGame, sessionTime]);

  const launchGame = (game: GameItem) => {
    setActiveGame(game);
    setIsPlaying(true);
    setIsTheaterOpen(true);
    setSessionTime(0);
    setGameKey((prev) => prev + 1);
    sfx.playLaunch();

    // Record last played game and increment play count
    setPlayerProfile((prev) => {
      const updated: PlayerProfile = {
        ...prev,
        lastPlayedGameId: game.id,
        playCounts: {
          ...prev.playCounts,
          [game.id]: (prev.playCounts[game.id] || 0) + 1,
        },
      };
      try {
        localStorage.setItem('gameleef_player_profile', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const closeTheater = () => {
    setIsTheaterOpen(false);
    sfx.playClick();
  };

  const openTheater = () => {
    if (activeGame) {
      setIsTheaterOpen(true);
      setIsPlaying(true);
      sfx.playLaunch();
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    sfx.playClick();
  };

  const restartGame = () => {
    setGameKey((prev) => prev + 1);
    setSessionTime(0);
    setIsPlaying(true);
    sfx.playCoin();
  };

  const toggleLike = (gameId: string) => {
    setLikedGameIds((prev) => {
      let updated: string[];
      if (prev.includes(gameId)) {
        updated = prev.filter((id) => id !== gameId);
      } else {
        updated = [...prev, gameId];
        sfx.playCoin();
      }
      try {
        localStorage.setItem('gameleef_liked_games', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const nextVal = !prev;
      sfx.setMuted(nextVal);
      return nextVal;
    });
  };

  const openLeeModal = () => {
    setIsLeeModalOpen(true);
    sfx.playEasterEgg();
  };

  const closeLeeModal = () => {
    setIsLeeModalOpen(false);
    sfx.playClick();
  };

  const updateUsername = (name: string) => {
    setPlayerProfile((prev) => {
      const updated = { ...prev, username: name.trim() || 'Player Santuy' };
      try {
        localStorage.setItem('gameleef_player_profile', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const getGamePlaytime = (gameId: string): number => {
    return playerProfile.playtimes[gameId] || 0;
  };

  const getGamePlayCount = (gameId: string): number => {
    return playerProfile.playCounts[gameId] || 0;
  };

  return (
    <GamePlayerContext.Provider
      value={{
        activeGame,
        lastPlayedGame,
        isPlaying,
        sessionTime,
        isTheaterOpen,
        isMuted,
        isLeeModalOpen,
        likedGameIds,
        playerProfile,
        lastScoreSubmitted,
        launchGame,
        closeTheater,
        openTheater,
        togglePlay,
        restartGame,
        toggleLike,
        toggleMute,
        openLeeModal,
        closeLeeModal,
        updateUsername,
        getGamePlaytime,
        getGamePlayCount,
        gameKey,
      }}
    >
      {children}
    </GamePlayerContext.Provider>
  );
}

export function useGamePlayer() {
  const context = useContext(GamePlayerContext);
  if (!context) {
    throw new Error('useGamePlayer must be used within a GamePlayerProvider');
  }
  return context;
}
