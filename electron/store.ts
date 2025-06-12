import Store from "electron-store";

interface OverlaySettings {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  opacity: number;
  isVisible: boolean;
  hotkeys: {
    toggle: string;
    increaseOpacity: string;
    decreaseOpacity: string;
  };
}

const schema = {
  bounds: {
    type: "object",
    properties: {
      x: { type: "number", default: 100 },
      y: { type: "number", default: 100 },
      width: { type: "number", default: 400 },
      height: { type: "number", default: 600 },
    },
    default: { x: 100, y: 100, width: 400, height: 600 },
  },
  opacity: {
    type: "number",
    minimum: 0.1,
    maximum: 1.0,
    default: 0.9,
  },
  isVisible: {
    type: "boolean",
    default: true,
  },
  hotkeys: {
    type: "object",
    properties: {
      toggle: { type: "string", default: "F9" },
      increaseOpacity: { type: "string", default: "F10" },
      decreaseOpacity: { type: "string", default: "F11" },
    },
    default: {
      toggle: "F9",
      increaseOpacity: "F10",
      decreaseOpacity: "F11",
    },
  },
};

export const settingsStore = new Store<OverlaySettings>({
  name: "overlay-settings",
  schema: schema as any,
  clearInvalidConfig: true,
});
