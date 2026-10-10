import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep heavy standalone libraries in separate chunks to keep initial bundle light
            if (id.includes('@vladmandic/face-api')) return 'vendor-faceapi';
            if (id.includes('monaco-editor') || id.includes('@monaco-editor')) return 'vendor-monaco';
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html2pdf')) return 'vendor-pdf';
            // Do NOT isolate recharts from react to avoid circular forwardRef initialization issues
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
