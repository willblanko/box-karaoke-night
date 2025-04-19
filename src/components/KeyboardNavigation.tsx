
import React, { useEffect } from "react";
import { useKaraoke } from "@/context/KaraokeContext";

/**
 * Componente que gerencia a navegação por teclado/controle remoto
 * Detecta teclas de direção para navegação na interface
 */
export const KeyboardNavigation: React.FC = () => {
  const { skipSong, searchInput, setSearchInput, searchSongByNumber } = useKaraoke();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Teclas de navegação para controle remoto
      switch (e.key) {
        case "ArrowRight":
          // Avançar música (pular)
          skipSong();
          break;
          
        case "Enter":
          // Confirmar entrada do número da música
          if (searchInput) {
            searchSongByNumber(searchInput);
          }
          break;
          
        case "Backspace":
          // Apagar último dígito
          if (searchInput.length > 0) {
            setSearchInput(searchInput.slice(0, -1));
          }
          break;
          
        // Teclas numéricas para entrada rápida
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          // Limitar a entrada a 5 dígitos para evitar números muito grandes
          if (searchInput.length < 5) {
            setSearchInput(searchInput + e.key);
          }
          break;
          
        default:
          break;
      }
    };

    // Adicionar listener para teclas
    window.addEventListener("keydown", handleKeyDown);
    
    // Remover listener na desmontagem
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [skipSong, searchInput, setSearchInput, searchSongByNumber]);

  // Este componente não renderiza nada visualmente
  return null;
};
