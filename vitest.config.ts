import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Use JSDOM for browser-like environment
    globals: true, // Expose Vitest APIs globally
    setupFiles: './vitest.setup.ts', // Setup file for @testing-library/jest-dom
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Test file patterns
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'], // Exclude common directories
    testTimeout: 10000, // Increase timeout for API tests
    coverage: {
      enabled: false, // Disable coverage by default
      reporter: ['text', 'json', 'html']
    },
    // Override environment for specific test files
    environmentMatchGlobs: [
      ['app/api/**', 'node'], // Run API tests in Node.js environment
      ['lib/api/**', 'node'] // Run lib API tests in Node.js environment
    ],
    alias: {
      // Configure path aliases to match your tsconfig.json
      '@/components': path.resolve(__dirname, './components'),
      '@/context': path.resolve(__dirname, './context'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/app': path.resolve(__dirname, './app'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/types': path.resolve(__dirname, './types')
      // Add other aliases as needed
    }
  },
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './components'),
      '@/context': path.resolve(__dirname, './context'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/app': path.resolve(__dirname, './app'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/types': path.resolve(__dirname, './types')
    }
  }
});
