
import { useState, useEffect } from 'react';
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

  const loadSongsFromUSB = async () => {
    if (!isUSBConnected) {
      toast({
        title: "Erro",
        description: "USB não conectado. Conecte um dispositivo USB.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const songs = await scanUSBForSongs();
      setAvailableSongs(songs);
      
      if (songs.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma música encontrada. Verifique a pasta selecionada.",
        });
      } else {
        toast({
          title: "Sucesso",
          description: `${songs.length} músicas carregadas com sucesso.`,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar músicas do USB:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar o catálogo de músicas.",
        variant: "destructive"
      });
      setAvailableSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Monitorar alterações na pasta de karaoke
  useEffect(() => {
    const checkFolderChanges = () => {
      const currentPath = getKaraokeFolderPath();
      if (currentPath !== karaokeFolderPath) {
        setKaraokeFolderPath(currentPath);
        loadSongsFromUSB();
      }
    };
    
    // Verificar mudanças a cada 2 segundos
    const interval = setInterval(checkFolderChanges, 2000);
    
    return () => clearInterval(interval);
  }, [karaokeFolderPath]);

  useEffect(() => {
    // Store the cleanup function returned by listenForUSBConnection
    const unsubscribe = listenForUSBConnection((connected) => {
      setIsUSBConnected(connected);
      if (connected) {
        loadSongsFromUSB();
      } else {
        setAvailableSongs([]);
      }
    });

    // Return the cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const searchSongByNumber = (number: string): Song | undefined => {
    const songId = parseInt(number, 10);
    if (isNaN(songId)) return undefined;

    const song = availableSongs.find(s => s.id === songId);
    if (song) {
      setPendingSong(song);
      setSearchInput('');
      return song;
    } else {
      toast({
        title: "Música não encontrada",
        description: `Música com número ${songId} não está disponível.`,
        variant: "destructive"
      });
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
    loadSongsFromUSB, // Expor esta função para permitir recargas manuais
    karaokeFolderPath
  };
};
