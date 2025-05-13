
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

const queryClient = new QueryClient();

// App com ajustes para TV Box Android (720p e 1080p)
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
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
      console.log("Executando em ambiente nativo: Android");
    } else {
      console.log("Executando em ambiente web");
    }
    
    // Simular carregamento inicial
    const timer = setTimeout(() => setIsLoading(false), 2500);
    
    return () => {
      window.removeEventListener('resize', adaptUIForScreenResolution);
      clearTimeout(timer);
    };
  }, []);

  // SEMPRE usar HashRouter para aplicativos Android com Capacitor
  // HashRouter é mais compatível com aplicações WebView em Android
  const Router = HashRouter;

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
