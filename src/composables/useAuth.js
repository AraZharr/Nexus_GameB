import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()

  return {
    // State
    user: computed(() => authStore.user),
    session: computed(() => authStore.session),
    isLoading: computed(() => authStore.isLoading),
    isLoggedIn: computed(() => authStore.isLoggedIn),
    isGuest: computed(() => authStore.isGuest),
    isAdmin: computed(() => authStore.isAdmin),

    // Methods
    login: (email, password) => authStore.login(email, password),
    register: (email, password, displayName) => authStore.register(email, password, displayName),
    loginWithGoogle: () => authStore.loginWithGoogle(),
    loginAsGuest: () => authStore.loginAsGuest(),
    acceptTerms: () => authStore.acceptTerms(),
    logout: () => authStore.logout(),
    initialize: () => authStore.initialize()
  }
}
