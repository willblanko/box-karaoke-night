
import React from "react";
import { KaraokeApp } from "./KaraokeApp";
import { StoragePermissionRequest } from "./StoragePermissionRequest";
import { useStoragePermissionContext } from "@/context/StoragePermissionContext";
import { Capacitor } from '@capacitor/core';

export const PermissionAwareKaraokeApp: React.FC = () => {
  const { hasStoragePermission, isChecking } = useStoragePermissionContext();

  // Em ambiente web, sempre permitir acesso sem a tela de permissão
  if (!Capacitor.isNativePlatform()) {
    return <KaraokeApp />;
  }

  // Sempre renderizamos o KaraokeApp, mas adicionamos a tela de permissão por cima quando necessário
  return (
    <>
      <KaraokeApp />
      {!hasStoragePermission && !isChecking && <StoragePermissionRequest />}
    </>
  );
};
