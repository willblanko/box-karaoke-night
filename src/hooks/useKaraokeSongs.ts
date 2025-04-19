
import { useState, useEffect } from 'react';
import { Song } from '@/lib/types';
import { scanUSBForSongs } from '@/lib/file-system';
import { listenForUSBConnection } from '@/lib/tv-box-utils';

export const useKaraokeSongs = () => {
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUSBConnected, setIsUSBConnected] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [pendingSong, setPendingSong] = useState<Song | null>(null);

  const loadSongsFromUSB = async () => {
    if (!isUSBConnected) return;
    
    try {
      setIsLoading(true);
      const songs = await scanUSBForSongs();
      setAvailableSongs(songs);
    } catch (error) {
      console.error("Erro ao carregar músicas do USB:", error);
      setAvailableSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cleanup = listenForUSBConnection((connected) => {
      setIsUSBConnected(connected);
      if (connected) {
        loadSongsFromUSB();
      } else {
        setAvailableSongs([]);
      }
    });

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  const searchSongByNumber = (number: string): Song | undefined => {
    const songId = parseInt(number, 10);
    if (isNaN(songId)) return undefined;

    const song = availableSongs.find(s => s.id === songId);
    if (song) {
      setPendingSong(song);
      setSearchInput('');
      return song;
    }
    return undefined;
  };

  return {
    availableSongs,
    isLoading,
    isUSBConnected,
    searchInput,
    setSearchInput,
    pendingSong,
    setPendingSong,
    searchSongByNumber
  };
};
