<template>
  <div v-if="loading" class="flex justify-center items-center h-64">
    <div class="text-gray-500">Angebot wird geladen...</div>
  </div>

  <div v-else-if="quote" class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <button
        @click="$router.push('/quotes')"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-2" />
        Zurück zu Angeboten
      </button>
      
      <div class="flex space-x-2">
        <button
          @click="editQuote"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PencilIcon class="h-4 w-4 mr-2" />
          Bearbeiten
        </button>
        <button
          @click="convertToInvoice"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          <DocumentDuplicateIcon class="h-4 w-4 mr-2" />
          In Rechnung umwandeln
        </button>
        <button
          @click="downloadPDF"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
          PDF herunterladen
        </button>
      </div>
    </div>

    <!-- Quote Content -->
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="px-6 py-8">
        <!-- Company Header -->
        <div v-if="companySettings" class="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
          <div class="flex items-start space-x-4">
            <img 
              v-if="companySettings.logo" 
              :src="`http://localhost:3000/api/uploads/${companySettings.logo}`" 
              :alt="companySettings.name"
              class="h-16 w-auto object-contain"
            />
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ companySettings.name }}</h2>
              <div v-if="companySettings.address" class="text-sm text-gray-600 mt-1">
                {{ companySettings.address }}
              </div>
              <div class="text-sm text-gray-600">
                <span v-if="companySettings.email">{{ companySettings.email }}</span>
                <span v-if="companySettings.phone && companySettings.email"> • </span>
                <span v-if="companySettings.phone">{{ companySettings.phone }}</span>
              </div>
              <div v-if="companySettings.website" class="text-sm text-gray-600">
                {{ companySettings.website }}
              </div>
            </div>
          </div>
          
          <div class="text-right text-sm text-gray-600">
            <div v-if="companySettings.taxNumber">Steuernr.: {{ companySettings.taxNumber }}</div>
            <div v-if="companySettings.vatId">USt-IdNr.: {{ companySettings.vatId }}</div>
          </div>
        </div>

        <!-- Header Info -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Angebot #{{ quote.quoteNumber.toString().padStart(5, '0') }}
            </h1>
            <div class="mt-2 flex items-center">
              <span
                :class="[
                  'inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                  getStatusClasses(quote.status)
                ]"
              >
                {{ getStatusText(quote.status) }}
              </span>
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(quote.totalGross) }}
            </div>
            <div class="text-sm text-gray-500">
              Gültig bis: {{ quote.validUntil ? formatDate(quote.validUntil) : 'Nicht festgelegt' }}
            </div>
          </div>
        </div>

        <!-- Customer & Quote Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Customer Info -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Angebotsnehmer
            </h3>
            <div class="text-sm text-gray-900">
              <div class="font-medium">
                {{ quote.customer.company || `${quote.customer.firstName} ${quote.customer.lastName}` }}
              </div>
              <div v-if="quote.customer.address" class="mt-1">{{ quote.customer.address }}</div>
              <div v-if="quote.customer.city">
                {{ quote.customer.postalCode }} {{ quote.customer.city }}
              </div>
              <div v-if="quote.customer.country" class="mt-1">{{ quote.customer.country }}</div>
              <div v-if="quote.customer.email" class="mt-2">{{ quote.customer.email }}</div>
              <div v-if="quote.customer.phone">{{ quote.customer.phone }}</div>
            </div>
          </div>

          <!-- Quote Info -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Angebotsdetails
            </h3>
            <div class="text-sm text-gray-900">
              <div class="flex justify-between">
                <span>Angebotsnummer:</span>
                <span class="font-medium">#{{ quote.quoteNumber.toString().padStart(5, '0') }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span>Angebotsdatum:</span>
                <span>{{ formatDate(quote.date) }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span>Gültig bis:</span>
                <span>{{ quote.validUntil ? formatDate(quote.validUntil) : 'Nicht festgelegt' }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span>Steuersatz:</span>
                <span>{{ quote.taxRate }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Angebotsposten
          </h3>
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Beschreibung
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Menge
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Einzelpreis
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Gesamt
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in quote.items" :key="item.id">
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ item.description }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 text-right">
                    {{ formatNumber(item.quantity) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 text-right">
                    {{ formatCurrency(item.unitPrice) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    {{ formatCurrency(item.total) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals -->
        <div class="flex justify-end">
          <div class="w-64">
            <div class="border-t border-gray-200 pt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Nettobetrag:</span>
                <span class="text-gray-900">{{ formatCurrency(quote.totalNet) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">MwSt. ({{ quote.taxRate }}%):</span>
                <span class="text-gray-900">{{ formatCurrency(quote.totalTax) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Gesamtbetrag:</span>
                <span>{{ formatCurrency(quote.totalGross) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="quote.notes" class="mt-8 pt-8 border-t border-gray-200">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Notizen
          </h3>
          <p class="text-sm text-gray-900">{{ quote.notes }}</p>
        </div>

        <!-- Quote Footer -->
        <div v-if="companySettings?.quoteFooter" class="mt-8 pt-8 border-t border-gray-200">
          <div class="text-sm text-gray-600 whitespace-pre-line">
            {{ companySettings.quoteFooter }}
          </div>
        </div>

        <!-- Company Footer with Bank Details -->
        <div v-if="companySettings" class="mt-8 pt-8 border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-500">
            <!-- Company Info -->
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">{{ companySettings.name }}</h4>
              <div v-if="companySettings.address">{{ companySettings.address }}</div>
              <div v-if="companySettings.email">E-Mail: {{ companySettings.email }}</div>
              <div v-if="companySettings.phone">Tel: {{ companySettings.phone }}</div>
              <div v-if="companySettings.website">Web: {{ companySettings.website }}</div>
            </div>

            <!-- Bank Details -->
            <div v-if="companySettings.bankName || companySettings.iban">
              <h4 class="font-semibold text-gray-700 mb-2">Bankverbindung</h4>
              <div v-if="companySettings.bankName">{{ companySettings.bankName }}</div>
              <div v-if="companySettings.iban">IBAN: {{ companySettings.iban }}</div>
              <div v-if="companySettings.bic">BIC: {{ companySettings.bic }}</div>
            </div>

            <!-- Tax Info -->
            <div v-if="companySettings.taxNumber || companySettings.vatId">
              <h4 class="font-semibold text-gray-700 mb-2">Steuerdaten</h4>
              <div v-if="companySettings.taxNumber">Steuernr.: {{ companySettings.taxNumber }}</div>
              <div v-if="companySettings.vatId">USt-IdNr.: {{ companySettings.vatId }}</div>
              <div v-if="companySettings.owner">Inhaber: {{ companySettings.owner }}</div>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div v-if="companySettings?.termsAndConditions" class="mt-6 pt-6 border-t border-gray-200">
          <h4 class="font-semibold text-gray-700 mb-2 text-xs">Allgemeine Geschäftsbedingungen</h4>
          <div class="text-xs text-gray-500 whitespace-pre-line">
            {{ companySettings.termsAndConditions }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <div class="text-gray-500">Angebot nicht gefunden</div>
    <button
      @click="$router.push('/quotes')"
      class="mt-4 text-primary-600 hover:text-primary-500"
    >
      Zurück zu Angeboten
    </button>
  </div>
</template>

<script setup lang="ts">
import { quoteAPI, settingsAPI } from '@/services/api'
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface QuoteDetail {
  id: string
  quoteNumber: number
  date: string
  validUntil?: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
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
    email: string
    phone?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
  }
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

const route = useRoute()
const router = useRouter()
const quote = ref<QuoteDetail | null>(null)
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
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    case 'EXPIRED':
      return 'bg-orange-100 text-orange-800'
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
    case 'REJECTED':
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
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatNumber = (number: number) => {
  return new Intl.NumberFormat('de-DE').format(number)
}

const loadQuote = async () => {
  try {
    const id = route.params.id as string
    quote.value = await quoteAPI.getById(id)
  } catch (error) {
    console.error('Error loading quote:', error)
  } finally {
    loading.value = false
  }
}

const editQuote = () => {
  router.push(`/quotes/${quote.value?.id}/edit`)
}

const convertToInvoice = () => {
  // TODO: Implement conversion to invoice
  alert('Umwandlung in Rechnung wird in einer zukünftigen Version implementiert')
}

const loadSettings = async () => {
  try {
    companySettings.value = await settingsAPI.get()
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const downloadPDF = async () => {
  try {
    if (!quote.value) return
    
    const blob = await quoteAPI.downloadPDF(quote.value.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Angebot_${quote.value.quoteNumber}.pdf`
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
  Promise.all([loadQuote(), loadSettings()])
})
</script>
