import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

interface User {
  id: string
  email: string
  name: string
}

interface LoginData {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('authToken'))

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: LoginData) => {
    try {
      const data = await authAPI.login(credentials.email, credentials.password)
      const { token: authToken } = data

      token.value = authToken
      user.value = { id: '', email: credentials.email, name: '' } // Temporär, bis Backend User zurückgibt
      localStorage.setItem('authToken', authToken)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login fehlgeschlagen'
      }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    authAPI.logout()
  }

  const checkAuth = async () => {
    if (!token.value) return false

    try {
      // Für jetzt einfach true zurückgeben, wenn Token existiert
      // Später können wir eine Verify-Route implementieren
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})
