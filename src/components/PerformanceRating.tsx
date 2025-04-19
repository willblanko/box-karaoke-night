
import React, { useEffect } from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { Card } from "@/components/ui/card";

export const PerformanceRating: React.FC = () => {
  const { performance } = useKaraoke();

  if (!performance) return null;

  // Determinar cor da pontuação com base no valor
  const getScoreColor = () => {
    const score = performance.score;
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 50) return "text-yellow-500";
    if (score >= 30) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <Card className="animate-scale-in p-8 max-w-md w-full bg-card/95 text-center">
        <h2 className="text-tv-3xl font-bold mb-3">Avaliação</h2>
        
        <div className={`text-tv-5xl font-bold mb-6 ${getScoreColor()}`}>
          {performance.score}
        </div>
        
        <p className="text-tv-xl">{performance.message}</p>
        
        <p className="text-tv-sm text-muted-foreground mt-8">
          Próxima música iniciará automaticamente...
        </p>
      </Card>
    </div>
  );
};
