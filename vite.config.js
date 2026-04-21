import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_AI_PROXY_TARGET || 'http://127.0.0.1:11434';
  const basePath = env.VITE_PUBLIC_BASE_PATH?.trim() || '/';

  return {
    plugins: [react()],
    base: basePath.endsWith('/') ? basePath : `${basePath}/`,
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
        '/api/ai': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          headers: {
            // Utile se vuoi forzare l'header origin per ingannare alcuni controlli base
            Origin: 'https://api.cloudflare.com'
          },
          rewrite: (path) => path.replace(/^\/api\/ai/, ''),
        },
      },
    },
  };
});
