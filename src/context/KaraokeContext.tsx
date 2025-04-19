
import React, { createContext, useContext, useEffect } from "react";
import { KaraokeContextData } from "./types";
import { useKaraokeQueue } from "@/hooks/useKaraokeQueue";
import { useKaraokeSongs } from "@/hooks/useKaraokeSongs";
import { useKaraokePerformance } from "@/hooks/useKaraokePerformance";

const KaraokeContext = createContext<KaraokeContextData | undefined>(undefined);

interface KaraokeProviderProps {
  children: React.ReactNode;
}

export const KaraokeProvider: React.FC<KaraokeProviderProps> = ({ children }) => {
  const {
    queue,
    currentSong,
    addToQueue,
    removeFromQueue,
    playNext
  } = useKaraokeQueue();

  const {
    availableSongs,
    isLoading,
    isUSBConnected,
    searchInput,
    setSearchInput,
    pendingSong,
    setPendingSong,
    searchSongByNumber
  } = useKaraokeSongs();

  const {
    playerState,
    setPlayerState,
    performance
  } = useKaraokePerformance(playNext);

  const skipSong = () => {
    if (currentSong) {
      setPlayerState('ended');
    } else {
      playNext();
    }
  };

  const confirmAndPlaySong = () => {
    if (pendingSong) {
      addToQueue(pendingSong);
      setPendingSong(null);
    }
  };

  const cancelPendingSong = () => {
    setPendingSong(null);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.keyCode === 39 || e.key === "ArrowRight") {
        skipSong();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSong, queue]);

  const contextValue: KaraokeContextData = {
    queue,
    currentSong,
    playerState,
    performance,
    searchInput,
    availableSongs,
    isLoading,
    isUSBConnected,
    pendingSong,
    addToQueue,
    removeFromQueue,
    skipSong,
    playNext,
    setSearchInput,
    searchSongByNumber,
    setPlayerState,
    confirmAndPlaySong,
    cancelPendingSong
  };

  return (
    <KaraokeContext.Provider value={contextValue}>
      {children}
    </KaraokeContext.Provider>
  );
};

export const useKaraoke = () => {
  const context = useContext(KaraokeContext);
  if (context === undefined) {
    throw new Error("useKaraoke deve ser usado dentro de um KaraokeProvider");
  }
  return context;
};
