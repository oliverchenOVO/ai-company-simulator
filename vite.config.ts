import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), {
    name: 'hosted-csp',
    transformIndexHtml(html) {
      // Sites' Cloudflare protection injects changing inline scripts. Only the
      // hosted build permits these; offline Electron retains its strict CSP.
      return mode === 'hosted' ? html.replace("script-src 'self';", "script-src 'self' 'unsafe-inline';") : html;
    }
  }],
  base: './', worker: { format: 'es' },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: { outDir: mode === 'hosted' ? 'out' : 'dist', emptyOutDir: true }
}));
