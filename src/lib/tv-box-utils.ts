
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

// Verifica se há um dispositivo USB conectado usando APIs nativas do Android
export async function checkUSBConnection(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log("Executando em ambiente web, simulando USB como desconectado");
      return false; // Em ambiente web, simula desconectado para evitar falsos positivos
    }

    // Em ambiente Android real, verifica diretórios externos
    try {
      // Tenta listar dispositivos em /storage
      const result = await Filesystem.readdir({
        path: '/storage',
        directory: Directory.ExternalStorage
      });

      // Procura por diretórios que indicam dispositivos USB (nomes comuns em Android TV Box)
      const hasUSB = result.files.some(file => 
        file.name.toLowerCase().includes('usb') || 
        file.name.toLowerCase().includes('otg') ||
        file.name.toLowerCase().includes('external') ||
        file.name.toLowerCase().includes('udisk')
      );
      
      console.log("Estado do USB verificado:", hasUSB, "Dispositivos encontrados:", result.files.map(f => f.name).join(", "));
      return hasUSB;
    } catch (error) {
      console.log("Erro ao verificar /storage, tentando método alternativo:", error);
      
      // Método alternativo: verifica se consegue acessar um caminho comum para USBs
      try {
        await Filesystem.stat({
          path: '/storage/usb',
          directory: Directory.ExternalStorage
        });
        console.log("USB detectado via método alternativo");
        return true;
      } catch (innerError) {
        console.log("USB não detectado em /storage/usb, última tentativa");
        
        // Última tentativa: verifica se há algum conteúdo em /mnt/usb
        try {
          await Filesystem.stat({
            path: '/mnt/usb',
            directory: Directory.ExternalStorage
          });
          console.log("USB detectado em /mnt/usb");
          return true;
        } catch (finalError) {
          console.error("USB não detectado após todas as verificações");
          return false;
        }
      }
    }
  } catch (error) {
    console.error('Erro grave ao verificar conexão USB:', error);
    return false;
  }
}

// Listen for USB connection changes
export function listenForUSBConnection(callback: (isConnected: boolean) => void): () => void {
  let lastState = false;

  // Initial check
  checkUSBConnection().then(state => {
    lastState = state;
    callback(state);
  });

  // Set up an interval to check periodically (every 5 seconds)
  const interval = setInterval(async () => {
    const currentState = await checkUSBConnection();
    // Só notifica se o estado mudou
    if (currentState !== lastState) {
      console.log("Estado do USB mudou de", lastState, "para", currentState);
      lastState = currentState;
      callback(currentState);
    }
  }, 5000);

  // Clean up on unmount
  return () => clearInterval(interval);
}

// Obtem a pasta configurada para o Karaoke
export function getKaraokeFolderPath(): string {
  const savedPath = localStorage.getItem('karaokeFolderPath');
  return savedPath || '/storage/emulated/0/Download/karaoke';
}

// Function to list available storage directories for karaoke folder selection
export async function listStorageDirectories(path: string = '/'): Promise<Array<{ name: string; path: string; isDirectory: boolean }>> {
  try {
    if (!Capacitor.isNativePlatform()) {
      // Retorna diretórios simulados para desenvolvimento
      console.log("Ambiente web, retornando diretórios simulados");
      return [
        { name: 'storage', path: '/storage', isDirectory: true },
        { name: 'sdcard', path: '/sdcard', isDirectory: true }
      ];
    }

    console.log(`Listando diretórios em: ${path}`);
    
    try {
      const result = await Filesystem.readdir({
        path: path,
        directory: Directory.ExternalStorage
      });

      console.log(`Encontrados ${result.files.length} itens em ${path}`);
      
      return result.files.map(file => ({
        name: file.name,
        path: `${path}${path.endsWith('/') ? '' : '/'}${file.name}`,
        isDirectory: file.type === 'directory'
      }));
    } catch (error) {
      console.error(`Erro ao listar diretórios em ${path}:`, error);
      
      // Tenta alguns caminhos comuns se o caminho principal falhar
      if (path === '/') {
        console.log("Tentando caminhos alternativos");
        const commonPaths = [
          { name: 'storage', path: '/storage', isDirectory: true },
          { name: 'sdcard', path: '/sdcard', isDirectory: true },
          { name: 'mnt', path: '/mnt', isDirectory: true },
          { name: 'emulated', path: '/storage/emulated/0', isDirectory: true },
          { name: 'Download', path: '/storage/emulated/0/Download', isDirectory: true }
        ];
        
        // Verifica quais caminhos existem
        const validPaths = await Promise.all(
          commonPaths.map(async (item) => {
            try {
              await Filesystem.stat({
                path: item.path,
                directory: Directory.ExternalStorage
              });
              return item;
            } catch {
              return null;
            }
          })
        );
        
        return validPaths.filter(Boolean);
      }
      
      return [];
    }
  } catch (generalError) {
    console.error('Erro geral ao listar diretórios:', generalError);
    return []; 
  }
}
