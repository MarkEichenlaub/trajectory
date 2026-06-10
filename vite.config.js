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
    },
  },
})
