
import React, { useEffect } from "react";
import { KaraokeApp } from "./KaraokeApp";
import { StoragePermissionRequest } from "./StoragePermissionRequest";
import { useStoragePermissionContext } from "@/context/StoragePermissionContext";

export const PermissionAwareKaraokeApp: React.FC = () => {
  const { hasStoragePermission, isChecking } = useStoragePermissionContext();

  // Renderizamos a aplicação principal mesmo sem permissão, 
  // mas também mostramos o modal de permissão quando necessário
  return (
    <>
      <KaraokeApp />
      {!hasStoragePermission && <StoragePermissionRequest />}
    </>
  );
};
