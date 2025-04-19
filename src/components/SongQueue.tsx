
import React from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/karaoke-utils";
import { X } from "lucide-react";

export const SongQueue: React.FC = () => {
  const { queue, removeFromQueue } = useKaraoke();

  if (queue.length === 0) {
    return (
      <div className="bg-card/50 rounded-lg p-4 text-center">
        <p className="text-tv-lg text-muted-foreground">
          Fila vazia
        </p>
        <p className="text-tv-sm text-muted-foreground">
          Digite o número de uma música para adicionar à fila
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card/50 rounded-lg p-4">
      <h3 className="text-tv-xl font-bold mb-4 text-primary">Próximas músicas</h3>
      
      <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-2">
        {queue.map((song, index) => (
          <div 
            key={`${song.id}-${index}`}
            className="flex items-center justify-between bg-background/80 rounded-md p-3 hover:bg-background group"
          >
            <div className="flex items-center">
              <span className="text-tv-lg font-bold mr-3 min-w-8 text-center">
                {index + 1}
              </span>
              <div>
                <h4 className="text-tv-base font-semibold">{song.title}</h4>
                <p className="text-tv-sm text-muted-foreground">
                  {song.artist} • #{song.id}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-tv-sm text-muted-foreground">
                {formatDuration(song.duration)}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFromQueue(index)}
              >
                <X size={18} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
