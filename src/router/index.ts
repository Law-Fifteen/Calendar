import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'calendar',
      component: () => import('@/views/CalendarView.vue')
    },
    {
      path: '/calendly-callback',
      name: 'calendly-callback',
      component: () => import('@/views/CalendlyCallback.vue')
    },
    {
      path: '/google-callback',
      name: 'google-callback',
      component: () => import('@/views/GoogleCallback.vue')
    }
  ]
})

export default router
