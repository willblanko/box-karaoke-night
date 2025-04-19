
import React, { createContext, useContext, useEffect, useRef } from "react";
import { KaraokeContextData } from "./types";
import { useKaraokeQueue } from "@/hooks/useKaraokeQueue";
import { useKaraokeSongs } from "@/hooks/useKaraokeSongs";
import { useKaraokePerformance } from "@/hooks/useKaraokePerformance";
import { Song } from "@/lib/types";

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
    playNext: playNextFromQueue,
    setCurrentSong,
    setQueue
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

  const [previousSongs, setPreviousSongs] = React.useState<Song[]>([]);
  const [wasSkipped, setWasSkipped] = React.useState(false);

  const effectRan = useRef(false);
  const skipInProgress = useRef(false);

  const playNext = () => {
    if (currentSong) {
      setPreviousSongs(prev => [...prev, currentSong]);
    }
    
    if (queue.length > 0) {
      const nextSong = queue[0];
      setCurrentSong(nextSong);
      setQueue(prev => prev.filter((_, i) => i !== 0));
      return true;
    } else {
      setCurrentSong(null);
      return false;
    }
  };

  const {
    playerState,
    setPlayerState,
    performance
  } = useKaraokePerformance(playNext, setWasSkipped);
  
  const playPrevious = () => {
    if (previousSongs.length > 0) {
      const lastSong = previousSongs[previousSongs.length - 1];
      if (currentSong) {
        setQueue(prev => [currentSong, ...prev]);
      }
      setCurrentSong(lastSong);
      setPreviousSongs(prev => prev.slice(0, -1));
    }
  };

  const skipSong = () => {
    if (skipInProgress.current) return;

    if (currentSong) {
      skipInProgress.current = true;
      console.log("Pulando música atual");
      
      setWasSkipped(true);
      setPlayerState('ended');
      
      setTimeout(() => {
        skipInProgress.current = false;
      }, 3500);
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
    karaokeFolderPath,
    previousSongs,
    wasSkipped,
    
    addToQueue,
    removeFromQueue,
    skipSong,
    playNext,
    playPrevious,
    setSearchInput,
    searchSongByNumber,
    setPlayerState,
    confirmAndPlaySong,
    cancelPendingSong,
    loadSongsFromUSB,
    setWasSkipped
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
