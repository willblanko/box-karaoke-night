
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
        console.log(`Caminho não encontrado: ${path}`);
        // Continua para o próximo caminho
      }
    }
    
    // Método dinâmico: verifica todos os diretórios em /storage e /mnt
    const checkDirectoriesFor = async (basePath: string) => {
      try {
        console.log(`Listando diretórios em ${basePath}`);
        const result = await Filesystem.readdir({
          path: basePath,
          directory: Directory.ExternalStorage
        });

        // Sinais de dispositivo USB (nomes comuns em Android)
        const usbIndicators = ['usb', 'otg', 'usbdisk', 'udisk', 'external', 'sda', 'sd', 'removable'];
        
        console.log(`Dispositivos encontrados em ${basePath}:`, result.files.map(f => f.name).join(", "));
        
        // Procura por diretórios que indicam dispositivos USB
        for (const file of result.files) {
          const lowerName = file.name.toLowerCase();
          if (file.type === 'directory' && usbIndicators.some(term => lowerName.includes(term))) {
            const fullPath = `${basePath}/${file.name}`;
            console.log(`Possível USB encontrado: ${fullPath}`);
            
            // Tenta acessar esse diretório para confirmar
            try {
              await Filesystem.readdir({
                path: fullPath,
                directory: Directory.ExternalStorage
              });
              
              console.log(`USB confirmado em ${fullPath}`);
              localStorage.setItem('lastDetectedUsbPath', fullPath);
              return true;
            } catch (e) {
              console.log(`Não foi possível acessar ${fullPath}`);
            }
          }
        }
      } catch (error) {
        console.log(`Erro ao listar ${basePath}:`, error);
      }
      return false;
    };
    
    // Verifica em diretórios comuns
    if (await checkDirectoriesFor('/storage')) return true;
    if (await checkDirectoriesFor('/mnt')) return true;
    if (await checkDirectoriesFor('/')) return true;
    
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
        { name: 'storage', path: '/storage', isDirectory: true },
        { name: 'sdcard', path: '/sdcard', isDirectory: true }
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
        
        // Filtra por possíveis dispositivos USB
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
      return usbDevices.length > 0 ? usbDevices : [
        { name: 'Nenhum dispositivo USB encontrado', path: '/', isDirectory: false }
      ];
    }
    
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
      return result.files
        .sort((a, b) => {
          // Primeiro os diretórios, depois os arquivos
          if (a.type === 'directory' && b.type !== 'directory') return -1;
          if (a.type !== 'directory' && b.type === 'directory') return 1;
          return a.name.localeCompare(b.name);
        })
        .map(file => ({
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
          { name: 'Dispositivos USB', path: '/__usb_devices__', isDirectory: true },
          { name: 'storage', path: '/storage', isDirectory: true },
          { name: 'sdcard', path: '/sdcard', isDirectory: true },
          { name: 'mnt', path: '/mnt', isDirectory: true },
          { name: 'data', path: '/data', isDirectory: true }
        ];
        
        // Verifica quais caminhos existem
        const validPaths = await Promise.all(
          rootPaths.map(async (item) => {
            if (item.path === '/__usb_devices__') return item; // Caminho especial, sempre mostrar
            
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
      
      return [];
    }
  } catch (generalError) {
    console.error('Erro geral ao listar diretórios:', generalError);
    return [];
  }
}
