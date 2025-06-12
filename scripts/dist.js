const { execSync } = require("child_process");

console.log("📦 Creating distribution packages...");

execSync("node scripts/build.js", { stdio: "inherit" });

const platform = process.argv[2] || "win";

switch (platform) {
  case "win":
    console.log("🪟 Building Windows packages...");
    execSync("pnpm exec electron-builder --win", { stdio: "inherit" });
    break;
  case "portable":
    console.log("💼 Building Windows portable...");
    execSync("pnpm exec electron-builder --win portable", { stdio: "inherit" });
    break;
  default:
    console.log("🪟 Building for Windows (default)...");
    execSync("pnpm exec electron-builder --win", { stdio: "inherit" });
}

console.log("✅ Distribution packages created in release/ directory");
