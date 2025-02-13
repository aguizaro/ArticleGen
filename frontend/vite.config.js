import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: "index.html",
                gallery: "gallery.html",
            },
        },
    },
    server: {
        hmr: true, // hot module replacement
    },
});
