
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Folder, ChevronRight, ChevronLeft } from "lucide-react";
import { listStorageDirectories } from "@/lib/tv-box-utils";
import { ScrollArea } from "./ui/scroll-area";

interface DirectoryItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

export const ConfigButton = () => {
  const [currentPath, setCurrentPath] = useState<string>('/storage');
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  const loadDirectories = async (path: string) => {
    const dirs = await listStorageDirectories(path);
    setDirectories(dirs);
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full"
        >
          <Folder className="h-6 w-6" />
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
            {directories.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start gap-2 mb-1"
                onClick={() => item.isDirectory && navigateToDirectory(item.path)}
              >
                <Folder className="h-4 w-4" />
                <span className="truncate">{item.name}</span>
                {item.isDirectory && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Button>
            ))}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
