
import { useState, useEffect } from 'react';
import { PlayerState, Performance } from '@/lib/types';
import { generateRandomPerformance } from '@/lib/karaoke-utils';

export const useKaraokePerformance = (playNext: () => void) => {
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [processingEnded, setProcessingEnded] = useState(false);

  useEffect(() => {
    // Só geramos uma avaliação quando o estado muda para 'ended'
    // e não estamos já processando um fim de música
    if (playerState === 'ended' && !processingEnded) {
      setProcessingEnded(true);
      setPerformance(generateRandomPerformance());
      
      setTimeout(() => {
        playNext();
        setPerformance(null);
        setProcessingEnded(false);
      }, 3000);
    }
  }, [playerState, playNext, processingEnded]);

  return {
    playerState,
    setPlayerState,
    performance
  };
};
