import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(true)
  const isLoggedIn = computed(() => !!user.value)
  const isGuest = computed(() => user.value?.isAnonymous ?? false)
  const isAdmin = computed(() => user.value?.role === 'owner' || user.value?.role === 'gamemaster')

  const initialize = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          user.value = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isAnonymous: currentUser.isAnonymous,
            emailVerified: currentUser.emailVerified,
          }
        } else {
          user.value = null
        }
        isLoading.value = false
        resolve()
      })
    })
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const logout = () => {
    user.value = null
  }

  return {
    user,
    isLoading,
    isLoggedIn,
    isGuest,
    isAdmin,
    initialize,
    setUser,
    logout
  }
})
