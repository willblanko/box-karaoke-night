import React, { useRef, useEffect } from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { formatTimeDisplay } from "@/lib/karaoke-utils";
import { Capacitor } from '@capacitor/core';
import { Button } from "./ui/button";
import { Pause, Play, RotateCcw } from "lucide-react";

export const VideoPlayer: React.FC = () => {
  const { currentSong, playerState, setPlayerState } = useKaraoke();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const skipTriggeredRef = useRef(false);

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
      if (!skipTriggeredRef.current) {
        setPlayerState("ended");
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
        }
      }
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("durationchange", handleDurationChange);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("durationchange", handleDurationChange);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [setPlayerState]);

  useEffect(() => {
    if (playerState === 'playing') {
      skipTriggeredRef.current = false;
    }
  }, [playerState]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (currentSong) {
      console.log("Carregando vídeo:", currentSong.title, currentSong.videoPath);
      
      let videoPath = currentSong.videoPath;
      
      if (Capacitor.isNativePlatform()) {
        console.log("Usando caminho nativo:", videoPath);
      } else {
        console.log("AMBIENTE WEB: Usando vídeo de amostra para simulação");
        videoPath = `/sample-videos/${currentSong.id}.mp4`;
        
        const fallbackVideo = "/sample-videos/sample-karaoke.mp4";
        
        fetch(videoPath)
          .then(response => {
            if (!response.ok) {
              console.log(`Vídeo específico não encontrado, usando fallback: ${fallbackVideo}`);
              videoElement.src = fallbackVideo;
              videoElement.load();
            }
          })
          .catch(() => {
            console.log(`Erro ao verificar vídeo, usando fallback: ${fallbackVideo}`);
            videoElement.src = fallbackVideo;
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
          });
      }
    } else {
      videoElement.src = "";
    }
  }, [currentSong, playerState, setPlayerState]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayerState('playing');
    } else {
      video.pause();
      setPlayerState('paused');
    }
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = 0;
    video.play();
    setPlayerState('playing');
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
        
        <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent p-4">
          <h2 className="text-tv-xl font-bold text-white">{currentSong.title}</h2>
          <p className="text-tv-base text-white/90">{currentSong.artist}</p>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handlePlayPause}
              >
                {playerState === 'playing' ? <Pause size={24} /> : <Play size={24} />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleRestart}
              >
                <RotateCcw size={24} />
              </Button>
            </div>
            
            <p className="text-tv-sm text-white/80">
              Música #{currentSong.id}
            </p>
          </div>
          
          <div className="flex justify-between items-center mb-1">
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
