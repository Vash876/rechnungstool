<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="backdrop-filter: blur(1.2px)">
    <div class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-900">
          {{ invoice ? 'Rechnung bearbeiten' : 'Neue Rechnung' }}
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
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

            <!-- Invoice Date -->
            <div>
              <label for="date" class="block text-sm font-medium text-gray-700">
                Rechnungsdatum *
              </label>
              <input
                v-model="form.date"
                type="date"
                id="date"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <!-- Due Date -->
            <div>
              <label for="dueDate" class="block text-sm font-medium text-gray-700">
                Fälligkeitsdatum
              </label>
              <input
                v-model="form.dueDate"
                type="date"
                id="dueDate"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
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
                step="0.01"
                min="0"
                max="100"
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
                placeholder="Optionale Notizen zur Rechnung..."
              />
            </div>
          </div>

          <!-- Right Column - Items -->
          <div class="space-y-6">
            <div>
              <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-medium text-gray-700">
                  Rechnungsposten
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
              <div class="space-y-3">
                <div
                  v-for="(item, index) in form.items"
                  :key="index"
                  class="border rounded-lg p-4 bg-gray-50"
                >
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-medium text-gray-700">Beschreibung</label>
                      <input
                        v-model="item.description"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 text-sm"
                        placeholder="Beschreibung der Leistung"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Menge</label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        @input="calculateItemTotal(index)"
                        class="mt-1 block w-full rounded-md border-gray-300 text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Einzelpreis (€)</label>
                      <input
                        v-model.number="item.unitPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        @input="calculateItemTotal(index)"
                        class="mt-1 block w-full rounded-md border-gray-300 text-sm"
                      />
                    </div>
                  </div>
                  <div class="mt-3 flex items-center justify-between">
                    <span class="text-sm font-medium">
                      Gesamt: {{ formatCurrency(item.total) }}
                    </span>
                    <button
                      type="button"
                      @click="removeItem(index)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              </div>

              <!-- Totals -->
              <div class="mt-6 border-t pt-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Nettobetrag:</span>
                  <span class="font-medium">{{ formatCurrency(totalNet) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>MwSt. ({{ form.taxRate }}%):</span>
                  <span class="font-medium">{{ formatCurrency(totalTax) }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Gesamtbetrag:</span>
                  <span>{{ formatCurrency(totalGross) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">{{ error }}</div>
        </div>

        <!-- Buttons -->
        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            :disabled="loading || form.items.length === 0"
            class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            {{ loading ? 'Speichern...' : 'Speichern' }}
          </button>
        </div>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { customerAPI, invoiceAPI } from '@/services/api'
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id?: string
  customerId: string
  date: string
  dueDate?: string
  taxRate: number
  notes?: string
  items: InvoiceItem[]
}

interface Customer {
  id: string
  company?: string
  firstName: string
  lastName: string
}

interface Props {
  invoice?: Invoice | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: []
}>()

const form = ref<Invoice>({
  customerId: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  taxRate: 19,
  notes: '',
  items: []
})

const customers = ref<Customer[]>([])
const loading = ref(false)
const error = ref('')

const totalNet = computed(() => {
  return form.value.items.reduce((sum, item) => sum + item.total, 0)
})

const totalTax = computed(() => {
  return totalNet.value * (form.value.taxRate / 100)
})

const totalGross = computed(() => {
  return totalNet.value + totalTax.value
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const addItem = () => {
  form.value.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  })
}

const removeItem = (index: number) => {
  form.value.items.splice(index, 1)
}

const calculateItemTotal = (index: number) => {
  const item = form.value.items[index]
  item.total = item.quantity * item.unitPrice
}

const loadCustomers = async () => {
  try {
    customers.value = await customerAPI.getAll()
  } catch (err) {
    console.error('Error loading customers:', err)
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    // Calculate totals for all items
    form.value.items.forEach((_, index) => {
      calculateItemTotal(index)
    })

    const invoiceData = {
      ...form.value,
      totalNet: totalNet.value,
      totalTax: totalTax.value,
      totalGross: totalGross.value
    }

    if (props.invoice?.id) {
      // Update existing invoice
      await invoiceAPI.update(props.invoice.id, invoiceData)
    } else {
      // Create new invoice
      await invoiceAPI.create(invoiceData)
    }

    emit('save')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Fehler beim Speichern'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCustomers()
  
  if (props.invoice) {
    form.value = { ...props.invoice }
  } else {
    // Add first item by default
    addItem()
  }
})
</script>
