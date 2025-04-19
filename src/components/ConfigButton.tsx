
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Folder, ChevronRight, ChevronLeft, HardDrive, Settings } from "lucide-react";
import { listStorageDirectories } from "@/lib/tv-box-utils";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner"; // Fixed import from "sonner"
import { useToast } from "./ui/use-toast";

interface DirectoryItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

export const ConfigButton = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadDirectories = async (path: string) => {
    try {
      setIsLoading(true);
      const dirs = await listStorageDirectories(path);
      setDirectories(dirs);
    } catch (error) {
      console.error("Erro ao listar diretórios:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar esta pasta",
        variant: "destructive"
      });
      // Em caso de erro, volte a um caminho mais seguro
      if (pathHistory.length > 0) {
        navigateBack();
      } else {
        // Caso esteja já na raiz, carregue opções padrão
        setDirectories([
          { name: "storage", path: "/storage", isDirectory: true },
          { name: "sdcard", path: "/sdcard", isDirectory: true },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDirectories(currentPath);
  }, [currentPath]);

  const navigateToDirectory = (path: string) => {
    setPathHistory(prev => [...prev, currentPath]);
    setCurrentPath(path);
  };

  const navigateBack = () => {
    const previousPath = pathHistory[pathHistory.length - 1];
    if (previousPath) {
      setPathHistory(prev => prev.slice(0, -1));
      setCurrentPath(previousPath);
    }
  };

  const selectKaraokeFolder = (path: string) => {
    // Aqui você salvaria o caminho selecionado em algum local de armazenamento persistente
    // Por exemplo, usando localStorage ou capacitor preferences
    localStorage.setItem('karaokeFolderPath', path);
    toast({
      title: "Pasta configurada",
      description: `Pasta de Karaoke definida para: ${path}`
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Selecionar Pasta do Karaoke</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={navigateBack}
              disabled={pathHistory.length === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm truncate">{currentPath}</span>
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <p>Carregando...</p>
              </div>
            ) : directories.length > 0 ? (
              directories.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 mb-1 overflow-hidden"
                    onClick={() => item.isDirectory && navigateToDirectory(item.path)}
                  >
                    {item.isDirectory ? (
                      <Folder className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <HardDrive className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.name}</span>
                    {item.isDirectory && <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0" />}
                  </Button>
                  
                  {item.isDirectory && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => selectKaraokeFolder(item.path)}
                      className="flex-shrink-0"
                    >
                      Selecionar
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p>Pasta vazia ou sem permissão de acesso</p>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
