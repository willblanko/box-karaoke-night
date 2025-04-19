
import React, { useRef, useEffect } from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { formatTimeDisplay } from "@/lib/karaoke-utils";
import { Capacitor } from '@capacitor/core';

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
        // Sair do modo de tela cheia quando o vídeo terminar
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

  // Resetar o flag de skip quando o playerState muda
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
      
      // Use o caminho real do arquivo de vídeo da música
      let videoPath = currentSong.videoPath;
      
      if (Capacitor.isNativePlatform()) {
        // Em ambiente nativo (TV Box Android), use o caminho completo
        console.log("Usando caminho nativo:", videoPath);
      } else {
        // Em ambiente de teste web, use um vídeo de amostra com o ID da música
        console.log("AMBIENTE WEB: Usando vídeo de amostra para simulação");
        videoPath = `/sample-videos/${currentSong.id}.mp4`;
        
        // Se não encontrar o vídeo específico, tente usar um vídeo genérico local
        // Isso é apenas para testes no navegador
        const fallbackVideo = "/sample-videos/sample-karaoke.mp4";
        
        // Verificar se o vídeo específico existe
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
      
      // Define o src com o caminho do vídeo
      videoElement.src = videoPath;
      videoElement.load();
      
      if (playerState === "playing") {
        console.log("Tentando reproduzir vídeo");
        videoElement.play()
          .then(() => {
            console.log("Vídeo reproduzindo com sucesso!");
            // Em um aplicativo de TV real, você pode querer ativar tela cheia
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
        
        {/* Overlay com informações da música */}
        <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/80 to-transparent p-4">
          <h2 className="text-tv-xl font-bold text-white">{currentSong.title}</h2>
          <p className="text-tv-base text-white/90">{currentSong.artist}</p>
        </div>
        
        {/* Barra de progresso e tempo */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex justify-between items-center mb-1">
            <p className="text-tv-sm text-white/90">
              {formatTimeDisplay(currentTime, duration)}
            </p>
            <p className="text-tv-sm text-white/80">
              Música #{currentSong.id}
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
