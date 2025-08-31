<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Angebote</h1>
        <p class="mt-1 text-sm text-gray-600">
          Verwalten Sie Ihre Angebote und Kostenvoranschläge
        </p>
      </div>
      <router-link
        to="/quotes/new"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 backdrop-blur-sm"
      >
        <PlusIcon class="h-4 w-4 mr-2" />
        Neues Angebot
      </router-link>
    </div>

    <!-- Quotes List -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Angebote werden geladen...</div>
    </div>

    <div v-else-if="quotes.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
      <div class="text-gray-500 mb-4">Noch keine Angebote erstellt</div>
      <router-link
        to="/quotes/new"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        <PlusIcon class="h-4 w-4 mr-2" />
        Erstes Angebot erstellen
      </router-link>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="quote in quotes" :key="quote.id">
          <div class="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusClasses(quote.status)">
                      {{ getStatusText(quote.status) }}
                    </span>
                  </div>
                  <div class="ml-4 flex-1 min-w-0">
                    <div class="flex items-center">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        Angebot #{{ quote.quoteNumber }}
                      </p>
                      <p class="ml-2 text-sm text-gray-500">
                        {{ quote.customer.company || `${quote.customer.firstName} ${quote.customer.lastName}` }}
                      </p>
                    </div>
                    <div class="mt-1 flex items-center text-sm text-gray-500">
                      <p>
                        Erstellt: {{ formatDate(quote.date) }}
                      </p>
                      <span class="mx-2">•</span>
                      <p>
                        Gültig bis: {{ formatDate(quote.validUntil) }}
                      </p>
                      <span class="mx-2">•</span>
                      <p class="font-medium text-gray-900">
                        {{ formatCurrency(quote.totalGross) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <button
                  @click="$router.push(`/quotes/${quote.id}`)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Ansehen
                </button>
                <button
                  @click="$router.push(`/quotes/${quote.id}/edit`)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Bearbeiten
                </button>
                <button
                  @click="downloadQuotePDF(quote)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                  </svg>
                  PDF
                </button>
                <button
                  @click="deleteQuote(quote.id)"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { quoteAPI, settingsAPI } from '@/services/api'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { onMounted, ref } from 'vue'

interface Quote {
  id: string
  quoteNumber: number
  date: string
  validUntil: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  totalNet: number
  totalTax: number
  totalGross: number
  customer: {
    id: string
    company?: string
    firstName: string
    lastName: string
  }
}

const quotes = ref<Quote[]>([])
const companySettings = ref<any>(null)
const loading = ref(true)

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'SENT':
      return 'bg-blue-100 text-blue-800'
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800'
    case 'DECLINED':
      return 'bg-red-100 text-red-800'
    case 'EXPIRED':
      return 'bg-yellow-100 text-yellow-800'
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
    case 'ACCEPTED':
      return 'Angenommen'
    case 'DECLINED':
      return 'Abgelehnt'
    case 'EXPIRED':
      return 'Abgelaufen'
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

const loadQuotes = async () => {
  try {
    quotes.value = await quoteAPI.getAll()
  } catch (error) {
    console.error('Error loading quotes:', error)
    alert('Fehler beim Laden der Angebote')
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

const deleteQuote = async (id: string) => {
  if (confirm('Sind Sie sicher, dass Sie dieses Angebot löschen möchten?')) {
    try {
      await quoteAPI.delete(id)
      quotes.value = quotes.value.filter(quote => quote.id !== id)
    } catch (error) {
      console.error('Error deleting quote:', error)
      alert('Fehler beim Löschen des Angebots')
    }
  }
}

const downloadQuotePDF = async (quote: any) => {
  try {
    const blob = await quoteAPI.downloadPDF(quote.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Angebot_${quote.quoteNumber}.pdf`
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
  Promise.all([loadQuotes(), loadSettings()])
})
</script>
