
import React, { useRef, useEffect } from "react";
import { useKaraoke } from "@/context/KaraokeContext";
import { formatTimeDisplay } from "@/lib/karaoke-utils";

export const VideoPlayer: React.FC = () => {
  const { currentSong, playerState, setPlayerState } = useKaraoke();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

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
      // Sair do modo de tela cheia quando o vídeo terminar
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
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
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (currentSong) {
      console.log("Carregando vídeo:", currentSong.title, currentSong.videoPath);
      
      // Em um ambiente de desenvolvimento/teste, use um vídeo de exemplo
      // Em produção, usaríamos o caminho real do vídeo
      const videoPath = currentSong.videoPath || "https://example.com/sample-video.mp4";
      
      // Substituir com um vídeo real para testes
      const testVideo = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      videoElement.src = testVideo;
      videoElement.load();
      
      if (playerState === "playing") {
        console.log("Tentando reproduzir vídeo");
        videoElement.play()
          .then(() => {
            console.log("Vídeo reproduzindo com sucesso!");
            // Em um aplicativo de TV real, você pode querer ativar tela cheia
            videoElement.requestFullscreen()
              .catch(err => console.error("Erro ao entrar em tela cheia:", err));
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
