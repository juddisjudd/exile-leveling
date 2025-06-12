export interface ElectronAPI {
  toggleOverlay: () => Promise<void>;
  setOpacity: (opacity: number) => Promise<void>;
  getOverlayState: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}