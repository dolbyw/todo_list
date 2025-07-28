import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Inspector from 'unplugin-vue-dev-locator/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/todo_list/' : '/',
  publicDir: 'public',
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  plugins: [
    vue(),
    Inspector(),
    VitePWA({
      strategies: 'injectManifest',
      swSrc: 'public/sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png', 'browserconfig.xml'],
      manifest: {
        name: 'Todo App - 待办事项管理',
        short_name: 'Todo App',
        description: '简洁、美观、流畅的待办事项管理工具，支持离线使用和WebDAV同步',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'any',
        scope: process.env.NODE_ENV === 'production' ? '/todo_list/' : '/',
        start_url: process.env.NODE_ENV === 'production' ? '/todo_list/' : '/',
        categories: ['productivity', 'utilities'],
        shortcuts: [
          {
            name: '新建待办',
            short_name: '新建',
            description: '快速创建一个新的待办事项',
            url: '/new',
            icons: [{ src: '/icons/new-task.png', sizes: '192x192' }]
          }
        ],
        screenshots: [
          {
            src: '/screenshots/screenshot1.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/screenshots/screenshot2.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        icons: [
          {
            src: '/favicon.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/dav.jianguoyun.com\/dav\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'webdav-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ 定义 @ = src
    },
  },
  assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf', '**/*.otf'],
})
