import { useEffect, useState } from "react";

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [overlayState, setOverlayState] = useState<any>(null);

  useEffect(() => {
    const checkElectron = async () => {
      const isElectronApp =
        typeof window !== "undefined" && window.electronAPI !== undefined;
      setIsElectron(isElectronApp);

      if (isElectronApp && window.electronAPI) {
        try {
          const state = await window.electronAPI.getOverlayState();
          setOverlayState(state);
        } catch (error) {
          console.warn("Failed to get overlay state:", error);
        }
      }
    };

    checkElectron();
  }, []);

  const toggleOverlay = async () => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.toggleOverlay();
      } catch (error) {
        console.warn("Failed to toggle overlay:", error);
      }
    }
  };

  const setOpacity = async (opacity: number) => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.setOpacity(opacity);
      } catch (error) {
        console.warn("Failed to set opacity:", error);
      }
    }
  };

  return {
    isElectron,
    overlayState,
    toggleOverlay,
    setOpacity,
  };
};
