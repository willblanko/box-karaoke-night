
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useToast } from '@/components/ui/use-toast';

export function useStoragePermission() {
  const [hasStoragePermission, setHasStoragePermission] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  const checkPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Em ambiente web, simulamos que já temos permissão
      setHasStoragePermission(true);
      setIsChecking(false);
      return true;
    }

    try {
      setIsChecking(true);
      
      // Tenta acessar o diretório para ver se temos permissão
      await Filesystem.readdir({
        path: '/storage',
        directory: Directory.ExternalStorage
      });
      
      console.log('Permissão de armazenamento verificada com sucesso');
      setHasStoragePermission(true);
      setIsChecking(false);
      return true;
    } catch (error) {
      console.error('Erro ao verificar permissões de armazenamento:', error);
      setHasStoragePermission(false);
      setIsChecking(false);
      return false;
    }
  };

  // Solicita permissão explicitamente
  const requestPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      // Android API >= 30 (Android 11+) requer uma abordagem diferente para permissão de armazenamento
      // Para Android < 30, essa tentativa de acesso deve disparar a solicitação de permissão
      await Filesystem.readdir({
        path: '/storage',
        directory: Directory.ExternalStorage
      });
      
      toast({
        title: "Permissão concedida",
        description: "Acesso ao armazenamento permitido"
      });
      
      setHasStoragePermission(true);
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão de armazenamento:', error);
      
      toast({
        title: "Permissão negada",
        description: "É necessário permitir o acesso ao armazenamento",
        variant: "destructive"
      });
      
      return false;
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    hasStoragePermission,
    isChecking,
    checkPermissions,
    requestPermission
  };
}
