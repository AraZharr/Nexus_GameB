import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const isLoading = ref(true)
  const isLoggedIn = computed(() => !!session.value)
  const isGuest = computed(() => user.value?.is_guest ?? false)
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'moderator')

  // Initialize auth state from Supabase
  const initialize = async () => {
    try {
      isLoading.value = true

      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          session.value = currentSession

          if (currentSession?.user) {
            await syncUserProfile(currentSession.user.id)
          } else {
            user.value = null
          }
        }
      )

      // If we have a session, sync the user profile
      if (currentSession?.user) {
        await syncUserProfile(currentSession.user.id)
      }

      return () => subscription?.unsubscribe()
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Sync user profile from Supabase users table
  const syncUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error syncing user profile:', error)
        return
      }

      user.value = data
    } catch (error) {
      console.error('Error syncing user profile:', error)
    }
  }

  // Email + password login
  const login = async (email, password) => {
    try {
      isLoading.value = true
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      session.value = data.session
      if (data.user) {
        await syncUserProfile(data.user.id)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // Email + password registration
  const register = async (email, password, displayName) => {
    try {
      isLoading.value = true

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No user returned from signup')

      // Create user profile in users table
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email,
          display_name: displayName,
          role: 'user',
          is_guest: false,
          accepted_terms: false,
          created_at: new Date().toISOString()
        }
      ])

      if (profileError) throw profileError

      session.value = authData.session
      if (authData.user) {
        await syncUserProfile(authData.user.id)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // Google OAuth login
  const loginWithGoogle = async () => {
    try {
      isLoading.value = true
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#/dashboard`
        }
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // Guest login (anonymous)
  const loginAsGuest = async () => {
    try {
      isLoading.value = true

      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) throw error

      session.value = data.session

      // Create guest user profile
      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: data.user.id,
            display_name: `Guest_${Math.random().toString(36).substr(2, 9)}`,
            role: 'user',
            is_guest: true,
            accepted_terms: true,
            created_at: new Date().toISOString()
          }
        ]).select().single()

        if (!profileError) {
          await syncUserProfile(data.user.id)
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // Accept terms and conditions
  const acceptTerms = async () => {
    if (!user.value?.id) {
      return { success: false, error: 'No user logged in' }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ accepted_terms: true })
        .eq('id', user.value.id)

      if (error) throw error

      user.value.accepted_terms = true
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Logout
  const logout = async () => {
    try {
      isLoading.value = true
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      session.value = null
      user.value = null

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    session,
    isLoading,
    isLoggedIn,
    isGuest,
    isAdmin,
    // Methods
    initialize,
    login,
    register,
    loginWithGoogle,
    loginAsGuest,
    acceptTerms,
    logout,
    syncUserProfile
  }
})
