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
    {
      path: '/completion',
      name: 'completion',
      component: () => import('@/views/CompletionView.vue'),
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsView.vue'),
    },
  ],
})

export default router
