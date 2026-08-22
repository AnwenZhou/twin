import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vitePluginCompression from 'vite-plugin-compression';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    vitePluginCompression({
      threshold: 1024 * 10,
    }),
  ],
  resolve: {
    alias: {
      '@': `${resolve(process.cwd(), 'src')}`,
    },
    dedupe: ['react', 'react-dom', 'three'],
  },
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      '@takram/three-atmosphere',
      '@takram/three-atmosphere/r3f',
      '@takram/three-clouds',
      '@takram/three-clouds/r3f',
      '@takram/three-geospatial',
      'postprocessing',
    ],
  },
  assetsInclude: ['**/*.exr', '**/*.bin'],
  server: {
    open: true,
    port: 9000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://120.79.8.215:5980/api',
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // Cloudflare Workers serves from site root.
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          post: ['postprocessing', '@react-three/postprocessing'],
          atmosphere: [
            '@takram/three-atmosphere',
            '@takram/three-clouds',
            '@takram/three-geospatial',
          ],
        },
      },
    },
  },
});
