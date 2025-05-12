
import React, { useRef, useEffect } from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { formatTimeDisplay } from "@/lib/karaoke-utils";
import { Capacitor } from '@capacitor/core';
import { Button } from "./ui/button";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Filesystem } from '@capacitor/filesystem';
import { toast } from "@/components/ui/use-toast";

export const VideoPlayer: React.FC = () => {
  const { 
    currentSong, 
    playerState, 
    setPlayerState,
    karaokeFolderPath
  } = useKaraoke();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [videoError, setVideoError] = React.useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setPlayerState("ended");
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error("Erro no vídeo:", e);
      setVideoError(true);
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("durationchange", handleDurationChange);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError as any);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("durationchange", handleDurationChange);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError as any);
    };
  }, [setPlayerState]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (currentSong) {
      // Reset error state on new song
      setVideoError(false);
      
      console.log("Carregando vídeo:", currentSong.title);
      console.log("Pasta de karaoke configurada:", karaokeFolderPath);
      
      let videoPath = '';
      
      if (Capacitor.isNativePlatform()) {
        // No Android, usamos o caminho completo para o arquivo de vídeo
        videoPath = `${karaokeFolderPath}/${currentSong.id}.mp4`;
        console.log("Tentando carregar vídeo de:", videoPath);
        
        // Verificação se o arquivo existe (apenas para log)
        Filesystem.stat({
          path: videoPath
        }).then(() => {
          console.log("Arquivo de vídeo encontrado no caminho:", videoPath);
        }).catch(err => {
          console.error("Arquivo de vídeo não encontrado:", err);
          toast({
            title: "Erro",
            description: `Arquivo de vídeo não encontrado: ${currentSong.id}.mp4`,
            variant: "destructive"
          });
        });
      } else {
        // Em ambiente web, usamos o caminho para a pasta de amostra
        videoPath = `/sample-videos/${currentSong.id}.mp4`;
        
        console.log("AMBIENTE WEB: Usando vídeo de amostra para simulação");
        
        // Verificação se o arquivo de amostra existe
        fetch(videoPath)
          .then(response => {
            if (!response.ok) {
              console.log("Vídeo específico não encontrado, usando fallback");
              videoElement.src = "/sample-videos/sample-karaoke.mp4";
              videoElement.load();
            }
          })
          .catch(() => {
            console.log("Erro ao verificar vídeo, usando fallback");
            videoElement.src = "/sample-videos/sample-karaoke.mp4";
            videoElement.load();
          });
      }
      
      videoElement.src = videoPath;
      videoElement.load();
      
      if (playerState === "playing") {
        console.log("Tentando reproduzir vídeo");
        videoElement.play()
          .then(() => {
            console.log("Vídeo reproduzindo com sucesso!");
            if (Capacitor.isNativePlatform()) {
              videoElement.requestFullscreen()
                .catch(err => console.error("Erro ao entrar em tela cheia:", err));
            }
          })
          .catch(err => {
            console.error("Erro ao reproduzir vídeo:", err);
            setPlayerState("idle");
            setVideoError(true);
          });
      } else if (playerState === "paused") {
        videoElement.pause();
      }
    } else {
      videoElement.src = "";
      setVideoError(false);
    }
  }, [currentSong, playerState, setPlayerState, karaokeFolderPath]);

  // Update video state when playerState changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (playerState === 'playing' && video.paused) {
      video.play().catch(console.error);
    } else if (playerState === 'paused' && !video.paused) {
      video.pause();
    }
  }, [playerState]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playerState === 'playing') {
      video.pause();
      setPlayerState('paused');
    } else {
      video.play().catch(console.error);
      setPlayerState('playing');
    }
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = 0;
    video.play().catch(console.error);
    setPlayerState('playing');
    setVideoError(false);
  };

  if (!currentSong) {
    return (
      <div className="w-full aspect-video bg-card/40 flex items-center justify-center rounded-lg">
        <p className="text-tv-xl text-muted-foreground">Digite o número da música</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full aspect-video bg-black"
          controls={false}
        />
        
        {videoError && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="text-red-400 mb-4">Erro ao carregar o vídeo</p>
            <Button variant="outline" onClick={handleRestart} className="text-white">
              Tentar novamente
            </Button>
          </div>
        )}
        
        <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent p-4">
          <h2 className="text-tv-xl font-bold text-white">{currentSong.title}</h2>
          <p className="text-tv-base text-white/90">{currentSong.artist}</p>
          <p className="text-tv-sm text-white/80 mt-1">
            Música #{currentSong.id}
          </p>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex justify-center items-center mb-2 gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleRestart}
            >
              <RotateCcw size={24} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 h-12 w-12"
              onClick={handlePlayPause}
            >
              {playerState === 'playing' ? <Pause size={28} /> : <Play size={28} />}
            </Button>
          </div>
          
          <div className="flex justify-between items-center mb-1 mt-2">
            <p className="text-tv-sm text-white/90">
              {formatTimeDisplay(currentTime, duration)}
            </p>
          </div>
          
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
