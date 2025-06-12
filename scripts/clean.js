const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function forceRemoveDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Directory doesn't exist: ${dirPath}`);
    return;
  }

  console.log(`🗑️ Removing: ${dirPath}`);

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Successfully removed: ${dirPath}`);
  } catch (error) {
    console.log(`⚠️ Normal removal failed, trying force removal...`);

    try {
      if (process.platform === "win32") {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: "inherit" });
      } else {
        execSync(`rm -rf "${dirPath}"`, { stdio: "inherit" });
      }
      console.log(`✅ Force removal successful: ${dirPath}`);
    } catch (forceError) {
      console.error(`❌ Failed to remove ${dirPath}:`, forceError.message);
      console.log(
        `💡 Try manually deleting the directory or restart your IDE/terminal`
      );
    }
  }
}

function killElectronProcesses() {
  console.log("🔄 Killing any running Electron processes...");

  try {
    if (process.platform === "win32") {
      execSync("taskkill /f /im electron.exe", { stdio: "ignore" });
      execSync('taskkill /f /im "PoE Leveling Overlay.exe"', {
        stdio: "ignore",
      });
    } else {
      execSync("pkill -f electron", { stdio: "ignore" });
      execSync('pkill -f "PoE Leveling Overlay"', { stdio: "ignore" });
    }
  } catch (error) {}
}

console.log("🧹 Starting enhanced cleanup...");

killElectronProcesses();

setTimeout(() => {
  const projectRoot = path.join(__dirname, "..");

  const dirsToClean = [
    path.join(projectRoot, "dist"),
    path.join(projectRoot, "release"),
    path.join(projectRoot, "web", "dist"),
    path.join(projectRoot, "web", "node_modules", ".vite"),
    path.join(projectRoot, "node_modules", ".cache"),
  ];

  dirsToClean.forEach((dir) => forceRemoveDir(dir));

  console.log("✅ Enhanced cleanup complete!");
  console.log("💡 You can now run: pnpm run build && pnpm run dist:portable");
}, 1000);
