
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
    try {
      setIsLoading(true);
      const songs = await scanUSBForSongs();
      setAvailableSongs(songs);
      setIsUSBConnected(true);
    } catch (error) {
      console.error("Erro ao carregar músicas do USB:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    listenForUSBConnection(() => {
      loadSongsFromUSB();
    });
    
    loadSongsFromUSB();
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
