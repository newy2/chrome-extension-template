import { defineConfig } from "vite";
import { resolve } from "path";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.ts"),
        background: resolve(__dirname, "src/background.ts")
      },
      output: {
        entryFileNames: "[name].js"
      },
      plugins: [
        terser({
          compress: true,
          mangle: true,
          format: {
            comments: false
          }
        })
      ]
    },
    outDir: "dist"
  }
});
