import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(import.meta.dirname || __dirname),
  plugins: [react()],
  server: {
    port: 3000,
  },
});
