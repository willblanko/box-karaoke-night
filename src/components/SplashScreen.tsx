
import React, { useEffect, useState } from "react";
import { Loader2, Music } from "lucide-react";

export const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center animate-pulse">
        <Music size={80} className="text-primary mb-6" />
        <h1 className="text-tv-4xl font-bold text-primary mb-8">Karaoke Box</h1>
      </div>
      
      <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }} 
        />
      </div>
      
      <div className="mt-6 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-tv-sm text-muted-foreground">Iniciando aplicativo...</p>
      </div>
    </div>
  );
};
