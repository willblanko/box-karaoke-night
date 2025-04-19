
import React from "react";
import { SearchBar } from "@/components/SearchBar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SongQueue } from "@/components/SongQueue";
import { PerformanceRating } from "@/components/PerformanceRating";
import { KeyboardNavigation } from "@/components/KeyboardNavigation";
import { HelpOverlay } from "@/components/HelpOverlay";
import { USBStatus } from "@/components/USBStatus";
import { KaraokeProvider } from "@/context/KaraokeContext";
import { useKaraoke } from "@/context/KaraokeContext";

// Componente principal que será renderizado dentro do KaraokeProvider
const KaraokeContent: React.FC = () => {
  const { playerState, currentSong } = useKaraoke();

  return (
    <div className="min-h-screen w-full bg-background flex flex-col p-6 lg:p-8 gap-6">
      {/* Cabeçalho */}
      <header className="text-center mb-4">
        <h1 className="text-tv-4xl font-bold text-primary mb-2 tracking-tight">
          Karaoke Box
        </h1>
        <p className="text-tv-lg text-muted-foreground">
          Digite o número da música para iniciar
        </p>
        
        {/* Status da conexão USB */}
        <USBStatus />
      </header>
      
      {/* Área principal */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Player de vídeo */}
        <div className="lg:flex-1">
          <VideoPlayer />
          
          {/* Exibir campo de pesquisa apenas quando não estiver reproduzindo */}
          {(!currentSong || playerState !== "playing") && (
            <div className="mt-6 flex justify-center">
              <SearchBar />
            </div>
          )}
        </div>
        
        {/* Fila de músicas */}
        <div className="lg:w-1/3">
          <SongQueue />
        </div>
      </div>
      
      {/* Instruções para o controle remoto */}
      <div className="fixed bottom-4 left-4 bg-card/80 p-3 rounded-lg text-tv-sm">
        <p>Tecla ➡️ para pular música</p>
      </div>
      
      {/* Componente de avaliação de desempenho */}
      <PerformanceRating />
      
      {/* Componente invisível para navegação via controle remoto */}
      <KeyboardNavigation />
      
      {/* Componente de ajuda */}
      <HelpOverlay />
    </div>
  );
};

// Componente que envolve toda a aplicação com o Provider
export const KaraokeApp: React.FC = () => {
  return (
    <KaraokeProvider>
      <KaraokeContent />
    </KaraokeProvider>
  );
};
