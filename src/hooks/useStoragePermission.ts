
import { useEffect, useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';

export function useStoragePermission() {
  const [hasStoragePermission, setHasStoragePermission] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const permissionRequestInProgress = useRef(false);
  const hasShownErrorToast = useRef(false);

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
      setHasStoragePermission(true);
      return true;
    }

    // Evita múltiplas solicitações simultâneas
    if (permissionRequestInProgress.current) {
      console.log("Solicitação de permissão já em andamento...");
      return false;
    }

    try {
      permissionRequestInProgress.current = true;
      console.log("Solicitando permissão de armazenamento...");
      
      // Android API >= 30 (Android 11+) requer uma abordagem diferente para permissão de armazenamento
      // Para Android < 30, essa tentativa de acesso deve disparar a solicitação de permissão
      await Filesystem.readdir({
        path: '/storage',
        directory: Directory.ExternalStorage
      });
      
      // Usamos sonner toast para mensagens menos intrusivas
      sonnerToast.success("Permissão concedida", {
        description: "Acesso ao armazenamento permitido"
      });
      
      setHasStoragePermission(true);
      permissionRequestInProgress.current = false;
      hasShownErrorToast.current = false; // Reset o flag de erro
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão de armazenamento:', error);
      
      // Apenas mostra o toast de erro uma vez para evitar spam
      if (!hasShownErrorToast.current) {
        sonnerToast.error("Permissão negada", {
          description: "É necessário permitir o acesso ao armazenamento",
        });
        hasShownErrorToast.current = true;
      }
      
      permissionRequestInProgress.current = false;
      return false;
    }
  };

  useEffect(() => {
    const initialCheck = async () => {
      await checkPermissions();
    };
    
    initialCheck();
  }, []);

  return {
    hasStoragePermission,
    isChecking,
    checkPermissions,
    requestPermission
  };
}
