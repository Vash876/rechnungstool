<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Rechnungen
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <router-link
          to="/invoices/new"
          class="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Neue Rechnung
        </router-link>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="relative rounded-md shadow-sm">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          placeholder="Rechnungen suchen..."
        />
      </div>
      
      <select
        v-model="statusFilter"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
      >
        <option value="">Alle Status</option>
        <option value="DRAFT">Entwurf</option>
        <option value="SENT">Versendet</option>
        <option value="PAID">Bezahlt</option>
        <option value="OVERDUE">Überfällig</option>
      </select>
    </div>

    <!-- Invoice List -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200">
        <li v-for="invoice in filteredInvoices" :key="invoice.id">
          <div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <DocumentTextIcon class="h-8 w-8 text-gray-400" />
                </div>
                <div class="ml-4">
                  <div class="flex items-center">
                    <p class="text-sm font-medium text-gray-900">
                      Rechnung #{{ invoice.invoiceNumber.toString().padStart(5, '0') }}
                    </p>
                    <span
                      :class="[
                        'ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getStatusClasses(invoice.status)
                      ]"
                    >
                      {{ getStatusText(invoice.status) }}
                    </span>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between sm:items-end">
                    <div class="sm:flex sm:items-center">
                      <p class="flex items-center text-sm text-gray-500">
                        {{ invoice.customer.company || `${invoice.customer.firstName} ${invoice.customer.lastName}` }}
                      </p>
                      <p class="mt-2 flex items-center text-sm text-gray-500 sm:ml-8 sm:mt-0">
                        {{ formatDate(invoice.date) }}
                      </p>
                    </div>
                    <div class="mt-3 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-8">
                      <p class="text-lg font-semibold text-gray-900">
                        {{ formatCurrency(invoice.totalGross) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <button
                  @click="viewInvoice(invoice.id)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Ansehen
                </button>
                <button
                  @click="editInvoice(invoice.id)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Bearbeiten
                </button>
                <button
                  @click="downloadInvoicePDF(invoice)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                  </svg>
                  PDF
                </button>
                <button
                  @click="deleteInvoice(invoice.id)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
      
      <!-- Empty State -->
      <div v-if="filteredInvoices.length === 0" class="text-center py-12">
        <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">Keine Rechnungen</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery ? 'Keine Rechnungen gefunden.' : 'Erstellen Sie Ihre erste Rechnung.' }}
        </p>
        <div v-if="!searchQuery" class="mt-6">
          <router-link
            to="/invoices/new"
            class="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Neue Rechnung
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { invoiceAPI, settingsAPI } from '@/services/api'
import { DocumentTextIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

interface InvoiceListItem {
  id: string
  invoiceNumber: number
  date: string
  dueDate?: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  totalNet: number
  totalTax: number
  totalGross: number
  taxRate: number
  notes?: string
  customer: {
    id: string
    company?: string
    firstName: string
    lastName: string
  }
  items?: any[]
}

const router = useRouter()
const invoices = ref<InvoiceListItem[]>([])
const companySettings = ref<any>(null)
const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)

const filteredInvoices = computed(() => {
  let filtered = invoices.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(invoice => {
      const customerName = (invoice.customer.company || `${invoice.customer.firstName} ${invoice.customer.lastName}`).toLowerCase()
      const invoiceNumber = invoice.invoiceNumber.toString()
      return customerName.includes(query) || invoiceNumber.includes(query)
    })
  }

  if (statusFilter.value) {
    filtered = filtered.filter(invoice => invoice.status === statusFilter.value)
  }

  return filtered
})

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'SENT':
      return 'bg-blue-100 text-blue-800'
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'OVERDUE':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'Entwurf'
    case 'SENT':
      return 'Versendet'
    case 'PAID':
      return 'Bezahlt'
    case 'OVERDUE':
      return 'Überfällig'
    default:
      return status
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE')
}

const formatCurrency = (amount: number) => {
  const currency = companySettings.value?.currency || 'EUR'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

const loadInvoices = async () => {
  try {
    loading.value = true
    invoices.value = await invoiceAPI.getAll()
  } catch (error) {
    console.error('Error loading invoices:', error)
  } finally {
    loading.value = false
  }
}

const loadSettings = async () => {
  try {
    companySettings.value = await settingsAPI.get()
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const viewInvoice = (id: string) => {
  router.push(`/invoices/${id}`)
}

const editInvoice = (id: string) => {
  router.push(`/invoices/${id}/edit`)
}

const deleteInvoice = async (id: string) => {
  if (!confirm('Sind Sie sicher, dass Sie diese Rechnung löschen möchten?')) {
    return
  }
  
  try {
    await invoiceAPI.delete(id)
    await loadInvoices()
  } catch (error) {
    console.error('Error deleting invoice:', error)
  }
}

const downloadInvoicePDF = async (invoice: any) => {
  try {
    const blob = await invoiceAPI.downloadPDF(invoice.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Rechnung_${invoice.invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF-Download fehlgeschlagen:', error)
    alert('PDF-Download fehlgeschlagen. Bitte versuchen Sie es erneut.')
  }
}

onMounted(() => {
  Promise.all([loadInvoices(), loadSettings()])
})
</script>
