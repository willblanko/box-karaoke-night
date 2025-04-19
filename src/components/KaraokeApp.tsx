
import React from "react";
import { SearchBar } from "@/components/SearchBar";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SongQueue } from "@/components/SongQueue";
import { PerformanceRating } from "@/components/PerformanceRating";
import { KeyboardNavigation } from "@/components/KeyboardNavigation";
import { HelpOverlay } from "@/components/HelpOverlay";
import { USBStatus } from "@/components/USBStatus";
import { ConfigButton } from "@/components/ConfigButton";
import { KaraokeProvider, useKaraoke } from "@/context/KaraokeContext";
import { SongConfirmationDialog } from "@/components/SongConfirmationDialog";

// Separate KaraokeContent component that uses the context
const KaraokeContent: React.FC = () => {
  const { playerState, currentSong } = useKaraoke();

  return (
    <div className="min-h-screen w-full bg-background flex flex-col p-6 lg:p-8 gap-6">
      <header className="text-center mb-4">
        <h1 className="text-tv-4xl font-bold text-primary mb-2 tracking-tight">
          Karaoke Box
        </h1>
        <p className="text-tv-lg text-muted-foreground">
          Digite o número da música para iniciar
        </p>
        
        <USBStatus />
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-1">
          <VideoPlayer />
          
          {(!currentSong || playerState !== "playing") && (
            <div className="mt-6 flex justify-center">
              <SearchBar />
            </div>
          )}
        </div>
        
        <div className="lg:w-1/3">
          <SongQueue />
        </div>
      </div>
      
      <div className="fixed bottom-4 left-4 bg-card/80 p-3 rounded-lg text-tv-sm">
        <p>Tecla ➡️ para pular música</p>
      </div>
      
      <PerformanceRating />
      <KeyboardNavigation />
      <HelpOverlay />
      <SongConfirmationDialog />
      <ConfigButton />
    </div>
  );
};

// Main component that wraps everything with the KaraokeProvider
export const KaraokeApp: React.FC = () => {
  return (
    <KaraokeProvider>
      <KaraokeContent />
    </KaraokeProvider>
  );
};
