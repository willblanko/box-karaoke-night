
import { Filesystem, Directory } from '@capacitor/filesystem';
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

// Função para escanear a pasta "karaoke" do USB
export async function scanUSBForSongs(): Promise<Song[]> {
  console.log("Escaneando pasta karaoke do USB por músicas...");
  
  try {
    // Em desenvolvimento web, usar dados mock
    if (!Capacitor.isNativePlatform()) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return [
        { id: 1001, title: "Evidências", artist: "Chitãozinho & Xororó", duration: 240, videoPath: "/usb/karaoke/1001.mp4" },
        { id: 1002, title: "Garçom", artist: "Reginaldo Rossi", duration: 195, videoPath: "/usb/karaoke/1002.mp4" },
        { id: 1003, title: "Cheia de Manias", artist: "Raça Negra", duration: 228, videoPath: "/usb/karaoke/1003.mp4" },
        { id: 1004, title: "É o Amor", artist: "Zezé Di Camargo & Luciano", duration: 210, videoPath: "/usb/karaoke/1004.mp4" },
        { id: 1005, title: "Sina", artist: "Djavan", duration: 258, videoPath: "/usb/karaoke/1005.mp4" },
        { id: 1123, title: "Ainda Ontem Chorei de Saudade", artist: "João Mineiro e Marciano", duration: 189, videoPath: "/usb/karaoke/1123.mp4" },
        { id: 1200, title: "Anunciação", artist: "Alceu Valença", duration: 243, videoPath: "/usb/karaoke/1200.mp4" },
      ];
    }

    // Em produção no Android, ler o arquivo musicas.txt
    const result = await Filesystem.readFile({
      path: 'musicas.txt',
      directory: Directory.ExternalStorage
    });

    // Converter o resultado para string, já que pode ser string ou Blob
    const content = typeof result.data === 'string' 
      ? result.data 
      : await new Blob([result.data]).text();
      
    const songs = await parseSongMetadata(content);
    console.log(`Encontradas ${songs.length} músicas no banco de dados`);
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
