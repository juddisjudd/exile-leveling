import { contextBridge, ipcRenderer } from "electron";

export interface ElectronAPI {
  toggleOverlay: () => Promise<void>;
  setOpacity: (opacity: number) => Promise<void>;
  getOverlayState: () => Promise<any>;
}

const electronAPI: ElectronAPI = {
  toggleOverlay: () => ipcRenderer.invoke("toggle-overlay"),
  setOpacity: (opacity: number) => ipcRenderer.invoke("set-opacity", opacity),
  getOverlayState: () => ipcRenderer.invoke("get-overlay-state"),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
