import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sitepingApiPlugin } from './server/sitepingMiddleware.js';

export default defineConfig({
  plugins: [sitepingApiPlugin(), react()],
  server: {
    allowedHosts: ['unfeloniously-noncranking-deja.ngrok-free.dev'],
  },
});
