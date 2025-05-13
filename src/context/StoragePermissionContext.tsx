
import React, { createContext, useContext, ReactNode } from 'react';
import { useStoragePermission } from '@/hooks/useStoragePermission';

interface StoragePermissionContextType {
  hasStoragePermission: boolean;
  isChecking: boolean;
  checkPermissions: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
}

const StoragePermissionContext = createContext<StoragePermissionContextType | undefined>(undefined);

export function StoragePermissionProvider({ children }: { children: ReactNode }) {
  const permissionUtils = useStoragePermission();

  return (
    <StoragePermissionContext.Provider value={permissionUtils}>
      {children}
    </StoragePermissionContext.Provider>
  );
}

export function useStoragePermissionContext() {
  const context = useContext(StoragePermissionContext);
  if (context === undefined) {
    throw new Error('useStoragePermissionContext deve ser usado dentro de StoragePermissionProvider');
  }
  return context;
}
