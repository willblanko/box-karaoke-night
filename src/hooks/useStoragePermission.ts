
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
  const permissionCheckCount = useRef(0);

  const checkPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Em ambiente web, simulamos que já temos permissão
      setHasStoragePermission(true);
      setIsChecking(false);
      return true;
    }

    // Limitar tentativas de verificação para evitar loops
    if (permissionCheckCount.current > 5) {
      console.log("Muitas verificações de permissão, pausando");
      setIsChecking(false);
      return false;
    }
    
    permissionCheckCount.current++;

    try {
      setIsChecking(true);
      
      // Tenta acessar o diretório para ver se temos permissão
      const result = await Filesystem.readdir({
        path: '/storage/emulated/0',
        directory: Directory.ExternalStorage
      });
      
      // Se conseguimos ler um diretório, então temos permissão
      if (result && result.files) {
        console.log('Permissão de armazenamento verificada com sucesso');
        setHasStoragePermission(true);
        setIsChecking(false);
        return true;
      } else {
        throw new Error("Diretório vazio ou inacessível");
      }
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
      
      // Tentar acessar um diretório específico para forçar a solicitação de permissão
      await Filesystem.readdir({
        path: '/storage/emulated/0',
        directory: Directory.ExternalStorage
      });
      
      // Verificar se realmente temos permissão agora
      const permissionGranted = await checkPermissions();
      
      if (permissionGranted) {
        sonnerToast.success("Permissão concedida", {
          description: "Acesso ao armazenamento permitido"
        });
        
        setHasStoragePermission(true);
        hasShownErrorToast.current = false; // Reset o flag de erro
      } else {
        throw new Error("Permissão não confirmada após solicitação");
      }
      
      return permissionGranted;
    } catch (error) {
      console.error('Erro ao solicitar permissão de armazenamento:', error);
      
      // Apenas mostra o toast de erro uma vez para evitar spam
      if (!hasShownErrorToast.current) {
        sonnerToast.error("Permissão negada", {
          description: "É necessário permitir o acesso ao armazenamento",
        });
        hasShownErrorToast.current = true;
      }
      
      setHasStoragePermission(false);
      return false;
    } finally {
      permissionRequestInProgress.current = false;
    }
  };

  useEffect(() => {
    const initialCheck = async () => {
      await checkPermissions();
    };
    
    initialCheck();
    
    // Tenta verificar novamente após um tempo
    const timer = setTimeout(() => {
      if (!hasStoragePermission && !isChecking) {
        checkPermissions();
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    hasStoragePermission,
    isChecking,
    checkPermissions,
    requestPermission
  };
}
