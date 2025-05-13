
/**
 * Tipos utilizados no aplicativo de karaoke
 */

// Música para reprodução
export interface Song {
  id: number;        // Identificador único/número da música
  title: string;     // Título da música
  artist: string;    // Artista
  duration: number;  // Duração em segundos
  videoPath: string; // Caminho do vídeo no USB
  videoExists?: boolean; // Indica se o arquivo de vídeo existe
}

// Avaliação de desempenho após a música
export interface Performance {
  score: number;     // Pontuação de 0 a 100
  message: string;   // Mensagem de avaliação
}

// Estado do player de vídeo
export type PlayerState = "idle" | "playing" | "paused" | "loading" | "ended";
