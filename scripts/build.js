const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔨 Building production version...");

try {
  console.log("📦 Building web application for Electron...");
  execSync("pnpm run build", {
    cwd: "web",
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      ELECTRON: "true",
    },
  });

  console.log("⚡ Building electron application...");
  execSync("pnpm exec tsc -p electron/tsconfig.json", { stdio: "inherit" });

  console.log("📋 Copying web build...");
  const webDistPath = path.join(__dirname, "..", "web", "dist");
  const electronRendererPath = path.join(__dirname, "..", "dist", "renderer");

  if (fs.existsSync(electronRendererPath)) {
    fs.rmSync(electronRendererPath, { recursive: true });
  }
  fs.mkdirSync(electronRendererPath, { recursive: true });

  if (process.platform === "win32") {
    execSync(`xcopy "${webDistPath}" "${electronRendererPath}" /E /I /H /Y`, {
      stdio: "inherit",
    });
  } else {
    execSync(`cp -r "${webDistPath}/"* "${electronRendererPath}/"`, {
      stdio: "inherit",
    });
  }

  const indexPath = path.join(electronRendererPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `index.html not found at ${indexPath}. Web build may have failed.`
    );
  }
  console.log("✅ index.html found at:", indexPath);

  console.log("🎨 Copying assets...");
  const assetsSourcePath = path.join(__dirname, "..", "assets");
  const assetsDestPath = path.join(__dirname, "..", "dist", "assets");

  if (fs.existsSync(assetsDestPath)) {
    fs.rmSync(assetsDestPath, { recursive: true });
  }

  if (fs.existsSync(assetsSourcePath)) {
    fs.mkdirSync(assetsDestPath, { recursive: true });
    if (process.platform === "win32") {
      execSync(`xcopy "${assetsSourcePath}" "${assetsDestPath}" /E /I /H /Y`, {
        stdio: "inherit",
      });
    } else {
      execSync(`cp -r "${assetsSourcePath}/"* "${assetsDestPath}/"`, {
        stdio: "inherit",
      });
    }
  }

  console.log("✅ Build complete!");
  console.log("📂 Built files:");
  console.log("   - Electron: dist/electron/");
  console.log("   - Renderer: dist/renderer/");
  console.log("   - Assets: dist/assets/");

  console.log("📋 Renderer contents:");
  const rendererFiles = fs.readdirSync(electronRendererPath);
  rendererFiles.forEach((file) => {
    console.log(`   - ${file}`);
  });
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
