
import React from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Music, Play, X } from "lucide-react";

export const SongConfirmationDialog: React.FC = () => {
  const { pendingSong, confirmAndPlaySong, cancelPendingSong } = useKaraoke();
  
  return (
    <AlertDialog open={pendingSong !== null} onOpenChange={(open) => {
      if (!open && pendingSong) {
        // Se o diálogo foi fechado pelo Escape ou clicando fora, tratamos como cancelamento
        cancelPendingSong();
      }
    }}>
      <AlertDialogContent className="bg-card/95 border-primary/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-tv-2xl flex items-center gap-2">
            <Music className="h-6 w-6" />
            Música Encontrada
          </AlertDialogTitle>
          <AlertDialogDescription className="text-tv-lg">
            Deseja tocar esta música agora?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {pendingSong && (
          <div className="my-4 p-4 bg-background/80 rounded-lg">
            <h3 className="text-tv-xl font-bold text-primary">{pendingSong.title}</h3>
            <p className="text-tv-lg text-foreground/80">{pendingSong.artist}</p>
            <p className="text-tv-base text-muted-foreground mt-2">
              Música #{pendingSong.id}
            </p>
          </div>
        )}
        
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            onClick={cancelPendingSong} 
            className="text-tv-base flex items-center gap-1"
          >
            <X size={18} /> Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmAndPlaySong}
            className="bg-primary text-tv-base flex items-center gap-1"
          >
            <Play size={18} /> Tocar Agora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
