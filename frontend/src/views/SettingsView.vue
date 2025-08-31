<template>
  <div class="container mx-auto px-6 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Einstellungen</h1>
      <p class="text-gray-600 mt-2">Konfigurieren Sie Ihre Unternehmensdaten und Systemeinstellungen</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-600 mt-2">Lade Einstellungen...</p>
    </div>

    <div v-else>
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 mb-8">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i :class="tab.icon" class="mr-2"></i>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Company Info Tab -->
      <div v-show="activeTab === 'company'" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Unternehmensdaten</h2>
        
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Firmenname
              </label>
              <input
                v-model="settings.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mustermann GmbH"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Geschäftsführer
              </label>
              <input
                v-model="settings.owner"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max Mustermann"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                E-Mail
              </label>
              <input
                v-model="settings.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="info@mustermann.de"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                v-model="settings.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+49 123 456789"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                v-model="settings.website"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.mustermann.de"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Steuernummer
              </label>
              <input
                v-model="settings.taxNumber"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345/67890"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Umsatzsteuer-ID
              </label>
              <input
                v-model="settings.vatId"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="DE123456789"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <textarea
              v-model="settings.address"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Musterstraße 123&#10;12345 Musterstadt&#10;Deutschland"
            ></textarea>
          </div>

          <!-- Logo Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Firmenlogo
            </label>
            <div class="flex items-center space-x-4">
              <div
                v-if="settings.logo"
                class="w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden"
              >
                <img
                  :src="`http://localhost:3000/api/uploads/${settings.logo}`"
                  alt="Logo"
                  class="w-full h-full object-contain"
                >
              </div>
              <div
                v-else
                class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              >
                <i class="fas fa-image text-gray-400 text-2xl"></i>
              </div>
              <div>
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/*"
                  @change="handleLogoUpload"
                  class="hidden"
                >
                <button
                  type="button"
                  @click="$refs.logoInput.click()"
                  class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  <i class="fas fa-upload mr-2"></i>
                  Logo hochladen
                </button>
                <button
                  v-if="settings.logo"
                  type="button"
                  @click="removeLogo"
                  class="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md transition-colors ml-2"
                >
                  <i class="fas fa-trash mr-2"></i>
                  Entfernen
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Business Settings Tab -->
      <div v-show="activeTab === 'business'" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Geschäftseinstellungen</h2>
        
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Standard-Mehrwertsteuersatz (%)
              </label>
              <input
                v-model.number="settings.defaultTaxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="19.00"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Standard-Zahlungsziel (Tage)
              </label>
              <input
                v-model.number="settings.defaultPaymentDue"
                type="number"
                min="1"
                max="365"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="14"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Währung
              </label>
              <select
                v-model="settings.currency"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">US-Dollar ($)</option>
                <option value="CHF">Schweizer Franken (CHF)</option>
              </select>
            </div>

            <div class="flex items-center">
              <input
                v-model="settings.isSmallBusiness"
                type="checkbox"
                id="smallBusiness"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <label for="smallBusiness" class="ml-2 text-sm text-gray-700">
                Kleinunternehmerregelung (§19 UStG)
              </label>
            </div>
          </div>
        </form>
      </div>

      <!-- Documents Tab -->
      <div v-show="activeTab === 'documents'" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Dokumenteneinstellungen</h2>
        
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rechnungsnummer-Präfix
              </label>
              <input
                v-model="settings.invoicePrefix"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="RE-"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Angebotsnummer-Präfix
              </label>
              <input
                v-model="settings.quotePrefix"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AG-"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nächste Rechnungsnummer
              </label>
              <input
                v-model.number="settings.invoiceStartNum"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nächste Angebotsnummer
              </label>
              <input
                v-model.number="settings.quoteStartNum"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              >
            </div>
          </div>
        </form>
      </div>

      <!-- Bank Details Tab -->
      <div v-show="activeTab === 'bank'" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Bankverbindung</h2>
        
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bank
              </label>
              <input
                v-model="settings.bankName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sparkasse Musterstadt"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                BIC
              </label>
              <input
                v-model="settings.bic"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="GENODEF1M01"
              >
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                IBAN
              </label>
              <input
                v-model="settings.iban"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="DE89 3704 0044 0532 0130 00"
              >
            </div>
          </div>
        </form>
      </div>

      <!-- Default Texts Tab -->
      <div v-show="activeTab === 'texts'" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Standard-Texte</h2>
        
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rechnungs-Fußzeile
            </label>
            <textarea
              v-model="settings.invoiceFooter"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Vielen Dank für Ihr Vertrauen!&#10;Bei Fragen stehen wir Ihnen gerne zur Verfügung."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Angebots-Fußzeile
            </label>
            <textarea
              v-model="settings.quoteFooter"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Wir freuen uns auf Ihre Auftragserteilung!&#10;Gerne stehen wir für Rückfragen zur Verfügung."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Allgemeine Geschäftsbedingungen
            </label>
            <textarea
              v-model="settings.termsAndConditions"
              rows="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1. Allgemeines&#10;Diese Geschäftsbedingungen gelten für alle Verträge...&#10;&#10;2. Angebote und Vertragsschluss&#10;Unsere Angebote sind freibleibend..."
            ></textarea>
          </div>
        </form>
      </div>

      <!-- Save Button (sticky) -->
      <div class="sticky bottom-6 bg-gray-50 border-t border-gray-200 px-6 py-4 mt-8 -mx-6">
        <div class="flex justify-between items-center">
          <div v-if="saveStatus" class="flex items-center text-sm">
            <i 
              :class="[
                'mr-2',
                saveStatus.type === 'success' ? 'fas fa-check-circle text-green-500' : 
                saveStatus.type === 'error' ? 'fas fa-exclamation-circle text-red-500' :
                'fas fa-spinner fa-spin text-blue-500'
              ]"
            ></i>
            <span :class="[
              saveStatus.type === 'success' ? 'text-green-700' :
              saveStatus.type === 'error' ? 'text-red-700' :
              'text-blue-700'
            ]">
              {{ saveStatus.message }}
            </span>
          </div>
          <div class="flex space-x-4">
            <button
              type="button"
              @click="resetSettings"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors"
            >
              <i class="fas fa-undo mr-2"></i>
              Zurücksetzen
            </button>
            <button
              @click="saveSettings"
              :disabled="saving"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition-colors"
            >
              <i class="fas fa-save mr-2"></i>
              {{ saving ? 'Speichern...' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import { settingsAPI } from '../api/settings'

export default {
  name: 'SettingsView',
  setup() {
    const loading = ref(true)
    const saving = ref(false)
    const activeTab = ref('company')
    const saveStatus = ref(null)

    const tabs = [
      { id: 'company', name: 'Unternehmen', icon: 'fas fa-building' },
      { id: 'business', name: 'Geschäft', icon: 'fas fa-briefcase' },
      { id: 'documents', name: 'Dokumente', icon: 'fas fa-file-alt' },
      { id: 'bank', name: 'Bankdaten', icon: 'fas fa-university' },
      { id: 'texts', name: 'Texte', icon: 'fas fa-align-left' }
    ]

    const settings = reactive({
      name: '',
      address: '',
      email: '',
      phone: '',
      taxNumber: '',
      vatId: '',
      bankAccount: '',
      bankName: '',
      iban: '',
      bic: '',
      logo: '',
      website: '',
      owner: '',
      defaultTaxRate: 19.0,
      defaultPaymentDue: 14,
      isSmallBusiness: false,
      currency: 'EUR',
      invoicePrefix: 'R',
      quotePrefix: 'A',
      invoiceStartNum: 1,
      quoteStartNum: 1,
      invoiceFooter: '',
      quoteFooter: '',
      termsAndConditions: ''
    })

    const originalSettings = ref({})

    const loadSettings = async () => {
      try {
        loading.value = true
        const response = await settingsAPI.getSettings()
        if (response.data) {
          Object.assign(settings, response.data)
          originalSettings.value = { ...response.data }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error)
        showSaveStatus('error', 'Fehler beim Laden der Einstellungen')
      } finally {
        loading.value = false
      }
    }

    const saveSettings = async () => {
      try {
        saving.value = true
        showSaveStatus('loading', 'Speichere Einstellungen...')
        
        await settingsAPI.updateSettings(settings)
        originalSettings.value = { ...settings }
        showSaveStatus('success', 'Einstellungen erfolgreich gespeichert')
      } catch (error) {
        console.error('Fehler beim Speichern:', error)
        showSaveStatus('error', 'Fehler beim Speichern der Einstellungen')
      } finally {
        saving.value = false
      }
    }

    const resetSettings = () => {
      Object.assign(settings, originalSettings.value)
      showSaveStatus('success', 'Einstellungen zurückgesetzt')
    }

    const handleLogoUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('logo', file)

      try {
        const response = await settingsAPI.uploadLogo(formData)
        settings.logo = response.data.filename
        showSaveStatus('success', 'Logo erfolgreich hochgeladen')
      } catch (error) {
        console.error('Fehler beim Logo-Upload:', error)
        showSaveStatus('error', 'Fehler beim Upload des Logos')
      }
    }

    const removeLogo = async () => {
      try {
        if (settings.logo) {
          await settingsAPI.deleteLogo(settings.logo)
        }
        settings.logo = ''
        showSaveStatus('success', 'Logo entfernt')
      } catch (error) {
        console.error('Fehler beim Löschen des Logos:', error)
        showSaveStatus('error', 'Fehler beim Löschen des Logos')
      }
    }

    const showSaveStatus = (type, message) => {
      saveStatus.value = { type, message }
      setTimeout(() => {
        saveStatus.value = null
      }, 3000)
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      loading,
      saving,
      activeTab,
      tabs,
      settings,
      saveStatus,
      saveSettings,
      resetSettings,
      handleLogoUpload,
      removeLogo
    }
  }
}
</script>
