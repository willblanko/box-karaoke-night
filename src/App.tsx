
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter, Navigate } from "react-router-dom";
import { adaptUIForScreenResolution } from "@/lib/tv-box-utils";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Capacitor } from "@capacitor/core";
import { Filesystem } from '@capacitor/filesystem';

const queryClient = new QueryClient();

// App com ajustes para TV Box Android (720p e 1080p)
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Solicitar permissões no Android
  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        console.log("Solicitando permissões de armazenamento...");
        
        // Esta operação tentará ler um arquivo na raiz do sistema de arquivos
        // o que automaticamente solicitará as permissões necessárias
        await Filesystem.readdir({ path: '/' });
        
        console.log("Verificando acesso ao armazenamento externo...");
        try {
          await Filesystem.readdir({ path: '/storage' });
          console.log("Acesso ao /storage concedido");
        } catch (e) {
          console.log("Não foi possível acessar /storage", e);
        }
        
        console.log("Verificando acesso ao armazenamento interno...");
        try {
          await Filesystem.readdir({ path: '/storage/emulated/0' });
          console.log("Acesso ao armazenamento interno concedido");
        } catch (e) {
          console.log("Não foi possível acessar o armazenamento interno", e);
        }
        
      } catch (err) {
        console.error("Erro ao solicitar permissões:", err);
      }
    }
  };
  
  // Detectar e ajustar na montagem + no resize
  useEffect(() => {
    // Adaptar interface para a resolução atual
    adaptUIForScreenResolution();
    
    // Reagir a mudanças de tamanho da tela
    window.addEventListener('resize', adaptUIForScreenResolution);
    
    // Aplicar configurações específicas para TV
    document.body.style.overflow = 'hidden'; // Prevenir scroll em TV Box
    
    // Ocultar cursor apenas em TV Box (não em desenvolvimento)
    if (Capacitor.isNativePlatform()) {
      document.body.style.cursor = 'none'; // Ocultar cursor do mouse em TVs
      // Solicitar permissões ao iniciar em dispositivos Android
      requestPermissions();
    }
    
    // Simular carregamento inicial
    const timer = setTimeout(() => setIsLoading(false), 2500);
    
    return () => {
      window.removeEventListener('resize', adaptUIForScreenResolution);
      clearTimeout(timer);
    };
  }, []);

  // Usar HashRouter para dispositivos móveis Android e BrowserRouter para web
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isLoading ? (
          <SplashScreen />
        ) : (
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
