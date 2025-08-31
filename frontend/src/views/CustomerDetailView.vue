<template>
  <div v-if="loading" class="flex justify-center items-center h-64">
    <div class="text-gray-500">Kunde wird geladen...</div>
  </div>

  <div v-else-if="customer" class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <button
        @click="$router.push('/customers')"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-2" />
        Zurück zu Kunden
      </button>
      
      <div class="flex space-x-2">
        <button
          @click="editCustomer"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PencilIcon class="h-4 w-4 mr-2" />
          Bearbeiten
        </button>
        <button
          @click="createInvoice"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          <DocumentTextIcon class="h-4 w-4 mr-2" />
          Rechnung erstellen
        </button>
        <button
          @click="createQuote"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          <DocumentDuplicateIcon class="h-4 w-4 mr-2" />
          Angebot erstellen
        </button>
      </div>
    </div>

    <!-- Customer Info Card -->
    <div class="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
      <div class="px-6 py-8">
        <!-- Customer Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ customer.company || `${customer.firstName} ${customer.lastName}` }}
            </h1>
            <div class="mt-2 flex items-center">
              <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                Aktiv
              </span>
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-sm text-gray-500">
              Kunde seit: {{ formatDate(customer.createdAt) }}
            </div>
          </div>
        </div>

        <!-- Customer Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Contact Info -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Kontaktinformationen
            </h3>
            <div class="space-y-3">
              <div v-if="customer.company">
                <dt class="text-sm font-medium text-gray-500">Unternehmen</dt>
                <dd class="text-sm text-gray-900">{{ customer.company }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Name</dt>
                <dd class="text-sm text-gray-900">{{ customer.firstName }} {{ customer.lastName }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">E-Mail</dt>
                <dd class="text-sm text-gray-900">
                  <a :href="`mailto:${customer.email}`" class="text-primary-600 hover:text-primary-500">
                    {{ customer.email }}
                  </a>
                </dd>
              </div>
              <div v-if="customer.phone">
                <dt class="text-sm font-medium text-gray-500">Telefon</dt>
                <dd class="text-sm text-gray-900">
                  <a :href="`tel:${customer.phone}`" class="text-primary-600 hover:text-primary-500">
                    {{ customer.phone }}
                  </a>
                </dd>
              </div>
            </div>
          </div>

          <!-- Address Info -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Adresse
            </h3>
            <div class="space-y-1">
              <div v-if="customer.address" class="text-sm text-gray-900">{{ customer.address }}</div>
              <div v-if="customer.city" class="text-sm text-gray-900">
                {{ customer.postalCode }} {{ customer.city }}
              </div>
              <div v-if="customer.country" class="text-sm text-gray-900">{{ customer.country }}</div>
              <div v-if="!customer.address && !customer.city" class="text-sm text-gray-500 italic">
                Keine Adresse hinterlegt
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Aktivitäten</h3>
      </div>
      <div class="px-6 py-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Statistics Cards -->
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ invoiceStats.total }}</div>
            <div class="text-sm text-gray-500">Rechnungen gesamt</div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ formatCurrency(invoiceStats.totalAmount) }}</div>
            <div class="text-sm text-gray-500">Gesamtumsatz</div>
          </div>
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ invoiceStats.pending }}</div>
            <div class="text-sm text-gray-500">Offene Rechnungen</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Invoices -->
    <div v-if="recentInvoices.length > 0" class="mt-8 bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Letzte Rechnungen</h3>
          <button
            @click="$router.push('/invoices')"
            class="text-sm text-primary-600 hover:text-primary-500"
          >
            Alle anzeigen
          </button>
        </div>
      </div>
      <div class="overflow-hidden">
        <ul class="divide-y divide-gray-200">
          <li v-for="invoice in recentInvoices" :key="invoice.id" class="px-6 py-4 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium text-gray-900">
                  Rechnung #{{ invoice.invoiceNumber.toString().padStart(5, '0') }}
                </div>
                <div class="text-sm text-gray-500">{{ formatDate(invoice.date) }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{{ formatCurrency(invoice.totalGross) }}</div>
                <div class="text-xs text-gray-500">{{ getStatusText(invoice.status) }}</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <div class="text-gray-500">Kunde nicht gefunden</div>
    <button
      @click="$router.push('/customers')"
      class="mt-4 text-primary-600 hover:text-primary-500"
    >
      Zurück zu Kunden
    </button>
  </div>
</template>

<script setup lang="ts">
import { customerAPI, invoiceAPI } from '@/services/api'
import {
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Customer {
  id: string
  firstName: string
  lastName: string
  company?: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  createdAt: string
}

interface Invoice {
  id: string
  invoiceNumber: number
  date: string
  status: string
  totalGross: number
}

const route = useRoute()
const router = useRouter()
const customer = ref<Customer | null>(null)
const recentInvoices = ref<Invoice[]>([])
const loading = ref(true)

const invoiceStats = computed(() => {
  const total = recentInvoices.value.length
  const totalAmount = recentInvoices.value.reduce((sum, inv) => sum + inv.totalGross, 0)
  const pending = recentInvoices.value.filter(inv => inv.status !== 'PAID').length
  
  return { total, totalAmount, pending }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'Entwurf'
    case 'SENT': return 'Versendet'
    case 'PAID': return 'Bezahlt'
    case 'OVERDUE': return 'Überfällig'
    default: return status
  }
}

const loadCustomer = async () => {
  try {
    const id = route.params.id as string
    customer.value = await customerAPI.getById(id)
  } catch (error) {
    console.error('Error loading customer:', error)
  }
}

const loadRecentInvoices = async () => {
  try {
    const id = route.params.id as string
    const allInvoices = await invoiceAPI.getAll()
    // Filter invoices for this customer and get last 5
    recentInvoices.value = allInvoices
      .filter((invoice: any) => invoice.customer?.id === id)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  } catch (error) {
    console.error('Error loading recent invoices:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([loadCustomer(), loadRecentInvoices()])
  } finally {
    loading.value = false
  }
}

const editCustomer = () => {
  router.push(`/customers/${customer.value?.id}/edit`)
}

const createInvoice = () => {
  // TODO: Navigate to invoice creation with pre-selected customer
  router.push('/invoices')
}

const createQuote = () => {
  // TODO: Navigate to quote creation with pre-selected customer
  router.push('/quotes')
}

onMounted(() => {
  loadData()
})
</script>
