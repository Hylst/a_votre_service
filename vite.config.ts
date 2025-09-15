import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    hmr: true
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'À Votre Service - Outils Utilitaires',
        short_name: 'À Votre Service',
        description: 'Une collection d\'outils utilitaires pour simplifier votre quotidien - calculatrices, convertisseurs et plus encore',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        lang: 'fr',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['productivity', 'utilities', 'business'],
        shortcuts: [
          {
            name: 'Calculatrice',
            short_name: 'Calc',
            description: 'Calculatrice avancée',
            url: '/?tool=calculator',
            icons: [{ src: 'pwa-192x192.png', sizes: '96x96' }]
          },
          {
            name: 'Convertisseur',
            short_name: 'Convert',
            description: 'Convertisseur d\'unités',
            url: '/?tool=converter',
            icons: [{ src: 'pwa-192x192.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }) => {
                    return `${request.url}?version=1`;
                  }
                }
              ]
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-popover', '@radix-ui/react-progress', '@radix-ui/react-scroll-area', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-slider', '@radix-ui/react-slot', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'chart-vendor': ['recharts'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'math-vendor': ['mathjs'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority', 'lucide-react'],
          // Tool components chunks for better lazy loading
          'calculator-tools': ['src/components/tools/Calculator.tsx', 'src/components/tools/CalculatorImproved.tsx'],
          'productivity-tools': ['src/components/tools/ProductivitySuiteModular.tsx', 'src/components/tools/TodoListEnhanced.tsx'],
          'health-tools': ['src/components/tools/HealthWellnessSuite.tsx', 'src/components/tools/BMICalculator.tsx'],
          'text-tools': ['src/components/tools/TextUtilsAdvanced.tsx'],
          'unit-tools': ['src/components/tools/UnitConverter.tsx'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
}));
