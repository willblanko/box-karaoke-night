
/**
 * Utilitários específicos para TV Box Android
 * Estas funções seriam implementadas com APIs nativas Android
 * quando o aplicativo for convertido para um app Android real
 */

// Função para verificar se estamos em uma TV Box Android
export function isAndroidTVBox(): boolean {
  // Em uma implementação real, isso detectaria o dispositivo e o sistema operacional
  // Para desenvolvimento web, retornamos false
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('android') && (userAgent.includes('tv') || window.innerWidth >= 1280);
}

// Função para adaptar a interface baseada na resolução da tela
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

// Na implementação real, para acessar o USB, seria necessário usar APIs Android:
// 1. Solicitação de permissão para acessar armazenamento externo
export function requestStoragePermission(): Promise<boolean> {
  // Esta seria uma implementação real com APIs nativas Android
  // Retorna mock para ambiente web
  console.log("Solicitando permissão de armazenamento...");
  return Promise.resolve(true);
}

// 2. Detectar quando um dispositivo USB é conectado
export function listenForUSBConnection(callback: () => void): void {
  // Em uma implementação real, isso usaria BroadcastReceiver do Android
  // Aqui apenas simulamos para desenvolvimento web
  console.log("Configurando listener para conexão USB...");
  
  // Simular evento de conexão USB após 2 segundos
  setTimeout(() => {
    console.log("USB conectado (simulado)");
    callback();
  }, 2000);
}

// 3. Obter caminhos de dispositivos USB montados
export function getUSBMountPath(): Promise<string> {
  // Em um TV Box Android real, retornaria algo como:
  // "/storage/usb0" ou "/mnt/usb"
  return Promise.resolve("/storage/usb0");
}
