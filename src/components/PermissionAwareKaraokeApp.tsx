
import React from "react";
import { KaraokeApp } from "./KaraokeApp";
import { StoragePermissionRequest } from "./StoragePermissionRequest";
import { useStoragePermissionContext } from "@/context/StoragePermissionContext";

export const PermissionAwareKaraokeApp: React.FC = () => {
  const { hasStoragePermission, isChecking } = useStoragePermissionContext();

  return (
    <>
      <KaraokeApp />
      <StoragePermissionRequest />
    </>
  );
};
