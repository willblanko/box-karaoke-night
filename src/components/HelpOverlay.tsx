
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";

/**
 * Componente que mostra instruções de uso do app
 * Pode ser aberto com um botão de ajuda
 */
export const HelpOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 flex items-center justify-center"
        onClick={() => setIsVisible(true)}
      >
        <HelpCircle size={24} />
      </Button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card max-w-lg w-full rounded-lg p-6 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => setIsVisible(false)}
        >
          <X size={20} />
        </Button>
        
        <h2 className="text-tv-2xl font-bold text-center mb-6">Como usar o Karaoke Box</h2>
        
        <div className="space-y-4 text-tv-base">
          <div>
            <h3 className="font-bold text-tv-lg mb-1">1. Escolhendo uma música</h3>
            <p>Digite o número da música usando o controle remoto e pressione Enter.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-tv-lg mb-1">2. Controlando a reprodução</h3>
            <p>Use a tecla ➡️ (direita) para pular para a próxima música da fila.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-tv-lg mb-1">3. Fila de reprodução</h3>
            <p>Você pode adicionar várias músicas à fila. Elas serão reproduzidas em sequência.</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button onClick={() => setIsVisible(false)} size="lg">
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
};
