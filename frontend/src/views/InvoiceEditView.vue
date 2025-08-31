<template>
  <div v-if="loading" class="flex justify-center items-center h-64">
    <div class="text-gray-500">Rechnung wird geladen...</div>
  </div>

  <div v-else-if="invoice" class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <button
        @click="goBack"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-2" />
        Zurück
      </button>
      
      <h1 class="text-2xl font-bold text-gray-900">
        Rechnung #{{ invoice.invoiceNumber.toString().padStart(5, '0') }} bearbeiten
      </h1>

      <div class="flex space-x-2">
        <button
          @click="cancelEdit"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          @click="saveInvoice"
          :disabled="saving"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          {{ saving ? 'Speichern...' : 'Speichern' }}
        </button>
      </div>
    </div>

    <!-- Invoice Form -->
    <InvoiceFormModal
      v-if="invoiceFormData"
      :is-open="true"
      :invoice="invoiceFormData"
      @close="goBack"
      @save="() => invoiceFormData && handleSave(invoiceFormData)"
      :is-edit-mode="true"
    />
  </div>

  <div v-else class="text-center py-12">
    <div class="text-gray-500">Rechnung nicht gefunden</div>
    <button
      @click="$router.push('/invoices')"
      class="mt-4 text-primary-600 hover:text-primary-500"
    >
      Zurück zu Rechnungen
    </button>
  </div>
</template>

<script setup lang="ts">
import InvoiceFormModal from '@/components/InvoiceFormModal.vue'
import { invoiceAPI } from '@/services/api'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface InvoiceDetail {
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

interface InvoiceFormData {
  id?: string
  customerId: string
  date: string
  dueDate: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  taxRate: number
  notes: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

const route = useRoute()
const router = useRouter()
const invoice = ref<InvoiceDetail | null>(null)
const invoiceFormData = ref<InvoiceFormData | null>(null)
const loading = ref(true)
const saving = ref(false)

const loadInvoice = async () => {
  try {
    const id = route.params.id as string
    const invoiceData = await invoiceAPI.getById(id)
    invoice.value = invoiceData
    
    // Transform to form data
    invoiceFormData.value = {
      id: invoiceData.id,
      customerId: invoiceData.customer.id,
      date: invoiceData.date.split('T')[0], // Convert to date string
      dueDate: invoiceData.dueDate ? invoiceData.dueDate.split('T')[0] : '',
      status: invoiceData.status,
      taxRate: invoiceData.taxRate,
      notes: invoiceData.notes || '',
      items: invoiceData.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    }
  } catch (error) {
    console.error('Error loading invoice:', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async (formData: InvoiceFormData) => {
  saving.value = true
  try {
    await invoiceAPI.update(formData.id!, formData)
    router.push(`/invoices/${formData.id}`)
  } catch (error) {
    console.error('Error saving invoice:', error)
    alert('Fehler beim Speichern der Rechnung')
  } finally {
    saving.value = false
  }
}

const saveInvoice = () => {
  if (invoiceFormData.value) {
    handleSave(invoiceFormData.value)
  }
}

const goBack = () => {
  if (invoice.value) {
    router.push(`/invoices/${invoice.value.id}`)
  } else {
    router.push('/invoices')
  }
}

const cancelEdit = () => {
  goBack()
}

onMounted(() => {
  loadInvoice()
})
</script>
