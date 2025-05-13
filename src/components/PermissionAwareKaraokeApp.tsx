
import React from "react";
import { KaraokeApp } from "./KaraokeApp";
import { StoragePermissionRequest } from "./StoragePermissionRequest";
import { useStoragePermissionContext } from "@/context/StoragePermissionContext";

export const PermissionAwareKaraokeApp: React.FC = () => {
  const { hasStoragePermission, isChecking } = useStoragePermissionContext();

  // Sempre renderizamos o KaraokeApp, mas adicionamos a tela de permissão por cima quando necessário
  return (
    <>
      <KaraokeApp />
      {!hasStoragePermission && !isChecking && <StoragePermissionRequest />}
    </>
  );
};
