import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// No @vitejs/plugin-react yet: current unit tests cover pure logic
// (lib/adaptive, lib/generators), not JSX. Add the plugin back if/when a
// component test is introduced.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
  },
});
