
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
    
    // Lista de caminhos possíveis para dispositivos USB em Android TV Box
    const commonUSBPaths = [
      '/storage/usb', 
      '/mnt/usb', 
      '/storage/usbotg',
      '/mnt/usbotg',
      '/storage/udisk',
      '/mnt/udisk',
      '/storage/sda1',
      '/mnt/sda1',
      '/storage/self/primary/usb',
      '/mnt/media_rw',
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
          // Salva o caminho do USB encontrado para uso posterior
          localStorage.setItem('lastDetectedUsbPath', path);
          return true;
        }
      } catch (e) {
        // Continua para o próximo caminho
      }
    }
    
    // Método mais abrangente para detectar dispositivos USB
    try {
      // Verifica em /storage
      const storageResult = await Filesystem.readdir({
        path: '/storage',
        directory: Directory.ExternalStorage
      });
      
      console.log("Dispositivos em /storage:", storageResult.files.map(f => f.name).join(", "));
      
      // Identifica dispositivos que não são o armazenamento interno
      for (const file of storageResult.files) {
        if (file.type === 'directory' && !['self', 'emulated', 'primary'].includes(file.name.toLowerCase())) {
          const usbPath = `/storage/${file.name}`;
          
          try {
            // Verifica se o diretório é acessível
            await Filesystem.readdir({
              path: usbPath,
              directory: Directory.ExternalStorage
            });
            
            console.log(`USB detectado em ${usbPath}`);
            localStorage.setItem('lastDetectedUsbPath', usbPath);
            return true;
          } catch (e) {
            console.log(`Não foi possível acessar ${usbPath}`);
          }
        }
      }
    } catch (error) {
      console.log("Erro ao verificar dispositivos em /storage:", error);
    }
    
    // Verifica em /mnt
    try {
      const mntResult = await Filesystem.readdir({
        path: '/mnt',
        directory: Directory.ExternalStorage
      });
      
      console.log("Dispositivos em /mnt:", mntResult.files.map(f => f.name).join(", "));
      
      // Procura por diretorios que podem ser dispositivos USB
      for (const file of mntResult.files) {
        if (file.type === 'directory' && 
           ['usb', 'otg', 'usbdisk', 'udisk', 'sda', 'external'].some(term => file.name.toLowerCase().includes(term))) {
          
          const usbPath = `/mnt/${file.name}`;
          try {
            await Filesystem.readdir({
              path: usbPath,
              directory: Directory.ExternalStorage
            });
            
            console.log(`USB detectado em ${usbPath}`);
            localStorage.setItem('lastDetectedUsbPath', usbPath);
            return true;
          } catch (e) {
            console.log(`Não foi possível acessar ${usbPath}`);
          }
        }
      }
    } catch (error) {
      console.log("Erro ao verificar dispositivos em /mnt:", error);
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
  // Primeiro, verifica se há um caminho personalizado definido pelo usuário
  const userDefinedPath = localStorage.getItem('karaokeFolderPath');
  if (userDefinedPath) {
    return userDefinedPath;
  }
  
  // Se não, tenta usar o último caminho de USB detectado
  const lastUsbPath = localStorage.getItem('lastDetectedUsbPath');
  if (lastUsbPath) {
    // Tenta encontrar uma pasta de música comum no dispositivo USB
    const musicFolder = `${lastUsbPath}/karaoke`;
    return musicFolder;
  }
  
  // Caminho padrão como último recurso
  return Capacitor.isNativePlatform() 
    ? '/storage/emulated/0/Download/karaoke' 
    : '/karaoke';
}

