import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Check if we're running on a TV Box Android device
export function isAndroidTVBox(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('android') && (userAgent.includes('tv') || window.innerWidth >= 1280);
}

// Function to adapt UI based on screen resolution
export function adaptUIForScreenResolution(): void {
  const { innerWidth, innerHeight } = window;
  
  // Ajuste específico para as resoluções mais comuns de TV Box
  if (innerWidth === 1280 && innerHeight === 720) {
    // 720p - Ajustar escala da UI
    document.documentElement.style.fontSize = '14px';
  } else if (innerWidth === 1920 && innerHeight === 1080) {
    // 1080p - Manter escala padrão
    document.documentElement.style.fontSize = '16px';
  } else {
    // Outras resoluções - escala proporcional
    const scaleFactor = Math.min(innerWidth / 1920, innerHeight / 1080);
    document.documentElement.style.fontSize = `${Math.max(12, 16 * scaleFactor)}px`;
  }
  
  console.log(`Adaptando UI para resolução: ${innerWidth}x${innerHeight}`);
}

// Real USB detection using Capacitor Filesystem
export async function checkUSBConnection(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      // Para desenvolvimento, simula a presença do USB
      return true;
    }

    // Em ambiente nativo, verifica diretórios externos
    try {
      const result = await Filesystem.readdir({
        path: '/storage',
        directory: Directory.ExternalStorage
      });

      return result.files.some(file => 
        file.name.toLowerCase().includes('usb') || 
        file.name.toLowerCase().includes('otg')
      );
    } catch (error) {
      // Se falhar em verificar /storage, tenta um método alternativo mais permissivo
      // Simplesmente assume que um USBé conectado se puder acessar o armazenamento externo
      try {
        await Filesystem.readdir({
          path: '/',
          directory: Directory.ExternalStorage
        });
        return true;
      } catch (innerError) {
        console.error('Error checking external storage:', innerError);
        return false;
      }
    }
  } catch (error) {
    console.error('Error checking USB connection:', error);
    // Se não conseguir verificar, assume que há conexão para evitar mensagens de erro
    return true;
  }
}

// Listen for USB connection changes
export function listenForUSBConnection(callback: (isConnected: boolean) => void): () => void {
  // Initial check
  checkUSBConnection().then(callback);

  // Set up an interval to check periodically (every 5 seconds)
  const interval = setInterval(async () => {
    const isConnected = await checkUSBConnection();
    callback(isConnected);
  }, 5000); // Increased the interval to reduce number of checks

  // Clean up on unmount - Return a function that clears the interval
  return () => clearInterval(interval);
}

// Function to list available storage directories
export async function listStorageDirectories(path: string = '/'): Promise<Array<{ name: string; path: string; isDirectory: boolean }>> {
  try {
    // Em desenvolvimento, retorna diretórios simulados para teste
    if (!Capacitor.isNativePlatform()) {
      if (path === '/') {
        return [
          { name: 'storage', path: '/storage', isDirectory: true },
          { name: 'sdcard', path: '/sdcard', isDirectory: true }
        ];
      } else if (path === '/storage') {
        return [
          { name: 'emulated', path: '/storage/emulated', isDirectory: true },
          { name: 'usb', path: '/storage/usb', isDirectory: true }
        ];
      } else if (path === '/storage/usb') {
        return [
          { name: 'karaoke', path: '/storage/usb/karaoke', isDirectory: true },
          { name: 'videos', path: '/storage/usb/videos', isDirectory: true },
          { name: 'musicas.txt', path: '/storage/usb/musicas.txt', isDirectory: false }
        ];
      } else if (path === '/storage/usb/karaoke') {
        return [
          { name: '1001.mp4', path: '/storage/usb/karaoke/1001.mp4', isDirectory: false },
          { name: '1002.mp4', path: '/storage/usb/karaoke/1002.mp4', isDirectory: false },
          { name: '1003.mp4', path: '/storage/usb/karaoke/1003.mp4', isDirectory: false }
        ];
      } else {
        // Para outros caminhos, retorna uma lista vazia
        return [];
      }
    }

    // Em ambiente nativo, acessa realmente o sistema de arquivos
    try {
      const result = await Filesystem.readdir({
        path: path,
        directory: Directory.ExternalStorage
      });

      return result.files.map(file => ({
        name: file.name,
        path: `${path}${path.endsWith('/') ? '' : '/'}${file.name}`,
        isDirectory: file.type === 'directory'
      }));
    } catch (error) {
      console.error(`Error reading directory ${path}:`, error);
      
      // Se falhar em ler o diretório, tenta uma abordagem mais simples
      // Retorna apenas alguns diretórios comuns se estiver na raiz
      if (path === '/') {
        return [
          { name: 'storage', path: '/storage', isDirectory: true },
          { name: 'sdcard', path: '/sdcard', isDirectory: true },
          { name: 'mnt', path: '/mnt', isDirectory: true }
        ];
      } else if (path.includes('/storage')) {
        return [
          { name: 'emulated', path: `${path}/emulated`, isDirectory: true },
          { name: 'self', path: `${path}/self`, isDirectory: true }
        ];
      }
      
      // Para outros caminhos que falharem, retorna uma lista vazia
      return [];
    }
  } catch (error) {
    console.error('Error listing directories:', error);
    return [];
  }
}

// Obtem a pasta configurada para o Karaoke
export function getKaraokeFolderPath(): string {
  // Tenta obter do localStorage
  const savedPath = localStorage.getItem('karaokeFolderPath');
  
  if (savedPath) {
    return savedPath;
  }
  
  // Caminho padrão para a pasta de karaoke
  return '/storage/emulated/0/karaoke';
}
