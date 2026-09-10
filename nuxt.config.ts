export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    supabaseServiceRoleKey: '',
    authSessionSecret: '',
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      defaultWeddingId: '00000000-0000-4000-8000-000000000001'
    }
  },
  modules: ['@nuxt/ui', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'wedding-feast',
      meta: [
        { name: 'description', content: '婚礼宾客管理与可视化排桌工具' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})
