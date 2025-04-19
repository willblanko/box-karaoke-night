
import React, { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { useKaraoke } from "@/context/KaraokeContext";

export const SearchBar = () => {
  const { searchInput, setSearchInput, searchSongByNumber } = useKaraoke();
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aceitar apenas digitos numéricos
    const value = e.target.value.replace(/\D/g, '');
    setSearchInput(value);
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput) {
      console.log(`Buscando música pelo número: ${searchInput}`);
      
      // Prevenir comportamento padrão do formulário
      e.preventDefault();
      
      // Busca a música SOMENTE quando Enter é pressionado
      const song = searchSongByNumber(searchInput);
      if (!song) {
        setError("Música não encontrada");
      }
      
      // Não limpar o input imediatamente, isso será feito quando a música for confirmada
      // ou cancelada no diálogo de confirmação
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
