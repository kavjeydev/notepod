"use client";

import { useEffect, useState } from "react";
import { SettingsModal } from "../modals/settings-modal";

export const ModalProvider = () => {
  const [mounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  });

  if (!mounted) {
    return null;
  }
  return (
    <>
      <SettingsModal />
    </>
  );
};
