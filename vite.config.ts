import react from "@vitejs/plugin-react";
import {resolve} from "path";
import {defineConfig} from "vite";
import svgr from "vite-plugin-svgr";

const root = resolve(__dirname, 'src');

export default defineConfig((args) => ({
    plugins: [svgr(), react()],
    root: root,
    build: {
        outDir: resolve(__dirname, 'build'),
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                background: resolve(root, "background/index.ts"),
                popup: resolve(root, "popup.html")
            },
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js"
            }
        }
    }
}));
