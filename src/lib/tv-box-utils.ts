
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Check if we're running on a TV Box Android device
export function isAndroidTVBox(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return Capacitor.isNativePlatform() && userAgent.includes('android') && (userAgent.includes('tv') || window.innerWidth >= 1280);
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
      return false; // Em ambiente web, simula desconectado
    }

    console.log("Verificando conexão USB em ambiente Android nativo");
    
    // Em ambiente Android real, verifica diretórios externos
    const commonUSBPaths = [
      '/storage/usb', 
      '/mnt/usb', 
      '/storage/usbotg',
      '/mnt/usbotg',
      '/storage/udisk',
      '/mnt/udisk'
    ];
    
    // Tenta verificar os caminhos comuns de USB
    for (const path of commonUSBPaths) {
      try {
        console.log(`Tentando verificar existência de: ${path}`);
        const result = await Filesystem.stat({
          path: path,
          directory: Directory.ExternalStorage
        });
        
        if (result) {
          console.log(`USB detectado em: ${path}`);
          return true;
        }
      } catch (e) {
        console.log(`Caminho não encontrado: ${path}`);
        // Continua para o próximo caminho
      }
    }
    
    // Segundo método: verifica diretamente em /storage
    try {
      console.log("Listando diretórios em /storage");
      const result = await Filesystem.readdir({
        path: '/storage',
        directory: Directory.ExternalStorage
      });

      // Procura por diretórios que indicam dispositivos USB (nomes comuns em Android TV Box)
      const usbFolders = ['usb', 'otg', 'usbdisk', 'udisk', 'external', 'sda1'];
      const hasUSB = result.files.some(file => 
        usbFolders.some(term => file.name.toLowerCase().includes(term))
      );
      
      console.log("Dispositivos encontrados em /storage:", result.files.map(f => f.name).join(", "));
      if (hasUSB) {
        console.log("USB detectado em /storage");
        return true;
      }
    } catch (error) {
      console.log("Erro ao listar /storage:", error);
    }
    
    // Último recurso: verifica em /mnt
    try {
      console.log("Listando diretórios em /mnt");
      const result = await Filesystem.readdir({
        path: '/mnt',
        directory: Directory.ExternalStorage
      });

      const usbFolders = ['usb', 'otg', 'usbdisk', 'udisk', 'external', 'sda1'];
      const hasUSB = result.files.some(file => 
        usbFolders.some(term => file.name.toLowerCase().includes(term))
      );
      
      console.log("Dispositivos encontrados em /mnt:", result.files.map(f => f.name).join(", "));
      if (hasUSB) {
        console.log("USB detectado em /mnt");
        return true;
      }
    } catch (error) {
      console.log("Erro ao listar /mnt:", error);
    }
    
    console.log("USB não detectado após todas as verificações");
    return false;
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
  return savedPath || (Capacitor.isNativePlatform() ? '/storage/emulated/0/Download/karaoke' : '/karaoke');
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

    console.log(`Listando diretórios em ambiente Android: ${path}`);
    
    try {
      // Antes de listar, verificar se o caminho existe
      await Filesystem.stat({
        path: path,
        directory: Directory.ExternalStorage
      });
      
      // Lista o conteúdo do diretório
      const result = await Filesystem.readdir({
        path: path,
        directory: Directory.ExternalStorage
      });

      console.log(`Encontrados ${result.files.length} itens em ${path}:`, 
                 result.files.map(f => `${f.name} (${f.type})`).join(', '));
      
      // Filtra e mapeia os resultados
      return result.files.map(file => ({
        name: file.name,
        path: `${path}${path.endsWith('/') ? '' : '/'}${file.name}`,
        isDirectory: file.type === 'directory'
      }));
    } catch (error) {
      console.error(`Erro ao listar diretórios em ${path}:`, error);
      
      // Se for o diretório raiz, tenta caminhos alternativos conhecidos
      if (path === '/' || path === '') {
        console.log("Listando caminhos alternativos para raiz");
        
        const rootPaths = [
          { name: 'storage', path: '/storage', isDirectory: true },
          { name: 'sdcard', path: '/sdcard', isDirectory: true },
          { name: 'mnt', path: '/mnt', isDirectory: true },
          { name: 'data', path: '/data', isDirectory: true }
        ];
        
        // Verifica quais caminhos existem
        const validPaths = await Promise.all(
          rootPaths.map(async (item) => {
            try {
              await Filesystem.stat({
                path: item.path,
                directory: Directory.ExternalStorage
              });
              console.log(`Caminho válido encontrado: ${item.path}`);
              return item;
            } catch {
              return null;
            }
          })
        );
        
        const filteredPaths = validPaths.filter(Boolean);
        console.log(`Caminhos raiz válidos encontrados: ${filteredPaths.length}`);
        return filteredPaths;
      }
      
      // Se for outro caminho, tenta alguns diretórios alternativos
      if (path === '/storage') {
        console.log("Tentando listar itens específicos em /storage");
        const storagePaths = [
          { name: 'emulated', path: '/storage/emulated', isDirectory: true },
          { name: 'self', path: '/storage/self', isDirectory: true },
          { name: 'sdcard0', path: '/storage/sdcard0', isDirectory: true },
          { name: 'external_storage', path: '/storage/external_storage', isDirectory: true }
        ];
        
        const validPaths = await Promise.all(
          storagePaths.map(async (item) => {
            try {
              await Filesystem.stat({
                path: item.path,
                directory: Directory.ExternalStorage
              });
              console.log(`Caminho válido encontrado: ${item.path}`);
              return item;
            } catch {
              return null;
            }
          })
        );
        
        const filteredPaths = validPaths.filter(Boolean);
        console.log(`Caminhos em /storage válidos: ${filteredPaths.length}`);
        return filteredPaths;
      }
      
      return [];
    }
  } catch (generalError) {
    console.error('Erro geral ao listar diretórios:', generalError);
    return [];
  }
}
