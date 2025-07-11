
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Song } from "./types";
import { getKaraokeFolderPath, fileExists } from './tv-box-utils';
import { Capacitor } from '@capacitor/core';

// URL do arquivo no GitHub para uso no navegador
const GITHUB_MUSICAS_URL = 'https://raw.githubusercontent.com/willblanko/box-karaoke-night/main/public/musicas.txt';

// Flag para controlar exibição de toasts
let initialLoadComplete = false;

// Função para ler o arquivo musicas.txt e extrair os metadados
async function parseSongMetadata(content: string): Promise<Song[]> {
  const songs: Song[] = [];
  const blocks = content.split('***').filter(block => block.trim());
  
  console.log(`Processando ${blocks.length} blocos de música do catálogo`);
  
  for (const block of blocks) {
    const idMatch = block.match(/\[(\d+)\]/);
    const fileMatch = block.match(/Arquivo= (.+)/);
    const artistMatch = block.match(/Artista= (.+)/);
    const titleMatch = block.match(/Musica= (.+)/);
    
    if (idMatch && fileMatch && artistMatch && titleMatch) {
      const id = parseInt(idMatch[1]);
      const fileName = fileMatch[1].trim();
      const artist = artistMatch[1].trim();
      const title = titleMatch[1].trim();
      
      // Usa o ID da música para o nome do arquivo .mp4
      const videoFileName = `${id}.mp4`;
      const karaokeFolderPath = getKaraokeFolderPath();
      
      // Verifica se o arquivo de vídeo existe
      const videoExists = await fileExists(`${karaokeFolderPath}/${videoFileName}`);
      
      songs.push({
        id,
        title,
        artist,
        duration: 0,
        // O caminho do vídeo é construído com o caminho atual do karaoke
        videoPath: `${karaokeFolderPath}/${videoFileName}`,
        videoExists
      });
    }
  }
  
  console.log(`Total de ${songs.length} músicas processadas com sucesso`);
  return songs;
}

// Função para carregar o arquivo musicas.txt
async function loadSongCatalogFile(): Promise<string> {
  console.log("Carregando catálogo de músicas...");
  const karaokeFolderPath = getKaraokeFolderPath();

  try {
    if (Capacitor.isNativePlatform()) {
      console.log("Executando em ambiente nativo Android");
      
      // Primeiro, tenta carregar o arquivo do diretório de karaoke selecionado
      try {
        console.log(`Tentando carregar musicas.txt de ${karaokeFolderPath}`);
        const result = await Filesystem.readFile({
          path: `${karaokeFolderPath}/musicas.txt`,
          directory: Directory.ExternalStorage
        });
        
        const content = typeof result.data === 'string' 
          ? result.data 
          : new TextDecoder().decode(result.data as any);
          
        if (content && content.includes('***') && content.includes('[')) {
          console.log(`Arquivo musicas.txt carregado com sucesso de ${karaokeFolderPath}`);
          return content;
        }
      } catch (e) {
        console.log(`Não foi possível carregar musicas.txt da pasta configurada:`, e);
      }
      
      // Lista os diretórios disponíveis para debugar
      try {
        const listRootDir = await Filesystem.readdir({
          path: karaokeFolderPath,
          directory: Directory.ExternalStorage
        });
        console.log("Conteúdo da pasta karaoke:", listRootDir.files.map(f => f.name));
      } catch (e) {
        console.log("Não foi possível listar a pasta karaoke:", e);
      }
      
      // No Android, tenta carregar de várias fontes possíveis
      const possibleDirectories = [
        Directory.Data, 
        Directory.Documents,
        Directory.Cache, 
        Directory.ExternalStorage
      ];
      
      const possiblePaths = [
        'musicas.txt',
        'Download/musicas.txt',
        'public/musicas.txt',
        'assets/musicas.txt',
        'assets/public/musicas.txt',
        `${karaokeFolderPath}/musicas.txt`
      ];
      
      // Tenta todas as combinações possíveis
      for (const directory of possibleDirectories) {
        for (const path of possiblePaths) {
          try {
            console.log(`Tentando carregar de ${directory}/${path}`);
            const result = await Filesystem.readFile({
              path: path,
              directory: directory
            });

            const content = typeof result.data === 'string' 
              ? result.data 
              : new TextDecoder().decode(result.data as any);

            if (content && content.includes('***') && content.includes('[')) {
              console.log(`Arquivo musicas.txt carregado com sucesso de ${directory}/${path}`);
              return content;
            } else {
              console.log(`Arquivo encontrado em ${directory}/${path}, mas formato inválido`);
            }
          } catch (e) {
            console.log(`Não foi possível carregar de ${directory}/${path}`);
          }
        }
      }
      
      console.error("Todas as tentativas de leitura nativa falharam.");
      throw new Error("Não foi possível carregar o catálogo de músicas do dispositivo");
    } else {
      console.log("Executando em ambiente web");
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
        console.log("Aviso: Nenhuma música encontrada no catálogo.");
      } else {
        console.log(`Sucesso: ${songs.length} músicas carregadas do catálogo.`);
        // Marca como concluído apenas se for bem-sucedido
        initialLoadComplete = true;
      }
    }
    
    return songs;
  } catch (error) {
    console.error("Erro ao carregar músicas:", error);
    // Sempre mostra erros, mesmo em cargas repetidas
    throw error;
  }
}

// Função para obter o caminho do vídeo
export function getVideoPath(songId: number): string {
  // Construir o caminho correto para o arquivo de vídeo com base no ID da música
  return `${getKaraokeFolderPath()}/${songId}.mp4`;
}
