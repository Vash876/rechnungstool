<template>
  <div class="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" style="backdrop-filter: blur(1.2px)">
    <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200">
      <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-900">
          {{ customer ? 'Kunde bearbeiten' : 'Neuer Kunde' }}
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
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Company -->
          <div class="sm:col-span-2">
            <label for="company" class="block text-sm font-medium text-gray-700">
              Unternehmen
            </label>
            <input
              v-model="form.company"
              type="text"
              id="company"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Optional"
            />
          </div>

          <!-- First Name -->
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
            />
          </div>

          <!-- Last Name -->
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
            />
          </div>

          <!-- Email -->
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
            />
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              v-model="form.phone"
              type="tel"
              id="phone"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <!-- Address -->
          <div class="sm:col-span-2">
            <label for="address" class="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              v-model="form.address"
              type="text"
              id="address"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Straße und Hausnummer"
            />
          </div>

          <!-- Postal Code -->
          <div>
            <label for="postalCode" class="block text-sm font-medium text-gray-700">
              PLZ
            </label>
            <input
              v-model="form.postalCode"
              type="text"
              id="postalCode"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <!-- City -->
          <div>
            <label for="city" class="block text-sm font-medium text-gray-700">
              Stadt
            </label>
            <input
              v-model="form.city"
              type="text"
              id="city"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <!-- Country -->
          <div class="sm:col-span-2">
            <label for="country" class="block text-sm font-medium text-gray-700">
              Land
            </label>
            <select
              v-model="form.country"
              id="country"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Land wählen</option>
              <option value="Deutschland">Deutschland</option>
              <option value="Österreich">Österreich</option>
              <option value="Schweiz">Schweiz</option>
            </select>
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
            class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
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
import { customerAPI } from '@/services/api'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { onMounted, ref } from 'vue'

interface Customer {
  id?: string
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

interface Props {
  customer?: Customer | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: []
}>()

const form = ref<Customer>({
  company: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Deutschland'
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    if (props.customer?.id) {
      // Update existing customer
      await customerAPI.update(props.customer.id, form.value)
    } else {
      // Create new customer
      await customerAPI.create(form.value)
    }

    emit('save')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Fehler beim Speichern'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.customer) {
    form.value = { ...props.customer }
  }
})
</script>