// Function to list available storage directories for karaoke folder selection
export async function listStorageDirectories(path: string = '/'): Promise<Array<{ name: string; path: string; isDirectory: boolean }>> {
  try {
    if (!Capacitor.isNativePlatform()) {
      // Retorna diretórios simulados para desenvolvimento
      console.log("Ambiente web, retornando diretórios simulados");
      return [
        { name: 'Dispositivos USB (simulado)', path: '/__usb_devices__', isDirectory: true },
        { name: 'storage (simulado)', path: '/storage', isDirectory: true },
        { name: 'sdcard (simulado)', path: '/sdcard', isDirectory: true },
        { name: 'Downloads (simulado)', path: '/Downloads', isDirectory: true }
      ];
    }

    console.log(`Listando diretórios em ambiente Android: ${path}`);
    
    // Verifica se é um caminho especial para mostrar dispositivos USB
    if (path === '/__usb_devices__') {
      // Caminho especial para listar apenas dispositivos USB
      const usbDevices = [];
      
      // Verifica dispositivos em /storage
      try {
        const storageItems = await Filesystem.readdir({
          path: '/storage',
          directory: Directory.ExternalStorage
        });
        
        console.log("Conteúdo de /storage:", storageItems.files.map(f => f.name).join(", "));
        
        // Filtra por possíveis dispositivos USB (exclui armazenamento interno)
        for (const item of storageItems.files) {
          if (item.type === 'directory' && 
              !['self', 'emulated', 'primary'].includes(item.name.toLowerCase())) {
            usbDevices.push({
              name: `USB (${item.name})`,
              path: `/storage/${item.name}`,
              isDirectory: true
            });
          }
        }
      } catch (e) {
        console.log("Erro ao verificar dispositivos em /storage:", e);
      }
      
      // Verifica dispositivos em /mnt
      try {
        const mntItems = await Filesystem.readdir({
          path: '/mnt',
          directory: Directory.ExternalStorage
        });
        
        console.log("Conteúdo de /mnt:", mntItems.files.map(f => f.name).join(", "));
        
        for (const item of mntItems.files) {
          if (item.type === 'directory' && 
              ['usb', 'media_rw', 'sdcard', 'sda', 'otg'].some(term => item.name.toLowerCase().includes(term))) {
            usbDevices.push({
              name: `Mídia (${item.name})`,
              path: `/mnt/${item.name}`,
              isDirectory: true
            });
          }
        }
      } catch (e) {
        console.log("Erro ao verificar dispositivos em /mnt:", e);
      }
      
      console.log(`Encontrados ${usbDevices.length} dispositivos USB`);
      
      if (usbDevices.length === 0) {
        return [
          { name: "Nenhum dispositivo USB encontrado", path: '/', isDirectory: false },
          // Adicione alguns caminhos de fallback para navegação
          { name: "Voltar para storage", path: '/storage', isDirectory: true },
          { name: "Voltar para raiz", path: '/', isDirectory: true }
        ];
      }
      
      return usbDevices;
    }
    
    // Listagem de diretórios normais
    try {
      const result = await Filesystem.readdir({
        path: path,
        directory: Directory.ExternalStorage
      });

      console.log(`Encontrados ${result.files.length} itens em ${path}:`, 
                 result.files.map(f => `${f.name} (${f.type})`).join(', '));
      
      // Filtra e mapeia os resultados
      return result.files
        .sort((a, b) => {
          // Primeiro os diretórios, depois os arquivos
          if (a.type === 'directory' && b.type !== 'directory') return -1;
          if (a.type !== 'directory' && b.type === 'directory') return 1;
          return a.name.localeCompare(b.name);
        })
        .map(file => ({
          name: file.name,
          path: `${path === '/' ? '' : path}/${file.name}`,
          isDirectory: file.type === 'directory'
        }));
    } catch (error) {
      console.error(`Erro ao listar diretórios em ${path}:`, error);
      
      // Se for o diretório raiz, oferece caminhos comuns em Android
      if (path === '/' || path === '') {
        return [
          { name: 'Dispositivos USB', path: '/__usb_devices__', isDirectory: true },
          { name: 'storage', path: '/storage', isDirectory: true },
          { name: 'sdcard', path: '/sdcard', isDirectory: true },
          { name: 'mnt', path: '/mnt', isDirectory: true },
          { name: 'data', path: '/data', isDirectory: true }
        ];
      }
      
      // Para outros erros, retorne uma lista vazia com opções de navegação
      return [
        { name: "Pasta inacessível", path: path, isDirectory: false },
        { name: "Voltar para storage", path: '/storage', isDirectory: true },
        { name: "Voltar para raiz", path: '/', isDirectory: true }
      ];
    }
  } catch (generalError) {
    console.error('Erro geral ao listar diretórios:', generalError);
    
    // Em caso de erro grave, ofereça caminhos comuns para Android
    return [
      { name: 'Dispositivos USB', path: '/__usb_devices__', isDirectory: true },
      { name: 'storage', path: '/storage', isDirectory: true },
      { name: 'sdcard', path: '/sdcard', isDirectory: true },
      { name: 'mnt', path: '/mnt', isDirectory: true }
    ];
  }
}

// Função para verificar se um arquivo existe
export async function fileExists(filePath: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    // Em ambiente web, simulamos que o arquivo existe
    console.log("Ambiente web, simulando que o arquivo existe:", filePath);
    return true;
  }
  
  try {
    console.log(`Verificando existência do arquivo: ${filePath}`);
    await Filesystem.stat({
      path: filePath,
      directory: Directory.ExternalStorage
    });
    
    return true;
  } catch (error) {
    console.log(`Arquivo não existe: ${filePath}`);
    return false;
  }
}
