import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/pin-yin-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['sumi-landscape.jpeg', 'icons/*.png'],
      manifest: {
        name: '拼音',
        short_name: '拼音',
        description: '漢字から拼音へ変換するアプリ',
        theme_color: '#2E4C5E',
        background_color: '#DDE4EA',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/pin-yin-app/',
        icons: [
          { src: '/pin-yin-app/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
          { src: '/pin-yin-app/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
          { src: '/pin-yin-app/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
          { src: '/pin-yin-app/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pin-yin-app/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,jpeg,jpg,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
})
