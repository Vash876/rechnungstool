<template>
  <div v-if="loading" class="flex justify-center items-center h-64">
    <div class="text-gray-500">Angebot wird geladen...</div>
  </div>

  <div v-else class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit ? 'Angebot bearbeiten' : 'Neues Angebot' }}
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          {{ isEdit ? 'Angebotsdaten bearbeiten' : 'Erstellen Sie ein neues Angebot' }}
        </p>
      </div>
      <button
        @click="goBack"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-2" />
        Zurück
      </button>
    </div>

    <!-- Form -->
    <div class="bg-white shadow rounded-lg">
      <form @submit.prevent="handleSubmit" class="space-y-6 p-6">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Left Column -->
          <div class="space-y-6">
            <!-- Customer Selection -->
            <div>
              <label for="customer" class="block text-sm font-medium text-gray-700">
                Kunde *
              </label>
              <select
                v-model="form.customerId"
                id="customer"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Kunde auswählen</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.company || `${customer.firstName} ${customer.lastName}` }}
                </option>
              </select>
            </div>

            <!-- Quote Date -->
            <div>
              <label for="date" class="block text-sm font-medium text-gray-700">
                Angebotsdatum *
              </label>
              <input
                v-model="form.date"
                type="date"
                id="date"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <!-- Valid Until -->
            <div>
              <label for="validUntil" class="block text-sm font-medium text-gray-700">
                Gültig bis *
              </label>
              <input
                v-model="form.validUntil"
                type="date"
                id="validUntil"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <!-- Status -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                v-model="form.status"
                id="status"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="DRAFT">Entwurf</option>
                <option value="SENT">Versendet</option>
                <option value="ACCEPTED">Angenommen</option>
                <option value="DECLINED">Abgelehnt</option>
                <option value="EXPIRED">Abgelaufen</option>
              </select>
            </div>

            <!-- Tax Rate -->
            <div>
              <label for="taxRate" class="block text-sm font-medium text-gray-700">
                Steuersatz (%)
              </label>
              <input
                v-model.number="form.taxRate"
                type="number"
                id="taxRate"
                min="0"
                max="100"
                step="0.01"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <!-- Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700">
                Notizen
              </label>
              <textarea
                v-model="form.notes"
                id="notes"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Optionale Notizen zum Angebot..."
              />
            </div>
          </div>

          <!-- Right Column - Items -->
          <div class="space-y-6">
            <div>
              <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-medium text-gray-700">
                  Angebotspositionen
                </label>
                <button
                  type="button"
                  @click="addItem"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                >
                  <PlusIcon class="h-4 w-4 mr-1" />
                  Position hinzufügen
                </button>
              </div>

              <!-- Items List -->
              <div class="space-y-4">
                <div
                  v-for="(item, index) in form.items"
                  :key="index"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-sm font-medium text-gray-700">Position {{ index + 1 }}</span>
                    <button
                      type="button"
                      @click="removeItem(index)"
                      class="text-red-600 hover:text-red-800"
                      :disabled="form.items.length === 1"
                    >
                      <XMarkIcon class="h-4 w-4" />
                    </button>
                  </div>

                  <div class="space-y-3">
                    <!-- Description -->
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">
                        Beschreibung *
                      </label>
                      <input
                        v-model="item.description"
                        type="text"
                        required
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        placeholder="Beschreibung der Leistung"
                      />
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                      <!-- Quantity -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          Menge
                        </label>
                        <input
                          v-model.number="item.quantity"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        />
                      </div>

                      <!-- Unit Price -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          Einzelpreis (€)
                        </label>
                        <input
                          v-model.number="item.unitPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        />
                      </div>

                      <!-- Total -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          Gesamt
                        </label>
                        <div class="mt-1 text-sm font-medium text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                          {{ formatCurrency(item.quantity * item.unitPrice) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Nettobetrag:</span>
                  <span class="font-medium">{{ formatCurrency(totals.net) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">MwSt. ({{ form.taxRate }}%):</span>
                  <span class="font-medium">{{ formatCurrency(totals.tax) }}</span>
                </div>
                <div class="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                  <span>Gesamtbetrag:</span>
                  <span>{{ formatCurrency(totals.gross) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="goBack"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? 'Speichern...' : (isEdit ? 'Aktualisieren' : 'Erstellen') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { customerAPI, quoteAPI, settingsAPI } from '@/services/api'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
}

interface QuoteForm {
  customerId: string
  date: string
  validUntil: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  taxRate: number
  notes: string
  items: QuoteItem[]
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  company?: string
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const customers = ref<Customer[]>([])
const companySettings = ref<any>(null)

// Default valid until date (30 days from now)
const defaultValidUntil = () => {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().split('T')[0]
}

const form = ref<QuoteForm>({
  customerId: '',
  date: new Date().toISOString().split('T')[0],
  validUntil: defaultValidUntil(),
  status: 'DRAFT',
  taxRate: 19,
  notes: '',
  items: [
    {
      description: '',
      quantity: 1,
      unitPrice: 0
    }
  ]
})

const isEdit = computed(() => !!route.params.id)

const totals = computed(() => {
  const net = form.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const tax = net * (form.value.taxRate / 100)
  const gross = net + tax
  
  return { net, tax, gross }
})

const formatCurrency = (amount: number) => {
  const currency = companySettings.value?.currency || 'EUR'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

const loadCustomers = async () => {
  try {
    customers.value = await customerAPI.getAll()
  } catch (error) {
    console.error('Error loading customers:', error)
  }
}

const loadDefaults = async () => {
  if (!isEdit.value) {
    try {
      const defaults = await quoteAPI.getDefaults()
      form.value.taxRate = defaults.taxRate
      
      // Calculate valid until date based on default validity days
      const today = new Date()
      const validDate = new Date(today)
      validDate.setDate(today.getDate() + defaults.validityDays)
      form.value.validUntil = validDate.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error loading defaults:', error)
    }
  }
}

const loadSettings = async () => {
  try {
    companySettings.value = await settingsAPI.get()
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const loadQuote = async () => {
  if (isEdit.value) {
    try {
      loading.value = true
      const quote = await quoteAPI.getById(route.params.id as string)
      form.value = {
        customerId: quote.customerId,
        date: quote.date.split('T')[0],
        validUntil: quote.validUntil.split('T')[0],
        status: quote.status,
        taxRate: quote.taxRate,
        notes: quote.notes || '',
        items: quote.items || [{
          description: '',
          quantity: 1,
          unitPrice: 0
        }]
      }
    } catch (error) {
      console.error('Error loading quote:', error)
      alert('Fehler beim Laden des Angebots')
    } finally {
      loading.value = false
    }
  }
}

const addItem = () => {
  form.value.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0
  })
}

const removeItem = (index: number) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

const handleSubmit = async () => {
  loading.value = true
  
  try {
    const quoteData = {
      ...form.value,
      totalNet: totals.value.net,
      totalTax: totals.value.tax,
      totalGross: totals.value.gross,
      items: form.value.items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      }))
    }

    if (isEdit.value) {
      await quoteAPI.update(route.params.id as string, quoteData)
    } else {
      await quoteAPI.create(quoteData)
    }
    
    router.push('/quotes')
  } catch (error) {
    console.error('Error saving quote:', error)
    alert('Fehler beim Speichern des Angebots')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/quotes')
}

onMounted(() => {
  Promise.all([loadCustomers(), loadDefaults(), loadSettings(), loadQuote()])
})
</script>
