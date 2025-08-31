<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit ? 'Kunde bearbeiten' : 'Neuer Kunde' }}
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          {{ isEdit ? 'Kundendaten bearbeiten' : 'Erstellen Sie einen neuen Kunden' }}
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
        <!-- Company or Person Type -->
        <div>
          <label class="text-base font-medium text-gray-900">Kundentyp</label>
          <div class="mt-4 space-y-4">
            <div class="flex items-center">
              <input
                id="company-type"
                v-model="customerType"
                value="company"
                type="radio"
                class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
              >
              <label for="company-type" class="ml-3 block text-sm font-medium text-gray-700">
                Unternehmen
              </label>
            </div>
            <div class="flex items-center">
              <input
                id="person-type"
                v-model="customerType"
                value="person"
                type="radio"
                class="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
              >
              <label for="person-type" class="ml-3 block text-sm font-medium text-gray-700">
                Privatperson
              </label>
            </div>
          </div>
        </div>

        <!-- Company Name (if company) -->
        <div v-if="customerType === 'company'">
          <label for="company" class="block text-sm font-medium text-gray-700">
            Firmenname *
          </label>
          <input
            v-model="form.company"
            type="text"
            id="company"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Muster GmbH"
          />
        </div>

        <!-- Personal Details -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              Vorname *
            </label>
            <input
              v-model="form.firstName"
              type="text"
              id="firstName"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Max"
            />
          </div>

          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              Nachname *
            </label>
            <input
              v-model="form.lastName"
              type="text"
              id="lastName"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Mustermann"
            />
          </div>
        </div>

        <!-- Contact Information -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              E-Mail *
            </label>
            <input
              v-model="form.email"
              type="email"
              id="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="max@beispiel.de"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              v-model="form.phone"
              type="tel"
              id="phone"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="+49 123 456789"
            />
          </div>
        </div>

        <!-- Address -->
        <div>
          <label for="address" class="block text-sm font-medium text-gray-700">
            Adresse
          </label>
          <input
            v-model="form.address"
            type="text"
            id="address"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Musterstraße 123"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label for="postalCode" class="block text-sm font-medium text-gray-700">
              PLZ
            </label>
            <input
              v-model="form.postalCode"
              type="text"
              id="postalCode"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="12345"
            />
          </div>

          <div class="sm:col-span-2">
            <label for="city" class="block text-sm font-medium text-gray-700">
              Stadt
            </label>
            <input
              v-model="form.city"
              type="text"
              id="city"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Musterstadt"
            />
          </div>
        </div>

        <div>
          <label for="country" class="block text-sm font-medium text-gray-700">
            Land
          </label>
          <input
            v-model="form.country"
            type="text"
            id="country"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Deutschland"
          />
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
import { customerAPI } from '@/services/api'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface CustomerForm {
  firstName: string
  lastName: string
  company?: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const customerType = ref<'company' | 'person'>('person')

const form = ref<CustomerForm>({
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Deutschland'
})

const isEdit = computed(() => !!route.params.id)

const loadCustomer = async () => {
  if (isEdit.value) {
    try {
      const customer = await customerAPI.getById(route.params.id as string)
      form.value = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        company: customer.company || '',
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        postalCode: customer.postalCode || '',
        country: customer.country || 'Deutschland'
      }
      customerType.value = customer.company ? 'company' : 'person'
    } catch (error) {
      console.error('Error loading customer:', error)
      alert('Fehler beim Laden der Kundendaten')
    }
  }
}

const handleSubmit = async () => {
  loading.value = true
  
  try {
    const customerData = {
      ...form.value,
      company: customerType.value === 'company' ? form.value.company : undefined
    }

    if (isEdit.value) {
      await customerAPI.update(route.params.id as string, customerData)
    } else {
      await customerAPI.create(customerData)
    }
    
    router.push('/customers')
  } catch (error) {
    console.error('Error saving customer:', error)
    alert('Fehler beim Speichern des Kunden')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/customers')
}

onMounted(() => {
  loadCustomer()
})
</script>
