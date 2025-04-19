
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Song } from "./types";
import { Capacitor } from '@capacitor/core';
import { getKaraokeFolderPath } from './tv-box-utils';

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
        videoPath: `${getKaraokeFolderPath()}/${videoPath}` // Usa o caminho configurado
      });
    }
  }
  
  return songs;
}

// Função para carregar o arquivo musicas.txt de diferentes locais
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

    const karaokeFolder = getKaraokeFolderPath();
    console.log(`Buscando musicas.txt em: ${karaokeFolder}`);

    // Tentar múltiplos locais para o arquivo musicas.txt, começando pela pasta configurada
    const possibleLocations = [
      { directory: Directory.ExternalStorage, path: `${karaokeFolder}/musicas.txt` },
      { directory: Directory.ExternalStorage, path: 'musicas.txt' },
      { directory: Directory.ExternalStorage, path: 'karaoke/musicas.txt' },
      { directory: Directory.Documents, path: 'musicas.txt' },
      { directory: Directory.Data, path: 'musicas.txt' },
    ];

    for (const location of possibleLocations) {
      try {
        const result = await Filesystem.readFile({
          path: location.path,
          directory: location.directory
        });

        // Converter o resultado para string
        if (typeof result.data === 'string') {
          console.log(`Arquivo encontrado em: ${location.path}`);
          return result.data;
        } else {
          // Se for um Blob, converter para texto
          const text = await new Blob([result.data as any]).text();
          console.log(`Arquivo encontrado em: ${location.path}`);
          return text;
        }
      } catch (error) {
        // Continuar tentando outros locais se não encontrar
        console.log(`Não encontrado em: ${location.path}`);
      }
    }

    throw new Error("Arquivo musicas.txt não encontrado em nenhum local");
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
  const karaokeFolderPath = getKaraokeFolderPath();
  
  if (!Capacitor.isNativePlatform()) {
    return `${karaokeFolderPath}/${songId}.mp4`;
  }
  
  // Em produção, retornar o caminho real do arquivo no USB
  return `${karaokeFolderPath}/${songId}.mp4`;
}
