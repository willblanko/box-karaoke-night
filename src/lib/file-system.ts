import { Filesystem, Directory } from '@capacitor/filesystem';
import { Song } from "./types";
import { getKaraokeFolderPath } from './tv-box-utils';
import { toast } from '@/components/ui/use-toast';
import { Capacitor } from '@capacitor/core';

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

// Função para carregar o arquivo musicas.txt do diretório assets
async function loadSongCatalogFile(): Promise<string> {
  console.log("Carregando catálogo de músicas...");

  try {
    if (Capacitor.isNativePlatform()) {
      // No Android, carrega do diretório assets
      const result = await Filesystem.readFile({
        path: 'public/musicas.txt',
        directory: Directory.ExternalStorage
      });

      const content = typeof result.data === 'string' 
        ? result.data 
        : await new Blob([result.data as any]).text();

      console.log('Arquivo musicas.txt carregado com sucesso do Android');
      return content;
    } else {
      // No navegador, carrega da URL do GitHub
      const response = await fetch('https://raw.githubusercontent.com/willblanko/box-karaoke-night/refs/heads/main/src/components/musicas.txt?token=GHSAT0AAAAAADCHXYT2ITQQG6MDM2PWRIZG2ADGYWQ');
      if (!response.ok) {
        throw new Error('Falha ao carregar arquivo do GitHub');
      }
      const content = await response.text();
      console.log('Arquivo musicas.txt carregado com sucesso do GitHub');
      return content;
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
    }
    
    return songs;
  } catch (error) {
    console.error("Erro ao carregar músicas:", error);
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
