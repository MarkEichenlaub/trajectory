import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const page = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: page('index.html'),
        miroCalc: page('miro-calc/index.html'),
        miroCalcPanel: page('miro-calc/panel.html'),
      },
      output: {
        // Stable vendor chunk: app-code deploys don't invalidate the cached
        // React/Supabase bytes.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('katex')) return 'katex'
            if (id.includes('mathjs')) return 'mathjs'
            return 'vendor'
          }
        },
      },
    },
  },
})
