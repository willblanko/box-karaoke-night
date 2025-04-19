
import React from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { Usb, AlertCircle, Loader2 } from "lucide-react";

/**
 * Componente que mostra o status da conexão USB
 */
export const USBStatus: React.FC = () => {
  const { isUSBConnected, isLoading, availableSongs } = useKaraoke();
  
  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 bg-card/70 p-2 px-3 rounded-full">
      {isLoading ? (
        <>
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-tv-sm">Carregando músicas...</span>
        </>
      ) : isUSBConnected ? (
        <>
          <Usb size={18} className="text-green-500" />
          <span className="text-tv-sm">{availableSongs.length} músicas</span>
        </>
      ) : (
        <>
          <AlertCircle size={18} className="text-destructive" />
          <span className="text-tv-sm">USB não conectado</span>
        </>
      )}
    </div>
  );
};
