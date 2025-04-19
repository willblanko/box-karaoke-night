
/**
 * Utilitário para interação com o sistema de arquivos
 * Nota: Este é um exemplo mock. Para uso real com USB em um TV Box Android,
 * seria necessário usar APIs nativas do Android através do Capacitor ou outra
 * biblioteca de bridge para acessar o sistema de arquivos do dispositivo.
 */

import { Song } from "./types";

// Esta função, na implementação real, escanearia o drive USB
// e encontraria todos os vídeos de karaoke disponíveis
export async function scanUSBForSongs(): Promise<Song[]> {
  // Esta é apenas uma implementação mock
  console.log("Escaneando USB por músicas...");
  
  // Em um app real, seria necessário:
  // 1. Detectar drives USB conectados
  // 2. Procurar arquivos de vídeo (.mp4, .avi, etc)
  // 3. Extrair metadados (título, artista, duração) dos nomes de arquivo ou de arquivos de índice
  // 4. Retornar a lista completa
  
  // Simular uma demora no escaneamento
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Retornar uma lista mock
  return [
    { id: 1, title: "Evidências", artist: "Chitãozinho & Xororó", duration: 240, videoPath: "/usb/1.mp4" },
    { id: 2, title: "Garçom", artist: "Reginaldo Rossi", duration: 195, videoPath: "/usb/2.mp4" },
    { id: 3, title: "Cheia de Manias", artist: "Raça Negra", duration: 228, videoPath: "/usb/3.mp4" },
    { id: 4, title: "É o Amor", artist: "Zezé Di Camargo & Luciano", duration: 210, videoPath: "/usb/4.mp4" },
    { id: 5, title: "Sina", artist: "Djavan", duration: 258, videoPath: "/usb/5.mp4" },
    { id: 123, title: "Ainda Ontem Chorei de Saudade", artist: "João Mineiro e Marciano", duration: 189, videoPath: "/usb/123.mp4" },
    { id: 200, title: "Anunciação", artist: "Alceu Valença", duration: 243, videoPath: "/usb/200.mp4" },
    // Em uma implementação real, centenas ou milhares de músicas seriam encontradas
  ];
}

// Esta função seria responsável por ler o vídeo do USB
export function getVideoPath(songId: number): string {
  // Em uma implementação real, seria necessário:
  // 1. Construir o caminho correto para o arquivo no USB
  // 2. Verificar se o arquivo existe
  // 3. Retornar o caminho completo para o player de vídeo
  
  return `/usb/${songId}.mp4`;
}

/**
 * Para uma implementação real em um TV Box Android, você provavelmente precisaria:
 * 
 * 1. Usar Capacitor ou outra biblioteca para acessar APIs nativas do Android
 * 2. Solicitar permissões de leitura do armazenamento externo
 * 3. Implementar um leitor de diretório para listar arquivos do USB
 * 4. Implementar um parser para extrair informações relevantes dos arquivos
 * 5. Montar uma base de dados local ou usar um arquivo de índice para mapear números às músicas
 */
