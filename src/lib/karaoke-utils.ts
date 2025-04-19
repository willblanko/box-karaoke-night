
import { Performance, Song } from "./types";

/**
 * Utilidades para o aplicativo de karaoke
 */

// Gera uma avaliação aleatória de desempenho
export function generateRandomPerformance(): Performance {
  const score = Math.floor(Math.random() * 101); // 0-100
  
  let message = "";
  if (score >= 90) {
    message = "Você arrasou! Talento de estrela!";
  } else if (score >= 80) {
    message = "Impressionante! Muito bom!";
  } else if (score >= 70) {
    message = "Muito bom! Você tem potencial!";
  } else if (score >= 60) {
    message = "Está no caminho certo, continue se esforçando!";
  } else if (score >= 50) {
    message = "Não desista, a prática leva à perfeição!";
  } else if (score >= 30) {
    message = "Continue praticando, você vai melhorar!";
  } else {
    message = "O importante é se divertir!";
  }
  
  return { score, message };
}

// Mock de busca de música por ID - seria substituído pela lógica real de busca no USB
export function findSongById(id: number, availableSongs: Song[]): Song | undefined {
  return availableSongs.find(song => song.id === id);
}

// Formata segundos para formato MM:SS
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Formata tempo para exibição no player (MM:SS / MM:SS)
export function formatTimeDisplay(currentTime: number, totalTime: number): string {
  return `${formatDuration(currentTime)} / ${formatDuration(totalTime)}`;
}
