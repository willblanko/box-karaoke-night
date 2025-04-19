
import { useState, useEffect } from 'react';
import { PlayerState, Performance } from '@/lib/types';
import { generateRandomPerformance } from '@/lib/karaoke-utils';

export const useKaraokePerformance = (playNext: () => void, setWasSkipped: (value: boolean) => void) => {
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [processingEnded, setProcessingEnded] = useState(false);

  useEffect(() => {
    if (playerState === 'ended' && !processingEnded) {
      setProcessingEnded(true);
      setPerformance(generateRandomPerformance());
      
      setTimeout(() => {
        playNext();
        setPerformance(null);
        setProcessingEnded(false);
      }, 3000);
    }

    // Reset wasSkipped when starting to play
    if (playerState === 'playing') {
      setWasSkipped(false);
    }
  }, [playerState, playNext, processingEnded, setWasSkipped]);

  return {
    playerState,
    setPlayerState,
    performance
  };
};
