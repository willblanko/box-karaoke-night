
import React, { createContext, useContext, useEffect, useRef } from "react";
import { KaraokeContextData } from "./types";
import { useKaraokeQueue } from "@/hooks/useKaraokeQueue";
import { useKaraokeSongs } from "@/hooks/useKaraokeSongs";
import { useKaraokePerformance } from "@/hooks/useKaraokePerformance";

const KaraokeContext = createContext<KaraokeContextData | undefined>(undefined);

interface KaraokeProviderProps {
  children: React.ReactNode;
}

export const KaraokeProvider: React.FC<KaraokeProviderProps> = ({ children }) => {
  // Fix the hook order issue by ensuring all hooks are called in the same order
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
    searchSongByNumber,
    loadSongsFromUSB,
    karaokeFolderPath
  } = useKaraokeSongs();

  const {
    playerState,
    setPlayerState,
    performance
  } = useKaraokePerformance(playNext);

  // Make sure any useRef hooks are called before useEffect
  const effectRan = useRef(false);

  const skipSong = () => {
    if (currentSong) {
      setPlayerState('ended');
    } else {
      playNext();
    }
  };

  const confirmAndPlaySong = () => {
    if (pendingSong) {
      const startedPlaying = addToQueue(pendingSong);
      
      if (startedPlaying) {
        console.log(`Iniciando música: ${pendingSong.title}`);
        setPlayerState('playing');
      } else {
        console.log(`Música adicionada à fila: ${pendingSong.title}`);
      }
      
      setPendingSong(null);
      setSearchInput(''); // Limpa o input apenas quando confirma
    }
  };

  const cancelPendingSong = () => {
    console.log('Cancelando seleção de música');
    setPendingSong(null);
    setSearchInput(''); // Limpa o input quando cancela
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
    cancelPendingSong,
    loadSongsFromUSB,
    karaokeFolderPath
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
