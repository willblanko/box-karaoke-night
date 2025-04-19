
import { useState, useEffect } from 'react';
import { PlayerState, Performance } from '@/lib/types';
import { generateRandomPerformance } from '@/lib/karaoke-utils';

export const useKaraokePerformance = (playNext: () => void) => {
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [performance, setPerformance] = useState<Performance | null>(null);

  useEffect(() => {
    if (playerState === 'ended') {
      setPerformance(generateRandomPerformance());
      
      setTimeout(() => {
        playNext();
        setPerformance(null);
      }, 3000);
    }
  }, [playerState, playNext]);

  return {
    playerState,
    setPlayerState,
    performance
  };
};
