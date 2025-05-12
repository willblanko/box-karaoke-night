import { useState } from 'react';
import { Song } from '@/lib/types';

export const useKaraokeQueue = () => {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const addToQueue = (song: Song) => {
    // If no song is currently playing, set it as current song and start playing
    if (!currentSong) {
      setCurrentSong(song);
      return true; // Indicates song started playing
    } else {
      // Otherwise add to queue
      setQueue(prev => [...prev, song]);
      return false; // Indicates song was only added to queue
    }
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
    setQueue,
    currentSong,
    setCurrentSong,
    addToQueue,
    removeFromQueue,
    playNext
  };
};
