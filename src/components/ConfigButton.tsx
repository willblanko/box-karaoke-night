
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Folder, ChevronRight, ChevronLeft, HardDrive, Settings, Usb, Home } from "lucide-react";
import { listStorageDirectories } from "@/lib/tv-box-utils";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "./ui/use-toast";
import { Capacitor } from "@capacitor/core";
import { useKaraoke } from "@/context/KaraokeContext";

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
  const { isUSBConnected, loadSongsFromUSB } = useKaraoke();

  const loadDirectories = async (path: string) => {
    try {
      setIsLoading(true);
      console.log(`Tentando listar diretórios em: ${path}`);
      
      const dirs = await listStorageDirectories(path);
      console.log(`Diretórios encontrados: ${dirs.length}`, dirs);
      
      setDirectories(dirs);
    } catch (error) {
      console.error("Erro ao listar diretórios:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar esta pasta. Verifique as permissões.",
        variant: "destructive"
      });
      
      // Em caso de erro, volte a um caminho mais seguro
      if (pathHistory.length > 0) {
        navigateBack();
      } else {
        setDirectories([
          { name: "Dispositivos USB", path: "/__usb_devices__", isDirectory: true },
          { name: "Armazenamento Interno", path: "/storage/emulated/0", isDirectory: true },
          { name: "storage", path: "/storage", isDirectory: true },
          { name: "sdcard", path: "/sdcard", isDirectory: true }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar os diretórios ao montar o componente
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Em ambiente Android, mostrar opções reais de armazenamento
      if (isUSBConnected) {
        setCurrentPath('/__usb_devices__');
      } else {
        setCurrentPath('/storage/emulated/0');  // Comece com o armazenamento principal no Android
      }
    } else {
      // Em ambiente web, mostrar um aviso
      toast({
        title: "Ambiente Web",
        description: "Acesso real ao sistema de arquivos não disponível em ambiente web",
      });
      setCurrentPath('/');
    }
  }, [isUSBConnected]); 

  // Carregar diretórios sempre que o caminho atual mudar
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

  const navigateHome = () => {
    setPathHistory([]);
    
    // Em ambiente Android, navegue para o armazenamento interno
    if (Capacitor.isNativePlatform()) {
      setCurrentPath('/storage/emulated/0');
    } else {
      setCurrentPath('/');
    }
  };

  const navigateToUsb = () => {
    setPathHistory([]);
    setCurrentPath('/__usb_devices__');
  };

  const selectKaraokeFolder = async (path: string) => {
    localStorage.setItem('karaokeFolderPath', path);
    console.log(`Pasta de karaoke configurada: ${path}`);
    
    toast({
      title: "Pasta configurada",
      description: `Pasta de Karaoke definida para: ${path}`
    });
    
    // Recarregar as músicas depois de alterar a pasta
    try {
      await loadSongsFromUSB();
      toast({
        title: "Sucesso",
        description: "Músicas recarregadas da nova pasta"
      });
    } catch (error) {
      console.error("Erro ao recarregar músicas:", error);
      toast({
        title: "Aviso",
        description: "Não foi possível carregar músicas da pasta selecionada",
        variant: "destructive"
      });
    }
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
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                onClick={navigateBack}
                disabled={pathHistory.length === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={navigateHome}
              >
                <Home className="h-4 w-4" />
              </Button>
              
              {isUSBConnected && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigateToUsb}
                >
                  <Usb className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="ml-2 text-sm truncate bg-muted/50 px-2 py-1 rounded flex-1">
              {currentPath}
            </div>
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <p>Carregando...</p>
              </div>
            ) : directories.length > 0 ? (
              directories.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 overflow-hidden"
                    onClick={() => item.isDirectory && navigateToDirectory(item.path)}
                    disabled={!item.isDirectory}
                  >
                    {item.path === '/__usb_devices__' ? (
                      <Usb className="h-4 w-4 flex-shrink-0" />
                    ) : item.isDirectory ? (
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
