import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function vercelApiDevPlugin(): Plugin {
  return {
    name: 'vite-plugin-vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
          const pathname = urlObj.pathname; // e.g. /api/auth/signup

          // Resolve matching file in ./api
          let relPath = pathname.substring(1); // "api/auth/signup"
          let filePath = path.resolve(__dirname, `${relPath}.ts`);

          if (!fs.existsSync(filePath)) {
            if (fs.existsSync(path.resolve(__dirname, `${relPath}/index.ts`))) {
              filePath = path.resolve(__dirname, `${relPath}/index.ts`);
            } else {
              return next();
            }
          }

          // Parse query params onto req
          const query: Record<string, string> = {};
          urlObj.searchParams.forEach((val, key) => {
            query[key] = val;
          });
          (req as any).query = query;

          // Parse request body
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
            const buffers: Uint8Array[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString('utf-8');
            if (rawBody) {
              try {
                (req as any).body = JSON.parse(rawBody);
              } catch {
                (req as any).body = rawBody;
              }
            } else {
              (req as any).body = {};
            }
          }

          // Add VercelResponse helper methods status(), json(), send() if missing
          (res as any).status = function (statusCode: number) {
            res.statusCode = statusCode;
            return res;
          };
          (res as any).json = function (data: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };
          (res as any).send = function (data: any) {
            res.end(data);
            return res;
          };

          // Load and execute serverless function handler dynamically via Vite SSR module loader
          const module = await server.ssrLoadModule(filePath);
          const handler = module.default;

          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `No default export handler in ${relPath}.ts` }));
          }
        } catch (err: any) {
          console.error('Vite API Dev Plugin Error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal API Error' }));
          }
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
