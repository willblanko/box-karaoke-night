
import { useState } from 'react';
import { Song } from '@/lib/types';

export const useKaraokeQueue = () => {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
    
    if (!currentSong) {
      setCurrentSong(song);
      setQueue(prev => prev.filter((_, i) => i !== 0));
      return true; // Indicates song started playing
    }
    return false; // Indicates song was only added to queue
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const playNext = () => {
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

  return {
    queue,
    currentSong,
    setCurrentSong,
    addToQueue,
    removeFromQueue,
    playNext
  };
};
