
import { useState, useEffect, useRef } from 'react';
import { Song } from '@/lib/types';
import { scanUSBForSongs } from '@/lib/file-system';
import { listenForUSBConnection, getKaraokeFolderPath } from '@/lib/tv-box-utils';
import { useToast } from "@/components/ui/use-toast";

export const useKaraokeSongs = () => {
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUSBConnected, setIsUSBConnected] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [pendingSong, setPendingSong] = useState<Song | null>(null);
  const [karaokeFolderPath, setKaraokeFolderPath] = useState(getKaraokeFolderPath());
  const { toast } = useToast();
  const errorShown = useRef(false);
  const initialLoadDone = useRef(false);
  const searchInProgress = useRef(false);

  const loadSongsFromUSB = async () => {
    // Evita múltiplos carregamentos simultâneos
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const songs = await scanUSBForSongs();
      setAvailableSongs(songs);
      
      if (songs.length === 0 && !initialLoadDone.current) {
        toast({
          title: "Aviso",
          description: "Nenhuma música encontrada. Verifique a pasta selecionada.",
        });
      } else if (!initialLoadDone.current) {
        // Só mostra esta mensagem uma vez na inicialização
        initialLoadDone.current = true;
      }
      
      // Reset error flag if we successfully loaded songs
      errorShown.current = false;
    } catch (error) {
      console.error("Erro ao carregar músicas:", error);
      if (!errorShown.current) {
        toast({
          title: "Erro",
          description: "Falha ao carregar o catálogo de músicas.",
          variant: "destructive"
        });
        errorShown.current = true;
      }
      setAvailableSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Monitorar alterações na pasta de karaoke com menos frequência
  useEffect(() => {
    const checkFolderChanges = () => {
      const currentPath = getKaraokeFolderPath();
      if (currentPath !== karaokeFolderPath) {
        setKaraokeFolderPath(currentPath);
        loadSongsFromUSB();
      }
    };
    
    // Verificar mudanças a cada 10 segundos ao invés de 2
    const interval = setInterval(checkFolderChanges, 10000);
    
    return () => clearInterval(interval);
  }, [karaokeFolderPath]);

  useEffect(() => {
    // Load songs on mount only once
    if (!initialLoadDone.current) {
      loadSongsFromUSB();
    }
    
    // Add USB connection listener with less aggressive notifications
    const unsubscribe = listenForUSBConnection((connected) => {
      const wasConnected = isUSBConnected;
      setIsUSBConnected(connected);
      
      // Only reload songs if connection state changed from disconnected to connected
      if (connected && !wasConnected) {
        loadSongsFromUSB();
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const searchSongByNumber = (number: string): Song | undefined => {
    // Evitar múltiplas buscas simultâneas
    if (searchInProgress.current) return undefined;
    
    searchInProgress.current = true;
    
    try {
      const songId = parseInt(number, 10);
      if (isNaN(songId)) return undefined;

      console.log(`Buscando música #${songId} no catálogo de ${availableSongs.length} músicas`);
      
      const song = availableSongs.find(s => s.id === songId);
      if (song) {
        console.log(`Música encontrada: "${song.title}" por ${song.artist}`);
        setPendingSong(song);
        return song;
      } else {
        console.log(`Música #${songId} não encontrada no catálogo`);
        toast({
          title: "Música não encontrada",
          description: `Música com número ${songId} não está disponível.`,
          variant: "destructive"
        });
      }
    } finally {
      // Garantir que o flag é sempre resetado
      setTimeout(() => {
        searchInProgress.current = false;
      }, 500);
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
    searchSongByNumber,
    loadSongsFromUSB,
    karaokeFolderPath
  };
};
