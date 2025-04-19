
import React, { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useKaraoke } from "@/context/KaraokeContext";

export const SearchBar = () => {
  const { searchInput, setSearchInput, searchSongByNumber } = useKaraoke();
  const [error, setError] = useState<string | null>(null);
  const inputProcessedRef = useRef<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Verificar se o evento já foi processado para evitar duplicação
    if (inputProcessedRef.current) {
      inputProcessedRef.current = false;
      return;
    }

    // Marcar como processado para evitar processamento duplicado
    inputProcessedRef.current = true;
    
    // Aceitar apenas digitos numéricos
    const value = e.target.value.replace(/\D/g, '');
    setSearchInput(value);
    setError(null);
    
    // Resetar a flag após o processamento
    setTimeout(() => {
      inputProcessedRef.current = false;
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput) {
      // Busca a música SOMENTE quando Enter é pressionado
      const song = searchSongByNumber(searchInput);
      if (!song) {
        setError("Música não encontrada");
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md gap-4">
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Digite o número da música"
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="text-tv-xl py-6 font-bold border-2 border-primary/70 bg-card/80 text-center"
          inputMode="numeric"
          autoFocus
        />
        
        {error && (
          <p className="text-destructive text-tv-sm mt-1 absolute left-0">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
