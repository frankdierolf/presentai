// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: false,
  build: {
    transpile: ['pocketbase', 'debug', 'micromark']
  },
  vite: {
    optimizeDeps: {
      exclude: ['debug', 'micromark'],
      force: true  // Force re-bundling
    },
    ssr: {
      noExternal: ['debug', 'micromark', '@nuxtjs/mdc']
    },
    resolve: {
      alias: {
        // Redirect debug imports to a stub
        'debug': fileURLToPath(new URL('./plugins/debug-stub.js', import.meta.url))
      }
    },
    define: {
      // Provide fallback for debug module
      'process.env.DEBUG': '""'
    }
  },
  modules: [
    '@nuxt/ui',
    // '@nuxt/eslint', // Disabled for Nixpacks compatibility - causes oxc-parser issues
    '@formkit/auto-animate/nuxt',
    '@nuxtjs/mdc',
  ],
  runtimeConfig: {
    public: {
      pocketbaseUrl: process.env.POCKETBASE_URL,
      // adding these limits in frontend just to show errors
      // since pocketbase is not returning any errors for view collection rules
      freeLimits: {
        notes: 10,
        tasks: 10,
        files: 10,
        chats: 10,
      },
    },
  },
  fonts: {
    families: [
      {
        name: 'Bricolage Grotesque',
        provider: 'Google',
        weights: ['700'],
      },
      {
        name: 'Geist',
        provider: 'google',
        weights: ['400', '500', '600', '700', '800'],
      },
      {
        name: 'Geist Mono',
        provider: 'google',
        weights: ['400', '500', '600', '700', '800'],
      },
    ],
  },
  css: ['~/assets/css/main.css'],
  mdc: {
    headings: {
      anchorLinks: false,
    },
    highlight: {
      langs: [
        'ts',
        'js',
        'html',
        'css',
        'json',
        'md',
        'yaml',
        'bash',
        'css',
        'py',
        'tsx',
        'jsx',
        'go',
        'rust',
        'java',
        'kotlin',
        'swift',
        'csharp',
      ],
    },
  },
  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-11-27',
});
