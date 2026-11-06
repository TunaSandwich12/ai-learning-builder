import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Lets tests resolve the same "@/..." imports as the app (see tsconfig paths).
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // "server-only" throws outside a React Server build. Tests run in Node, so use
      // the package's own no-op file.
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
});
