
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Song } from "./types";
import { Capacitor } from '@capacitor/core';
import { getKaraokeFolderPath } from './tv-box-utils';
import { toast } from '@/components/ui/use-toast';

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
  console.log("Tentando carregar catálogo de músicas...");

  try {
    // Lista de possíveis locais do arquivo musicas.txt, em ordem de prioridade
    const possibleLocations = [
      { directory: Directory.ExternalStorage, path: 'assets/musicas.txt' },
      { directory: Directory.ExternalStorage, path: 'assets/flutter_assets/assets/musicas.txt' },
      { directory: Directory.Data, path: 'assets/musicas.txt' },
      { directory: Directory.Documents, path: 'assets/musicas.txt' },
      { directory: Directory.ExternalStorage, path: `${getKaraokeFolderPath()}/musicas.txt` },
    ];

    for (const location of possibleLocations) {
      try {
        console.log(`Tentando ler arquivo em: ${location.directory}/${location.path}`);
        const result = await Filesystem.readFile({
          path: location.path,
          directory: location.directory
        });

        const content = typeof result.data === 'string' 
          ? result.data 
          : await new Blob([result.data as any]).text();

        console.log(`Arquivo musicas.txt encontrado em: ${location.path}`);
        return content;
      } catch (error) {
        console.log(`Não encontrado em: ${location.path}, tentando próximo local...`);
      }
    }

    throw new Error('Arquivo musicas.txt não encontrado em nenhum local');
  } catch (error) {
    console.error("Erro ao ler o catálogo de músicas:", error);
    throw error;
  }
}

// Função para escanear músicas
export async function scanUSBForSongs(): Promise<Song[]> {
  console.log("Carregando catálogo de músicas...");
  
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
    console.error("Erro ao escanear músicas:", error);
    toast({
      title: "Erro",
      description: "Falha ao carregar o arquivo musicas.txt. Verifique se o arquivo existe no local correto.",
      variant: "destructive"
    });
    throw error;
  }
}

// Função para obter o caminho do vídeo
export function getVideoPath(songId: number): string {
  return `${getKaraokeFolderPath()}/${songId}.mp4`;
}
