
import React from "react";
import { useStoragePermissionContext } from "@/context/StoragePermissionContext";
import { Button } from "@/components/ui/button";
import { HardDrive } from "lucide-react";

export const StoragePermissionRequest: React.FC = () => {
  const { hasStoragePermission, isChecking, requestPermission } = useStoragePermissionContext();

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

  const handlePermissionRequest = () => {
    console.log("Botão clicado: Solicitando permissão...");
    requestPermission();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow max-w-md">
        <HardDrive className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-tv-2xl font-bold mb-2">Permissão necessária</h2>
        <p className="text-tv-lg text-center mb-6">
          Para usar este app de karaoke, precisamos acessar o armazenamento da sua TV Box para localizar os arquivos de música e vídeo.
        </p>
        <Button
          variant="destructive"
          size="lg"
          onClick={handlePermissionRequest}
          className="w-full text-tv-lg px-12 py-8 h-auto text-xl rounded-xl font-bold"
        >
          CONCEDER PERMISSÃO
        </Button>
      </div>
    </div>
  );
};
