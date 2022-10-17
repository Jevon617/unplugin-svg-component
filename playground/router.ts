import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: () => import('./components/test.vue'),
      name: '手动建群',
    },
    {
      path: '/test2',
      component: () => import('./components/test2.vue'),
      name: '手动建群',
    },
  ],
})

export default router

