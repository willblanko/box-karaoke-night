import { Filesystem, Directory } from '@capacitor/filesystem';
import { Song } from "./types";
import { getKaraokeFolderPath } from './tv-box-utils';
import { toast } from '@/components/ui/use-toast';
import { Capacitor } from '@capacitor/core';

// URL do arquivo no GitHub para uso no navegador
const GITHUB_MUSICAS_URL = 'https://raw.githubusercontent.com/willblanko/box-karaoke-night/main/public/musicas.txt';

// Flag para controlar exibição de toasts
let initialLoadComplete = false;

// Função para ler o arquivo musicas.txt e extrair os metadados
async function parseSongMetadata(content: string): Promise<Song[]> {
  const songs: Song[] = [];
  const blocks = content.split('***').filter(block => block.trim());
  
  for (const block of blocks) {
    const idMatch = block.match(/\[(\d+)\]/);
    const fileMatch = block.match(/Arquivo= (.+)/);
    const artistMatch = block.match(/Artista= (.+)/);
    const titleMatch = block.match(/Musica= (.+)/);
    
    if (idMatch && fileMatch && artistMatch && titleMatch) {
      const id = parseInt(idMatch[1]);
      const videoPath = fileMatch[1].trim();
      const artist = artistMatch[1].trim();
      const title = titleMatch[1].trim();
      
      songs.push({
        id,
        title,
        artist,
        duration: 0,
        videoPath: `${getKaraokeFolderPath()}/${videoPath}`
      });
    }
  }
  
  return songs;
}

// Função para carregar o arquivo musicas.txt
async function loadSongCatalogFile(): Promise<string> {
  console.log("Carregando catálogo de músicas...");

  try {
    if (Capacitor.isNativePlatform()) {
      // No Android, tenta carregar do diretório de assets
      try {
        const result = await Filesystem.readFile({
          path: 'public/assets/musicas.txt',
          directory: Directory.Assets
        });

        const content = typeof result.data === 'string' 
          ? result.data 
          : await new Blob([result.data as any]).text();

        console.log('Arquivo musicas.txt carregado com sucesso do APK');
        return content;
      } catch (e) {
        console.log('Erro ao carregar do caminho principal:', e);
        
        // Tenta outro caminho comum para arquivos no APK
        const result = await Filesystem.readFile({
          path: 'musicas.txt',
          directory: Directory.Assets
        });

        const content = typeof result.data === 'string' 
          ? result.data 
          : await new Blob([result.data as any]).text();

        console.log('Arquivo musicas.txt carregado com sucesso do APK (path alternativo)');
        return content;
      }
    } else {
      // No navegador, tenta carregar localmente primeiro
      try {
        const response = await fetch('/musicas.txt');
        if (response.ok) {
          const content = await response.text();
          console.log('Arquivo musicas.txt carregado com sucesso localmente');
          return content;
        }
        throw new Error('Arquivo local não disponível');
      } catch (localError) {
        console.log('Fallback para GitHub:', localError);
        
        // Fallback para GitHub se falhar localmente
        const response = await fetch(GITHUB_MUSICAS_URL);
        if (!response.ok) {
          throw new Error('Falha ao carregar arquivo do GitHub');
        }
        const content = await response.text();
        console.log('Arquivo musicas.txt carregado com sucesso do GitHub');
        return content;
      }
    }
  } catch (error) {
    console.error("Erro ao ler o catálogo de músicas:", error);
    throw new Error('Não foi possível carregar o arquivo musicas.txt');
  }
}

// Função para escanear músicas
export async function scanUSBForSongs(): Promise<Song[]> {
  try {
    const content = await loadSongCatalogFile();
    const songs = await parseSongMetadata(content);
    
    // Apenas mostra toast na primeira carga ou se houver erro
    if (!initialLoadComplete) {
      if (songs.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma música encontrada no catálogo.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: `${songs.length} músicas carregadas do catálogo.`
        });
        // Marca como concluído apenas se for bem-sucedido
        initialLoadComplete = true;
      }
    }
    
    return songs;
  } catch (error) {
    console.error("Erro ao carregar músicas:", error);
    // Sempre mostra erros, mesmo em cargas repetidas
    toast({
      title: "Erro",
      description: "Falha ao carregar o arquivo musicas.txt.",
      variant: "destructive"
    });
    throw error;
  }
}

// Função para obter o caminho do vídeo
export function getVideoPath(songId: number): string {
  return `${getKaraokeFolderPath()}/${songId}.mp4`;
}
