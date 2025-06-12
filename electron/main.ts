import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  screen,
  Tray,
  Menu,
  nativeImage,
  Notification,
  NativeImage,
} from "electron";
import { join } from "path";
import { existsSync } from "fs";
import { isDev } from "./utils";
import { settingsStore } from "./store";

interface OverlayState {
  isVisible: boolean;
  bounds: Electron.Rectangle;
  opacity: number;
}

class OverlayManager {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private overlayState: OverlayState;

  constructor() {
    this.overlayState = {
      isVisible: settingsStore.get("isVisible"),
      bounds: settingsStore.get("bounds"),
      opacity: settingsStore.get("opacity"),
    };
  }

  async createWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: this.overlayState.bounds.width,
      height: this.overlayState.bounds.height,
      x: this.overlayState.bounds.x,
      y: this.overlayState.bounds.y,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, "preload.js"),
        webSecurity: false,
        allowRunningInsecureContent: true,
      },
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: true,
      movable: true,
      minimizable: false,
      maximizable: false,
      closable: false,
      transparent: true,
      opacity: this.overlayState.opacity,
      focusable: true,
      show: this.overlayState.isVisible,
      icon: this.getAppIcon(),
    });

    this.mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
    this.setupWindowEvents();

    if (isDev) {
      console.log("Development mode: Loading from localhost:5173");
      try {
        await this.mainWindow.loadURL("http://localhost:5173");
        this.mainWindow.webContents.openDevTools({ mode: "detach" });
      } catch (error) {
        console.error("Failed to load dev server:", error);
        throw error;
      }
    } else {
      const rendererPath = join(__dirname, "../renderer/index.html");
      console.log("Production mode: Loading from:", rendererPath);
      console.log("File exists:", existsSync(rendererPath));

      if (!existsSync(rendererPath)) {
        const error = `Renderer file not found: ${rendererPath}`;
        console.error(error);
        throw new Error(error);
      }

      try {
        await this.mainWindow.loadFile(rendererPath);
        console.log("Successfully loaded renderer file");
      } catch (error) {
        console.error("Failed to load renderer file:", error);
        const altPath = join(
          process.resourcesPath,
          "app.asar.unpacked",
          "dist",
          "renderer",
          "index.html"
        );
        console.log("Trying alternative path:", altPath);
        if (existsSync(altPath)) {
          await this.mainWindow.loadFile(altPath);
        } else {
          throw error;
        }
      }
    }

    this.mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription, validatedURL) => {
        console.error(
          "Failed to load:",
          errorCode,
          errorDescription,
          validatedURL
        );
      }
    );

    this.mainWindow.webContents.on("crashed", () => {
      console.error("Renderer process crashed");
    });
  }

  createSystemTray(): void {
    const trayIcon = this.getAppIcon();
    this.tray = new Tray(trayIcon);
    this.tray.setToolTip("PoE Leveling Overlay");

    const contextMenu = Menu.buildFromTemplate([
      { label: "PoE Leveling Overlay", type: "normal", enabled: false },
      { type: "separator" },
      {
        label: this.overlayState.isVisible ? "Hide Overlay" : "Show Overlay",
        click: () => this.toggleVisibility(),
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          this.destroy();
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.on("click", () => this.toggleVisibility());
  }

  private getAppIcon(): NativeImage {
    const iconPaths = [
      join(__dirname, "../assets/icon.ico"),
      join(__dirname, "../assets/icon.png"),
      join(process.resourcesPath, "assets", "icon.ico"),
      join(process.resourcesPath, "assets", "icon.png"),
    ];

    for (const iconPath of iconPaths) {
      if (existsSync(iconPath)) {
        console.log("Using icon:", iconPath);
        return nativeImage.createFromPath(iconPath);
      }
    }

    console.warn("No icon found, using empty icon");
    return nativeImage.createEmpty();
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    this.mainWindow.on("moved", () => this.saveBounds());
    this.mainWindow.on("resized", () => this.saveBounds());
  }

  private saveBounds(): void {
    if (!this.mainWindow) return;

    const bounds = this.mainWindow.getBounds();
    this.overlayState.bounds = bounds;
    settingsStore.set("bounds", bounds);
  }

  toggleVisibility(): void {
    if (!this.mainWindow) return;

    this.overlayState.isVisible = !this.overlayState.isVisible;
    settingsStore.set("isVisible", this.overlayState.isVisible);

    if (this.overlayState.isVisible) {
      this.mainWindow.show();
    } else {
      this.mainWindow.hide();
    }
  }

  setOpacity(opacity: number): void {
    if (!this.mainWindow) return;

    const clampedOpacity = Math.max(0.1, Math.min(1.0, opacity));
    this.overlayState.opacity = clampedOpacity;
    settingsStore.set("opacity", clampedOpacity);
    this.mainWindow.setOpacity(clampedOpacity);
  }

  getState(): OverlayState {
    return { ...this.overlayState };
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
    if (this.mainWindow) {
      this.mainWindow.destroy();
      this.mainWindow = null;
    }
  }
}

const overlayManager = new OverlayManager();

const createWindow = async (): Promise<void> => {
  try {
    await overlayManager.createWindow();
    overlayManager.createSystemTray();
  } catch (error) {
    console.error("Failed to create window:", error);
    app.quit();
  }
};

app.whenReady().then(async () => {
  await createWindow();

  const hotkeys = settingsStore.get("hotkeys");
  const registered = globalShortcut.register(hotkeys.toggle, () => {
    overlayManager.toggleVisibility();
  });

  if (!registered) {
    console.log("Failed to register global shortcut");
  }

  globalShortcut.register(hotkeys.increaseOpacity, () => {
    const currentState = overlayManager.getState();
    overlayManager.setOpacity(currentState.opacity + 0.1);
  });

  globalShortcut.register(hotkeys.decreaseOpacity, () => {
    const currentState = overlayManager.getState();
    overlayManager.setOpacity(currentState.opacity - 0.1);
  });
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

app.on("window-all-closed", (event: Event) => {
  event.preventDefault();
});

app.on("before-quit", () => {
  globalShortcut.unregisterAll();
  overlayManager.destroy();
});

ipcMain.handle("toggle-overlay", () => {
  overlayManager.toggleVisibility();
});

ipcMain.handle("set-opacity", (_, opacity: number) => {
  overlayManager.setOpacity(opacity);
});

ipcMain.handle("get-overlay-state", () => {
  return overlayManager.getState();
});
