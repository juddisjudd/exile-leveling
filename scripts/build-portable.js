const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Building portable executable...");

function runCommand(command, options = {}) {
  console.log(`🔧 Running: ${command}`);
  try {
    execSync(command, { stdio: "inherit", ...options });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

function killProcesses() {
  console.log("🔄 Ensuring no conflicting processes...");
  try {
    if (process.platform === "win32") {
      execSync("taskkill /f /im electron.exe 2>nul", { stdio: "ignore" });
      execSync('taskkill /f /im "PoE Leveling Overlay.exe" 2>nul', {
        stdio: "ignore",
      });
    } else {
      execSync("pkill -f electron 2>/dev/null || true", { stdio: "ignore" });
    }
  } catch (error) {}
}

function cleanDirectories() {
  console.log("🧹 Cleaning build directories...");

  const dirsToClean = ["dist", "release", path.join("web", "dist")];

  dirsToClean.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`🗑️ Removing ${dir}...`);
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (error) {
        if (process.platform === "win32") {
          execSync(`rmdir /s /q "${dir}"`, { stdio: "ignore" });
        }
      }
    }
  });
}

async function main() {
  try {
    killProcesses();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    cleanDirectories();

    console.log("📦 Building application...");
    if (!runCommand("node scripts/build.js")) {
      throw new Error("Build failed");
    }

    const rendererPath = path.join("dist", "renderer", "index.html");
    if (!fs.existsSync(rendererPath)) {
      throw new Error(`Renderer not found at: ${rendererPath}`);
    }
    console.log("✅ Build verification passed");

    console.log("📱 Creating portable executable...");
    if (
      !runCommand(
        "pnpm exec electron-builder --win portable --config.compression=normal"
      )
    ) {
      throw new Error("Portable build failed");
    }

    const portableExe = path.join(
      "release",
      "PoE Leveling Overlay-1.0.0-portable.exe"
    );
    if (fs.existsSync(portableExe)) {
      const stats = fs.statSync(portableExe);
      console.log(`✅ Portable executable created: ${portableExe}`);
      console.log(`📏 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log("⚠️ Portable executable not found in expected location");
      console.log("🔍 Checking release directory...");
      const releaseFiles = fs.readdirSync("release");
      releaseFiles.forEach((file) => {
        if (file.endsWith(".exe")) {
          console.log(`   Found: ${file}`);
        }
      });
    }

    console.log("🎉 Portable build complete!");
  } catch (error) {
    console.error("❌ Portable build failed:", error.message);
    process.exit(1);
  }
}

main();
