<template>
  <div>
    <div class="sm:flex sm:items-center mb-8">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-bold text-gray-900">Kunden</h1>
        <p class="mt-1 text-sm text-gray-600">
          Verwalten Sie Ihre Kundendaten
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <router-link
          to="/customers/new"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          Neuer Kunde
        </router-link>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="mb-6">
      <div class="max-w-sm">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Kunden suchen..."
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>
    </div>

    <!-- Customer List -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-sm text-gray-500">Lade Kunden...</p>
      </div>

      <div v-else-if="filteredCustomers.length === 0" class="p-6 text-center">
        <p class="text-gray-500">
          {{ searchTerm ? 'Keine Kunden gefunden.' : 'Noch keine Kunden vorhanden.' }}
        </p>
        <router-link
          v-if="!searchTerm"
          to="/customers/new"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200"
        >
          Ersten Kunden erstellen
        </router-link>
      </div>

      <ul v-else class="divide-y divide-gray-200">
        <li v-for="customer in filteredCustomers" :key="customer.id">
          <router-link
            :to="`/customers/${customer.id}`"
            class="block hover:bg-gray-50 px-4 py-4 sm:px-6"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                    <span class="text-sm font-medium text-white">
                      {{ getInitials(customer.company || `${customer.firstName} ${customer.lastName}`) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="flex items-center">
                    <p class="text-sm font-medium text-gray-900">
                      {{ customer.company || `${customer.firstName} ${customer.lastName}` }}
                    </p>
                    <span class="ml-2 text-xs text-gray-500">
                      #{{ customer.customerNumber }}
                    </span>
                  </div>
                  <div class="flex items-center text-sm text-gray-500 space-x-4">
                    <span v-if="customer.email">{{ customer.email }}</span>
                    <span v-if="customer.phone">{{ customer.phone }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <span v-if="customer._count">
                  {{ customer._count.invoices }} Rechnungen, {{ customer._count.quotes }} Angebote
                </span>
                <svg class="ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { customerAPI } from '@/services/api'
import { computed, onMounted, ref } from 'vue'

interface Customer {
  id: string
  customerNumber: string
  company?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  _count?: {
    invoices: number
    quotes: number
  }
}

const customers = ref<Customer[]>([])
const loading = ref(true)
const searchTerm = ref('')

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const filteredCustomers = computed(() => {
  if (!searchTerm.value) return customers.value
  
  const term = searchTerm.value.toLowerCase()
  return customers.value.filter(customer => {
    const name = (customer.company || `${customer.firstName} ${customer.lastName}`).toLowerCase()
    return name.includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.customerNumber.includes(term)
  })
})

const loadCustomers = async () => {
  try {
    loading.value = true
    customers.value = await customerAPI.getAll()
  } catch (error) {
    console.error('Error loading customers:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCustomers()
})
</script>
