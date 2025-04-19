
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Song, PlayerState, Performance } from "@/lib/types";
import { generateRandomPerformance } from "@/lib/karaoke-utils";
import { scanUSBForSongs } from "@/lib/file-system";
import { listenForUSBConnection } from "@/lib/tv-box-utils";

// Dados que serão compartilhados pelo contexto
interface KaraokeContextData {
  queue: Song[];               // Fila de músicas
  currentSong: Song | null;    // Música atual
  playerState: PlayerState;    // Estado do player
  performance: Performance | null; // Avaliação da última música
  searchInput: string;         // Input de busca de música
  availableSongs: Song[];      // Músicas disponíveis (do USB)
  isLoading: boolean;          // Indica se está carregando músicas
  isUSBConnected: boolean;     // Indica se o USB está conectado
  
  // Ações
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  skipSong: () => void;
  playNext: () => void;
  setSearchInput: (input: string) => void;
  searchSongByNumber: (number: string) => void;
  setPlayerState: (state: PlayerState) => void;
}

// Criando o contexto
const KaraokeContext = createContext<KaraokeContextData | undefined>(undefined);

// Mock de músicas para teste (seria substituído pela leitura real do USB)
const mockSongs: Song[] = [
  { id: 1, title: "Evidências", artist: "Chitãozinho & Xororó", duration: 240, videoPath: "/usb/1.mp4" },
  { id: 2, title: "Garçom", artist: "Reginaldo Rossi", duration: 195, videoPath: "/usb/2.mp4" },
  { id: 3, title: "Cheia de Manias", artist: "Raça Negra", duration: 228, videoPath: "/usb/3.mp4" },
  { id: 4, title: "É o Amor", artist: "Zezé Di Camargo & Luciano", duration: 210, videoPath: "/usb/4.mp4" },
  { id: 5, title: "Sina", artist: "Djavan", duration: 258, videoPath: "/usb/5.mp4" },
  { id: 123, title: "Ainda Ontem Chorei de Saudade", artist: "João Mineiro e Marciano", duration: 189, videoPath: "/usb/123.mp4" },
  { id: 200, title: "Anunciação", artist: "Alceu Valença", duration: 243, videoPath: "/usb/200.mp4" },
  // Na implementação real, seriam carregadas do USB
];

interface KaraokeProviderProps {
  children: ReactNode;
}

export const KaraokeProvider: React.FC<KaraokeProviderProps> = ({ children }) => {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [availableSongs, setAvailableSongs] = useState<Song[]>(mockSongs);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUSBConnected, setIsUSBConnected] = useState<boolean>(false);
  
  // Função para carregar músicas do USB
  const loadSongsFromUSB = async () => {
    try {
      setIsLoading(true);
      const songs = await scanUSBForSongs();
      setAvailableSongs(songs);
      setIsUSBConnected(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao carregar músicas do USB:", error);
      setIsLoading(false);
    }
  };
  
  // Monitorar conexão USB
  useEffect(() => {
    // Em um app Android real, isso usaria APIs nativas para detectar USB
    listenForUSBConnection(() => {
      loadSongsFromUSB();
    });
    
    // Carregar músicas iniciais (mock para demonstração)
    loadSongsFromUSB();
  }, []);

  // Adicionar música à fila
  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
    
    // Se não tiver música tocando, inicia a reprodução desta música
    if (playerState === "idle" && currentSong === null) {
      setCurrentSong(song);
      setQueue(prev => prev.filter((_, i) => i !== 0));
      setPlayerState("playing");
    }
  };

  // Remover música da fila
  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Pular para próxima música
  const skipSong = () => {
    // Mostrar avaliação antes de pular
    if (currentSong) {
      setPerformance(generateRandomPerformance());
      
      // Após exibir a avaliação, reproduzir a próxima música
      setTimeout(() => {
        playNext();
        setPerformance(null);
      }, 3000);
    } else {
      playNext();
    }
  };

  // Reproduzir próxima música da fila
  const playNext = () => {
    if (queue.length > 0) {
      // Pegar a primeira música da fila
      const nextSong = queue[0];
      setCurrentSong(nextSong);
      
      // Remover a música da fila
      setQueue(prev => prev.filter((_, i) => i !== 0));
      setPlayerState("playing");
    } else {
      // Não há mais músicas na fila
      setCurrentSong(null);
      setPlayerState("idle");
    }
  };

  // Buscar música por número
  const searchSongByNumber = (number: string) => {
    const songId = parseInt(number, 10);
    if (isNaN(songId)) return;

    const song = availableSongs.find(s => s.id === songId);
    if (song) {
      addToQueue(song);
      setSearchInput("");
    }
  };

  // Detectar quando uma música termina para mostrar avaliação e reproduzir a próxima
  useEffect(() => {
    if (playerState === "ended" && currentSong) {
      setPerformance(generateRandomPerformance());
      
      // Após exibir a avaliação, reproduzir a próxima música
      setTimeout(() => {
        playNext();
        setPerformance(null);
      }, 3000);
    }
  }, [playerState]);

  // Para detectar teclas de controle remoto (como avançar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Seta para direita/avançar (código 39 é a seta direita)
      if (e.keyCode === 39 || e.key === "ArrowRight") {
        skipSong();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSong, queue]);

  const contextValue = {
    queue,
    currentSong,
    playerState,
    performance,
    searchInput,
    availableSongs,
    isLoading,
    isUSBConnected,
    addToQueue,
    removeFromQueue,
    skipSong,
    playNext,
    setSearchInput,
    searchSongByNumber,
    setPlayerState
  };

  return (
    <KaraokeContext.Provider value={contextValue}>
      {children}
    </KaraokeContext.Provider>
  );
};

// Hook para usar o contexto
export const useKaraoke = () => {
  const context = useContext(KaraokeContext);
  if (context === undefined) {
    throw new Error("useKaraoke deve ser usado dentro de um KaraokeProvider");
  }
  return context;
};
