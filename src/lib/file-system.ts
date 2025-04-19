/**
 * Utilitário para interação com o sistema de arquivos
 * Nota: Este é um exemplo mock. Para uso real com USB em um TV Box Android,
 * seria necessário usar APIs nativas do Android através do Capacitor ou outra
 * biblioteca de bridge para acessar o sistema de arquivos do dispositivo.
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Song } from "./types";

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
    if (!window.Capacitor) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return [
        { id: 1, title: "Evidências", artist: "Chitãozinho & Xororó", duration: 240, videoPath: "/usb/karaoke/1.mp4" },
        { id: 2, title: "Garçom", artist: "Reginaldo Rossi", duration: 195, videoPath: "/usb/karaoke/2.mp4" },
        { id: 3, title: "Cheia de Manias", artist: "Raça Negra", duration: 228, videoPath: "/usb/karaoke/3.mp4" },
        { id: 4, title: "É o Amor", artist: "Zezé Di Camargo & Luciano", duration: 210, videoPath: "/usb/karaoke/4.mp4" },
        { id: 5, title: "Sina", artist: "Djavan", duration: 258, videoPath: "/usb/karaoke/5.mp4" },
        { id: 123, title: "Ainda Ontem Chorei de Saudade", artist: "João Mineiro e Marciano", duration: 189, videoPath: "/usb/karaoke/123.mp4" },
        { id: 200, title: "Anunciação", artist: "Alceu Valença", duration: 243, videoPath: "/usb/karaoke/200.mp4" },
      ];
    }

    // Em produção no Android, ler o arquivo musicas.txt
    const result = await Filesystem.readFile({
      path: 'musicas.txt',
      directory: Directory.ExternalStorage
    });

    const songs = await parseSongMetadata(result.data);
    console.log(`Encontradas ${songs.length} músicas no banco de dados`);
    return songs;
    
  } catch (error) {
    console.error("Erro ao escanear músicas:", error);
    throw error;
  }
}

// Função para obter o caminho do vídeo no USB
export function getVideoPath(songId: number): string {
  if (!window.Capacitor) {
    return `/usb/karaoke/${songId}.mp4`;
  }
  
  // Em produção, retornar o caminho real do arquivo no USB
  return `content://com.android.externalstorage.documents/tree/primary%3Akaraoke/${songId}.mp4`;
}

/**
 * Implementação real para Android TV Box:
 * 
 * 1. Usar Storage Access Framework do Android para acessar USB:
 *    - ACTION_OPEN_DOCUMENT_TREE para selecionar pasta
 *    - Salvar URI de acesso para uso futuro
 * 
 * 2. Para escanear músicas:
 *    - Usar MediaStore API ou ExoPlayer para extrair metadados
 *    - Verificar se arquivo é um vídeo válido
 *    - Extrair duração e outras informações
 * 
 * 3. Para armazenamento local das informações:
 *    - Usar Room Database ou SQLite para guardar:
 *      - ID da música (número)
 *      - Título extraído do nome do arquivo
 *      - Artista (se disponível no nome)
 *      - Caminho do arquivo no USB
 *      - Duração do vídeo
 * 
 * 4. Exemplo de estrutura da tabela:
 *    CREATE TABLE songs (
 *      id INTEGER PRIMARY KEY,
 *      title TEXT NOT NULL,
 *      artist TEXT,
 *      duration INTEGER NOT NULL,
 *      video_path TEXT NOT NULL
 *    )
 */
