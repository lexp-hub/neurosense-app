import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_OLLAMAFREE_PROXY_TARGET || 'http://127.0.0.1:8000';

  return {
    plugins: [react()],
    base: '/neurosense-app/',
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
              return 'ui-vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      host: true,
      proxy: {
        '/api/ollama-free': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ollama-free/, ''),
        },
      },
    },
  };
});
