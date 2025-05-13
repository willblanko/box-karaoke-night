
import { useState, useEffect, useRef } from 'react';
import { Song } from '@/lib/types';
import { scanUSBForSongs } from '@/lib/file-system';
import { listenForUSBConnection, getKaraokeFolderPath } from '@/lib/tv-box-utils';
import { useToast } from "@/components/ui/use-toast";
import { useStoragePermissionContext } from '@/context/StoragePermissionContext';

export const useKaraokeSongs = () => {
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUSBConnected, setIsUSBConnected] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [pendingSong, setPendingSong] = useState<Song | null>(null);
  const [karaokeFolderPath, setKaraokeFolderPath] = useState(getKaraokeFolderPath());
  const { toast } = useToast();
  const { hasStoragePermission } = useStoragePermissionContext();
  const errorShown = useRef(false);
  const initialLoadDone = useRef(false);
  const searchInProgress = useRef(false);

  const loadSongsFromUSB = async () => {
    // Evita múltiplos carregamentos simultâneos
    if (isLoading) return;
    
    // Verifica se temos permissão
    if (!hasStoragePermission) {
      toast({
        title: "Permissão necessária",
        description: "É necessário permitir o acesso ao armazenamento para carregar músicas",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      // Atualizar o caminho da pasta antes de carregar
      const updatedPath = getKaraokeFolderPath();
      setKaraokeFolderPath(updatedPath);
      
      console.log(`Carregando músicas da pasta: ${updatedPath}`);
      const songs = await scanUSBForSongs();
      
      // Atualiza os caminhos dos vídeos em cada música para o caminho atual
      const updatedSongs = songs.map(song => ({
        ...song,
        videoPath: `${updatedPath}/${song.id}.mp4`
      }));
      
      setAvailableSongs(updatedSongs);
      
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

  // Monitorar alterações na pasta de karaoke
  useEffect(() => {
    const checkFolderChanges = () => {
      const currentPath = getKaraokeFolderPath();
      if (currentPath !== karaokeFolderPath) {
        console.log(`Pasta de karaoke alterada: ${currentPath}`);
        setKaraokeFolderPath(currentPath);
        loadSongsFromUSB();
      }
    };
    
    // Verificar mudanças a cada 5 segundos
    const interval = setInterval(checkFolderChanges, 5000);
    
    return () => clearInterval(interval);
  }, [karaokeFolderPath]);

  // Carregar músicas quando tivermos permissão
  useEffect(() => {
    if (hasStoragePermission && !initialLoadDone.current) {
      loadSongsFromUSB();
    }
  }, [hasStoragePermission]);

  useEffect(() => {
    // Add USB connection listener
    const unsubscribe = listenForUSBConnection((connected) => {
      const wasConnected = isUSBConnected;
      setIsUSBConnected(connected);
      
      // Only reload songs if connection state changed from disconnected to connected
      if (connected && !wasConnected && hasStoragePermission) {
        console.log("USB conectado, recarregando músicas");
        toast({
          title: "USB Conectado",
          description: "Dispositivo de armazenamento detectado"
        });
        loadSongsFromUSB();
      } else if (!connected && wasConnected) {
        toast({
          title: "USB Desconectado",
          description: "Dispositivo de armazenamento removido"
        });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [hasStoragePermission]);

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
        
        // Atualiza o caminho do vídeo para usar a pasta atual
        const songWithUpdatedPath = {
          ...song,
          videoPath: `${karaokeFolderPath}/${song.id}.mp4`
        };
        
        setPendingSong(songWithUpdatedPath);
        return songWithUpdatedPath;
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
