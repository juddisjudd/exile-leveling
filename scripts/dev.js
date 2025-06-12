const { spawn } = require("child_process");

console.log("🚀 Starting Exile Leveling Overlay Development...\n");

console.log("📦 Starting web development server...");
const webProcess = spawn("pnpm", ["run", "dev"], {
  cwd: "web",
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: "development",
    ELECTRON: "true",
  },
});

setTimeout(() => {
  console.log("🖥️ Starting Electron...");
  const electronProcess = spawn("pnpm", ["exec", "electron", "."], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "development",
      ELECTRON: "true",
    },
  });

  const cleanup = () => {
    console.log("\n🛑 Shutting down...");
    webProcess.kill();
    electronProcess.kill();
    process.exit();
  };

  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
  process.on("exit", cleanup);
}, 3000);
