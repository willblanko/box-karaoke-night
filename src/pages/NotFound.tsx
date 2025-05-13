
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleReturnHome = (e: React.MouseEvent) => {
    e.preventDefault();
    // Em ambiente nativo, recarregar a página pode ajudar a resolver problemas de roteamento
    if (Capacitor.isNativePlatform()) {
      window.location.href = '/';
    } else {
      // Em ambiente web, usar navegação normal
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
        <Button 
          onClick={handleReturnHome} 
          className="bg-primary text-white hover:bg-primary/90"
        >
          Voltar para o Início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
