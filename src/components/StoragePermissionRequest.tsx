
import React, { useEffect, useRef } from "react";
import { useStoragePermissionContext } from "@/context/StoragePermissionContext";
import { Button } from "@/components/ui/button";
import { HardDrive } from "lucide-react";

export const StoragePermissionRequest: React.FC = () => {
  const { hasStoragePermission, isChecking, requestPermission } = useStoragePermissionContext();
  const hasAttemptedRequest = useRef(false);

  useEffect(() => {
    // Tenta solicitar permissão automaticamente apenas uma vez na primeira montagem
    if (!isChecking && !hasStoragePermission && !hasAttemptedRequest.current) {
      hasAttemptedRequest.current = true;
      // Pequeno atraso para garantir que a interface esteja pronta
      const timer = setTimeout(() => {
        requestPermission();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isChecking, hasStoragePermission, requestPermission]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card/80 rounded-lg shadow">
        <span className="text-tv-lg mb-4">Verificando permissões...</span>
      </div>
    );
  }

  if (hasStoragePermission) {
    return null; // Se já tem permissão, não mostra nada
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow max-w-md">
        <HardDrive className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-tv-2xl font-bold mb-2">Permissão necessária</h2>
        <p className="text-tv-lg text-center mb-6">
          Para usar este app de karaoke, precisamos acessar o armazenamento da sua TV Box para localizar os arquivos de música e vídeo.
        </p>
        <Button
          size="lg"
          onClick={() => {
            // Previne múltiplos cliques
            if (!hasAttemptedRequest.current) {
              hasAttemptedRequest.current = true;
            }
            requestPermission();
          }}
          className="text-tv-lg px-8 py-6" // Botão maior para TV Box
        >
          Conceder permissão
        </Button>
      </div>
    </div>
  );
};
