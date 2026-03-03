import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'plans',
      component: () => import('@/views/PlansView.vue'),
    },
    {
      path: '/timer/:planId',
      name: 'timer',
      component: () => import('@/views/TimerView.vue'),
    },
  ],
})

export default router
