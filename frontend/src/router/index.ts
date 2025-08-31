import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: '/customers',
          name: 'Customers',
          component: () => import('@/views/CustomersView.vue')
        },
        {
          path: '/customers/new',
          name: 'NewCustomer',
          component: () => import('@/views/CustomerFormView.vue')
        },
        {
          path: '/customers/:id',
          name: 'CustomerDetail',
          component: () => import('@/views/CustomerDetailView.vue')
        },
        {
          path: '/customers/:id/edit',
          name: 'CustomerEdit',
          component: () => import('@/views/CustomerFormView.vue')
        },
        {
          path: '/invoices',
          name: 'Invoices',
          component: () => import('@/views/InvoicesView.vue')
        },
        {
          path: '/invoices/new',
          name: 'NewInvoice',
          component: () => import('@/views/InvoiceFormView.vue')
        },
        {
          path: '/invoices/:id',
          name: 'InvoiceDetail',
          component: () => import('@/views/InvoiceDetailView.vue')
        },
        {
          path: '/invoices/:id/edit',
          name: 'InvoiceEdit',
          component: () => import('@/views/InvoiceFormView.vue')
        },
        {
          path: '/quotes',
          name: 'Quotes',
          component: () => import('@/views/QuotesView.vue')
        },
        {
          path: '/quotes/new',
          name: 'NewQuote',
          component: () => import('@/views/QuoteFormView.vue')
        },
        {
          path: '/quotes/:id',
          name: 'QuoteDetail',
          component: () => import('@/views/QuoteDetailView.vue')
        },
        {
          path: '/quotes/:id/edit',
          name: 'QuoteEdit',
          component: () => import('@/views/QuoteFormView.vue')
        },
        {
          path: '/settings',
          name: 'Settings',
          component: () => import('@/views/SettingsView.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
