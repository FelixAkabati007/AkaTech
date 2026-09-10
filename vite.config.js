import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Starts the Express API alongside the Vite dev server so the single-process
// preview boots the full stack. The frontend proxies /api to this process.
function apiServerPlugin(env) {
  let apiProcess;

  const start = () => {
    if (apiProcess) return;
    apiProcess = spawn("node", ["server/server.cjs"], {
      cwd: __dirname,
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    apiProcess.on("exit", (code) => {
      if (code && code !== 0) {
        console.error(`[api] server exited with code ${code}`);
      }
      apiProcess = undefined;
    });
  };

  const stop = () => {
    if (apiProcess) {
      apiProcess.kill();
      apiProcess = undefined;
    }
  };

  return {
    name: "akatech-api-server",
    apply: "serve",
    configureServer() {
      start();
      process.once("exit", stop);
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    },
    closeBundle: stop,
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const googleClientId = env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID;

  return {
  define: {
    "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(googleClientId || ""),
  },
  plugins: [react(), apiServerPlugin(env)],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./AkaTech_Components"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
  server: {
    host: true,
    port: 5173,
    // Keep the browser origin stable so Google OAuth does not alternate
    // between localhost:5173 and localhost:5174 when the port is busy.
    strictPort: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Referrer-Policy": "no-referrer-when-downgrade",
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
      },
      "/socket.io": {
        target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "framer-motion"],
          ui: ["lucide-react", "clsx", "tailwind-merge"],
          spline: ["@splinetool/react-spline", "@splinetool/runtime"],
          pdf: ["jspdf"],
          realtime: ["socket.io-client"],
          utils: ["date-fns", "idb"],
        },
      },
    },
    chunkSizeWarningLimit: 3000,
  },
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: "./vitest.setup.js",
      css: true,
    },
  };
});
