
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'

// Adicionar tratamento de erros global para logs no ambiente nativo
if (Capacitor.isNativePlatform()) {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Erro global:', message, error);
    return false;
  };
}

createRoot(document.getElementById("root")!).render(<App />);
