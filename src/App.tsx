import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { adaptUIForScreenResolution } from "@/lib/tv-box-utils";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

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
    document.body.style.cursor = 'none'; // Ocultar cursor do mouse em TVs
    
    // Simular carregamento inicial
    const timer = setTimeout(() => setIsLoading(false), 2500);
    
    return () => {
      window.removeEventListener('resize', adaptUIForScreenResolution);
      clearTimeout(timer);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isLoading ? (
          <SplashScreen />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
