import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

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
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [serverEnvFromDotenv()],
  },
});
