// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  vite: {
    server: {
      middlewareMode: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000
      }
    },
    ssr: {
      noExternal: ['axios']
    }
  },
  nitro: {
    prerender: {
      crawlLinks: false
    }
  },
  app: {
    head: {
      title: 'MathSplainer - Understand Math Step by Step',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Learn mathematics with AI-powered step-by-step explanations' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css' }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
          async: true,
          id: 'MathJax-script'
        },
        {
          innerHTML: `
            MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                processEscapes: true
              },
              svg: {
                fontCache: 'global',
                scale: 1.1
              },
              startup: {
                pageReady: () => {
                  return MathJax.typesetPromise().catch(() => {});
                }
              }
            };
          `,
          type: 'text/javascript',
          async: false
        }
      ]
    }
  },
  runtimeConfig: {
    openrouterApiKey: '',
    openrouterModel: 'openai/o1-mini',
    public: {
      apiBaseUrl: ''
    }
  }
})
