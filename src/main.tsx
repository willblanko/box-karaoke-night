
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'

// Adicionar tratamento de erros global para logs no ambiente nativo
if (Capacitor.isNativePlatform()) {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Erro global:', message, 'em', source, 'linha:', lineno, error);
    // Registrar erros para depuração
    return false;
  };

  // Adicionar verificação de rede para ambiente Android
  window.addEventListener('online', () => console.log('Dispositivo online'));
  window.addEventListener('offline', () => console.log('Dispositivo offline'));

  // Garantir que links internos funcionem corretamente
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
      e.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        window.location.hash = href.replace('/', '#/');
      }
    }
  });

  console.log('Aplicativo inicializado na versão 1.2.0');
}

createRoot(document.getElementById("root")!).render(<App />);
