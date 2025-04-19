
import React, { useEffect, useState } from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { Usb, Loader2 } from "lucide-react";
import { checkUSBConnection } from "@/lib/tv-box-utils";
import { Capacitor } from "@capacitor/core";

export const USBStatus: React.FC = () => {
  const { isUSBConnected, isLoading } = useKaraoke();
  const [isNative, setIsNative] = useState(false);
  
  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    
    // Verificação manual de USB para debugging - melhorada
    if (Capacitor.isNativePlatform()) {
      console.log("Executando em ambiente nativo Android/TV Box");
      checkUSBConnection().then(result => {
        console.log("Verificação manual de USB:", result);
      });
    } else {
      console.log("Executando em ambiente web (navegador)");
    }
  }, []);
  
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
          <span className="text-tv-sm">USB conectado</span>
        </>
      ) : (
        <>
          <Usb size={18} className="text-yellow-500" />
          <span className="text-tv-sm">
            {isNative ? "USB não detectado" : "Modo Web (sem USB)"}
          </span>
        </>
      )}
    </div>
  );
};
