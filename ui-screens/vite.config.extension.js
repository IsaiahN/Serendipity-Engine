import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, cpSync, existsSync, mkdirSync, rmSync } from 'fs'
import { resolve } from 'path'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

/**
 * Vite config for Chrome Extension build.
 *
 * Key differences from the PWA build:
 * - base: './' so all asset paths are relative (chrome-extension:// compatible)
 * - Output to dist-extension/
 * - Copies extension manifest.json and icons into the output
 * - No service worker bundling
 */

function copyExtensionAssets() {
  return {
    name: 'copy-extension-assets',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist-extension')

      // Copy extension manifest
      cpSync(
        resolve(__dirname, 'extension/manifest.json'),
        resolve(outDir, 'manifest.json')
      )

      // Copy popup files
      cpSync(
        resolve(__dirname, 'extension/popup.html'),
        resolve(outDir, 'popup.html')
      )
      cpSync(
        resolve(__dirname, 'extension/popup.js'),
        resolve(outDir, 'popup.js')
      )
      cpSync(
        resolve(__dirname, 'extension/popup.css'),
        resolve(outDir, 'popup.css')
      )

      // Copy icons
      const iconsOut = resolve(outDir, 'icons')
      if (!existsSync(iconsOut)) mkdirSync(iconsOut, { recursive: true })
      const iconsSrc = resolve(__dirname, 'public/icons')
      if (existsSync(iconsSrc)) {
        cpSync(iconsSrc, iconsOut, { recursive: true })
      }

      // Copy favicon
      const faviconSrc = resolve(__dirname, 'public/favicon.svg')
      if (existsSync(faviconSrc)) {
        cpSync(faviconSrc, resolve(outDir, 'favicon.svg'))
      }

      // Copy logo banner
      const logoSrc = resolve(__dirname, 'public/logo-banner.svg')
      if (existsSync(logoSrc)) {
        cpSync(logoSrc, resolve(outDir, 'logo-banner.svg'))
      }

      // Remove PWA artifacts that Vite copied from public/
      const swPath = resolve(outDir, 'sw.js')
      if (existsSync(swPath)) rmSync(swPath)
      const screenshotsPath = resolve(outDir, 'screenshots')
      if (existsSync(screenshotsPath)) rmSync(screenshotsPath, { recursive: true })

      console.log('[Extension] Assets copied to dist-extension/')
    }
  }
}

export default defineConfig({
  plugins: [react(), copyExtensionAssets()],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __IS_EXTENSION__: JSON.stringify(true),
  },
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    target: 'esnext',
    // MV3 CSP forbids inline scripts; Vite must emit external JS files
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
  },
})
