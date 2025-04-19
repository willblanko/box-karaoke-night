
/**
 * Utilitário para interação com o sistema de arquivos
 * Nota: Este é um exemplo mock. Para uso real com USB em um TV Box Android,
 * seria necessário usar APIs nativas do Android através do Capacitor ou outra
 * biblioteca de bridge para acessar o sistema de arquivos do dispositivo.
 */

import { Song } from "./types";

// Função para escanear a pasta "karaoke" do USB
export async function scanUSBForSongs(): Promise<Song[]> {
  console.log("Escaneando pasta karaoke do USB por músicas...");
  
  // Em um app real Android, seria necessário:
  // 1. Usar Android Storage Access Framework para acessar o USB
  // 2. Localizar a pasta "karaoke" no USB
  // 3. Listar todos os arquivos .mp4 dentro da pasta
  // 4. Extrair informações do nome do arquivo ou metadados
  
  // Exemplo de como seria em código Android real (pseudocódigo):
  /*
  val usbPath = getUSBMountPath()
  val karaokePath = "$usbPath/karaoke"
  val videoFiles = File(karaokePath).listFiles { file ->
    file.extension.toLowerCase() == "mp4"
  }
  
  return videoFiles.map { file ->
    val id = file.nameWithoutExtension.toIntOrNull() ?: 0
    val metadata = extractMetadataFromFile(file)
    Song(
      id = id,
      title = metadata.title ?: "Música $id",
      artist = metadata.artist ?: "Artista Desconhecido",
      duration = metadata.duration ?: 0,
      videoPath = file.absolutePath
    )
  }
  */
  
  // Simular uma pequena demora no escaneamento
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Retornar uma lista mock para desenvolvimento
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

// Função para obter o caminho do vídeo considerando a pasta karaoke
export function getVideoPath(songId: number): string {
  // Em uma implementação real, seria necessário:
  // 1. Obter o caminho base do USB
  // 2. Adicionar a pasta "karaoke"
  // 3. Construir o caminho completo para o arquivo de vídeo
  // 4. Verificar se o arquivo existe
  
  return `/usb/karaoke/${songId}.mp4`;
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

