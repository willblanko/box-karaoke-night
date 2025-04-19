
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
      
      // Only show performance rating if the song wasn't skipped
      if (!performance) {
        setPerformance(generateRandomPerformance());
      }
      
      // Always play the next song after a delay
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
  }, [playerState, playNext, processingEnded, setWasSkipped, performance]);

  return {
    playerState,
    setPlayerState,
    performance
  };
};
