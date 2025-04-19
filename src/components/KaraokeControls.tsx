
import React from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const KaraokeControls: React.FC = () => {
  const { skipSong, playPrevious, queue, currentSong } = useKaraoke();

  return (
    <div className="flex justify-center items-center gap-4 p-4 bg-card/50 rounded-lg">
      <Button
        variant="outline"
        size="lg"
        className="flex items-center gap-2"
        onClick={playPrevious}
        disabled={!playPrevious}
      >
        <SkipBack size={20} /> Voltar
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
            disabled={!currentSong && queue.length === 0}
          >
            <SkipForward size={20} /> Pular
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pular música atual?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja pular para a próxima música?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={skipSong}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
