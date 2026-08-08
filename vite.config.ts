import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function serverEnvFromDotenv(): Plugin {
  const apply = (mode: string) => {
    const env = loadEnv(mode, process.cwd(), "");
    for (const [key, value] of Object.entries(env)) {
      if (key.startsWith("VITE_")) continue;
      if (value === undefined || value === "") continue;
      if (process.env[key] === undefined) process.env[key] = value;
    }
  };

  return {
    name: "pathwise-server-env",
    enforce: "pre",
    config(_, { mode }) {
      apply(mode);
    },
    configureServer() {
      apply(process.env["NODE_ENV"] === "production" ? "production" : "development");
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: {
    host: true,
    port: 8080,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  plugins: [
    serverEnvFromDotenv(),
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    // Host detects preset (Vercel → vercel, local/CI can override).
    nitro(),
    viteReact(),
  ],
});
