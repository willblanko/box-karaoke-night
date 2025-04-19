
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
    if (!isAndroidTVBox()) {
      return false;
    }

    const result = await Filesystem.readdir({
      path: '/storage',
      directory: Directory.External
    });

    return result.files.some(file => 
      file.name.toLowerCase().includes('usb') || 
      file.name.toLowerCase().includes('otg')
    );
  } catch (error) {
    console.error('Error checking USB connection:', error);
    return false;
  }
}

// Listen for USB connection changes
export function listenForUSBConnection(callback: (isConnected: boolean) => void): () => void {
  // Initial check
  checkUSBConnection().then(callback);

  // Set up an interval to check periodically (every 2 seconds)
  const interval = setInterval(async () => {
    const isConnected = await checkUSBConnection();
    callback(isConnected);
  }, 2000);

  // Clean up on unmount - Return a function that clears the interval
  return () => clearInterval(interval);
}

// Function to list available storage directories
export async function listStorageDirectories(path: string = '/'): Promise<Array<{ name: string; path: string; isDirectory: boolean }>> {
  try {
    const result = await Filesystem.readdir({
      path: path,
      directory: Directory.External
    });

    return result.files.map(file => ({
      name: file.name,
      path: `${path}${path.endsWith('/') ? '' : '/'}${file.name}`,
      isDirectory: file.type === 'directory'
    }));
  } catch (error) {
    console.error('Error listing directories:', error);
    return [];
  }
}
