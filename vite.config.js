import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Dev server middleware plugin to serve api/proxy.js locally
 */
function localApiProxyPlugin() {
  return {
    name: 'local-api-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/proxy')) {
          try {
            const { default: handler } = await import('./api/proxy.js');
            return handler(req, res);
          } catch (err) {
            console.error('[API Proxy Middleware Error]', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localApiProxyPlugin(),
  ],
});
