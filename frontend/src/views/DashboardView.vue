<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-600">
        Überblick über Ihre Rechnungen und Kunden
      </p>
    </div>

    <!-- Stats -->
    <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div v-for="i in 4" :key="i" class="bg-white overflow-hidden shadow rounded-lg animate-pulse">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gray-300 rounded-md"></div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <div class="h-4 bg-gray-300 rounded mb-2"></div>
              <div class="h-5 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">K</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Kunden
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.customers }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">R</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Rechnungen
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.invoices }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">A</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Angebote
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.quotes }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">€</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Offene Beträge
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ formatCurrency(stats.openAmount) }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white shadow rounded-lg p-6 mb-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Schnellaktionen</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <router-link
          to="/customers/new"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          Neuer Kunde
        </router-link>
        <router-link
          to="/invoices/new"
          class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Neue Rechnung
        </router-link>
        <router-link
          to="/quotes/new"
          class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Neues Angebot
        </router-link>
        <router-link
          to="/settings"
          class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Einstellungen
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Letzte Aktivitäten</h2>
      </div>
      <div v-if="loading" class="px-6 py-4">
        <div v-for="i in 3" :key="i" class="flex items-center py-3 animate-pulse">
          <div class="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-300 rounded mb-1"></div>
            <div class="h-3 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
      <div v-else-if="recentActivities.length === 0" class="px-6 py-4">
        <p class="text-gray-500 text-center py-8">
          Noch keine Aktivitäten vorhanden.
          <br>
          Erstellen Sie Ihren ersten Kunden oder Ihre erste Rechnung!
        </p>
      </div>
      <div v-else class="divide-y divide-gray-200">
        <div v-for="activity in recentActivities" :key="activity.id" class="px-6 py-4 hover:bg-gray-50">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                   :class="getActivityIconClass(activity.type)">
                {{ getActivityIcon(activity.type) }}
              </div>
            </div>
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">
                  {{ activity.title }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatDate(activity.date) }}
                </p>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{ activity.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { customerAPI, invoiceAPI, quoteAPI } from '@/services/api'
import { onMounted, ref } from 'vue'

interface Invoice {
  id: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  totalGross: number
  invoiceNumber: number
  date: string
  customer: {
    company?: string
    firstName: string
    lastName: string
  }
}

interface Quote {
  id: string
  quoteNumber: number
  date: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  customer: {
    company?: string
    firstName: string
    lastName: string
  }
}

interface Customer {
  id: string
  company?: string
  firstName: string
  lastName: string
  createdAt: string
}

interface Activity {
  id: string
  type: 'invoice' | 'quote' | 'customer'
  title: string
  description: string
  date: string
}

const stats = ref({
  customers: 0,
  invoices: 0,
  quotes: 0,
  openAmount: 0
})

const recentActivities = ref<Activity[]>([])
const loading = ref(true)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Heute'
  } else if (diffDays === 1) {
    return 'Gestern'
  } else if (diffDays < 7) {
    return `vor ${diffDays} Tagen`
  } else {
    return date.toLocaleDateString('de-DE')
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'invoice': return 'R'
    case 'quote': return 'A'
    case 'customer': return 'K'
    default: return '•'
  }
}

const getActivityIconClass = (type: string) => {
  switch (type) {
    case 'invoice': return 'bg-green-500'
    case 'quote': return 'bg-yellow-500'
    case 'customer': return 'bg-primary-500'
    default: return 'bg-gray-500'
  }
}

const generateActivities = (customers: Customer[], invoices: Invoice[], quotes: Quote[]) => {
  const activities: Activity[] = []

  // Add recent customers (last 5)
  customers
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .forEach(customer => {
      activities.push({
        id: `customer-${customer.id}`,
        type: 'customer',
        title: 'Neuer Kunde erstellt',
        description: `${customer.company || `${customer.firstName} ${customer.lastName}`} wurde hinzugefügt`,
        date: customer.createdAt
      })
    })

  // Add recent invoices (last 5)
  invoices
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .forEach(invoice => {
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        title: `Rechnung #${invoice.invoiceNumber} erstellt`,
        description: `für ${invoice.customer.company || `${invoice.customer.firstName} ${invoice.customer.lastName}`}`,
        date: invoice.date
      })
    })

  // Add recent quotes (last 5)
  quotes
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .forEach(quote => {
      activities.push({
        id: `quote-${quote.id}`,
        type: 'quote',
        title: `Angebot #${quote.quoteNumber} erstellt`,
        description: `für ${quote.customer.company || `${quote.customer.firstName} ${quote.customer.lastName}`}`,
        date: quote.date
      })
    })

  // Sort all activities by date (newest first) and take top 10
  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
}

const loadStats = async () => {
  try {
    loading.value = true
    
    // Parallel API calls for better performance
    const [customers, invoices, quotes] = await Promise.all([
      customerAPI.getAll(),
      invoiceAPI.getAll(),
      quoteAPI.getAll()
    ])

    // Calculate open amount (unpaid invoices)
    const openAmount = (invoices as Invoice[])
      .filter((invoice: Invoice) => invoice.status !== 'PAID')
      .reduce((sum: number, invoice: Invoice) => sum + Number(invoice.totalGross), 0)

    stats.value = {
      customers: customers.length,
      invoices: invoices.length,
      quotes: quotes.length,
      openAmount: openAmount
    }

    // Generate recent activities
    recentActivities.value = generateActivities(customers, invoices, quotes)
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
    // Keep default values on error
    stats.value = {
      customers: 0,
      invoices: 0,
      quotes: 0,
      openAmount: 0
    }
    recentActivities.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>
