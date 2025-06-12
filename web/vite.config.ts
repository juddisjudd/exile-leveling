import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command, mode }) => {
  const isElectronDev =
    process.env.NODE_ENV === "development" && process.env.ELECTRON === "true";
  const isElectronBuild =
    mode === "production" && process.env.ELECTRON === "true";

  console.log("Vite config:", {
    command,
    mode,
    isElectronDev,
    isElectronBuild,
  });

  let base = "/exile-leveling/";

  if (isElectronDev || isElectronBuild) {
    base = "./";
  }

  return {
    base,
    server: {
      host: true,
      port: 5173,
      strictPort: true,
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      rollupOptions: {
        output: {
          ...(isElectronBuild && {
            entryFileNames: "assets/[name]-[hash].js",
            chunkFileNames: "assets/[name]-[hash].js",
            assetFileNames: "assets/[name]-[hash].[ext]",
          }),
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            icons: ["react-icons"],
            state: ["recoil"],
            utils: ["classnames", "d3", "pako"],
          },
        },
      },
    },
    define: {
      __IS_ELECTRON__: JSON.stringify(isElectronBuild || isElectronDev),
      __VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        disable: isElectronBuild || isElectronDev,
        manifest: {
          name: "Exile Leveling",
          short_name: "Exile Leveling",
          description:
            "Exile Leveling is a Path of Exile leveling guide with Path of Building integration",
          theme_color: "#000000",
          background_color: "#000000",
          start_url: "./",
          display: "standalone",
          orientation: "portrait-primary",
          icons: [
            {
              src: "android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          skipWaiting: !isElectronBuild,
          clientsClaim: !isElectronBuild,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "recoil",
        "classnames",
      ],
      exclude: ["electron"],
    },
    css: {
      modules: {
        generateScopedName: "[name]__[local]___[hash:base64:5]",
      },
    },
  };
});
