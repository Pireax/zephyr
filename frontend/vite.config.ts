import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.gltf', '**/*.bin'],
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
