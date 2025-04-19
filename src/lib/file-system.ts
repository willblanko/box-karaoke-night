
import { Filesystem, Directory, ReadFileResult } from '@capacitor/filesystem';
import { Song } from "./types";
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
        duration: 0, // Será preenchido quando o vídeo for carregado
        videoPath: `/usb/karaoke/${videoPath}`
      });
    }
  }
  
  return songs;
}

// Função para carregar o arquivo musicas.txt interno do aplicativo
async function loadSongCatalogFile(): Promise<string> {
  try {
    if (!Capacitor.isNativePlatform()) {
      // Em desenvolvimento web, retornar dados simulados
      return `
[1001]
Arquivo= 1001.mp4
Artista= paralamas do sucesso
Musica= a lhe esperar
***
[1002]
Arquivo= 1002.mp4
Artista= avioes do forro
Musica= agora chora e com banda calypso
***
[1003]
Arquivo= 1003.mp4
Artista= Raça Negra
Musica= Cheia de Manias
***
[1004]
Arquivo= 1004.mp4
Artista= Zezé Di Camargo & Luciano
Musica= É o Amor
***
[1005]
Arquivo= 1005.mp4
Artista= Djavan
Musica= Sina
***
[1123]
Arquivo= 1123.mp4
Artista= João Mineiro e Marciano
Musica= Ainda Ontem Chorei de Saudade
***
[1200]
Arquivo= 1200.mp4
Artista= Alceu Valença
Musica= Anunciação
***`;
    }

    // Em produção no Android, ler o arquivo musicas.txt do app
    const result = await Filesystem.readFile({
      path: 'public/musicas.txt',
      directory: Directory.Application
    });

    // Converter o resultado para string, já que pode ser string ou Blob
    if (typeof result.data === 'string') {
      return result.data;
    } else {
      // Se for um Blob, converter para texto
      return await new Blob([result.data as any]).text();
    }
  } catch (error) {
    console.error("Erro ao ler o catálogo de músicas:", error);
    throw error;
  }
}

// Função para escanear músicas usando o catálogo interno
export async function scanUSBForSongs(): Promise<Song[]> {
  console.log("Carregando catálogo de músicas...");
  
  try {
    const content = await loadSongCatalogFile();
    const songs = await parseSongMetadata(content);
    console.log(`Encontradas ${songs.length} músicas no catálogo`);
    return songs;
  } catch (error) {
    console.error("Erro ao escanear músicas:", error);
    throw error;
  }
}

// Função para obter o caminho do vídeo no USB
export function getVideoPath(songId: number): string {
  if (!Capacitor.isNativePlatform()) {
    return `/usb/karaoke/${songId}.mp4`;
  }
  
  // Em produção, retornar o caminho real do arquivo no USB
  return `content://com.android.externalstorage.documents/tree/primary%3Akaraoke/${songId}.mp4`;
}
