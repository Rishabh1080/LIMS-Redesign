import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['unfeloniously-noncranking-deja.ngrok-free.dev'],
  },
});
