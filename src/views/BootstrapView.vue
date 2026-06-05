<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <div class="space-y-6">
        <!-- Header -->
        <div class="text-center">
          <div class="text-4xl mb-3">&#9876;</div>
          <h1 class="text-2xl font-bold mb-2">Owner Bootstrap</h1>
          <p class="text-slate-400 text-sm">
            Promote your account to Owner. This can only be done once, when no owners exist.
          </p>
        </div>

        <!-- Already Owner -->
        <div v-if="authStore.user?.role === 'owner'" class="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center">
          <p class="text-green-300 font-semibold">You are already the Owner.</p>
          <router-link to="/admin" class="text-green-400 underline text-sm mt-2 inline-block">
            Go to Admin Dashboard
          </router-link>
        </div>

        <!-- Not Logged In -->
        <div v-else-if="!authStore.isLoggedIn" class="bg-slate-800/50 rounded-lg p-4 text-center">
          <p class="text-slate-300 mb-3">You must be logged in first.</p>
          <router-link to="/login" class="text-primary-400 underline text-sm">
            Sign In
          </router-link>
        </div>

        <!-- Bootstrap Form -->
        <form v-else @submit.prevent="handleBootstrap" class="space-y-4">
          <div class="bg-amber-900/30 border border-amber-700 rounded-lg p-3">
            <p class="text-amber-200 text-sm">
              <strong>Current account:</strong> {{ authStore.user?.display_name || authStore.user?.email }}
            </p>
            <p class="text-amber-200 text-sm">
              <strong>Current role:</strong> {{ authStore.user?.role }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Bootstrap Secret</label>
            <input
              v-model="bootstrapSecret"
              type="password"
              placeholder="Enter the bootstrap secret"
              class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              required
            />
            <p class="text-xs text-slate-500 mt-1">
              Set via BOOTSTRAP_SECRET env var on the edge function.
            </p>
          </div>

          <!-- Error -->
          <div v-if="error" class="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
            {{ error }}
          </div>

          <!-- Success -->
          <div v-if="success" class="bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-300 text-sm">
            {{ success }}
          </div>

          <button
            type="submit"
            class="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg transition"
            :disabled="loading || !bootstrapSecret"
          >
            {{ loading ? 'Promoting...' : 'Promote to Owner' }}
          </button>
        </form>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRBAC } from '@/composables/useRBAC'
import Card from '@/components/ui/Card.vue'

const authStore = useAuthStore()
const rbac = useRBAC()

const bootstrapSecret = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleBootstrap = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  const result = await rbac.bootstrapOwner(authStore.user.id, bootstrapSecret.value)

  if (result.success) {
    success.value = result.message
    // Refresh user profile to get updated role
    await authStore.syncUserProfile(authStore.user.id)
    setTimeout(() => {
      window.location.hash = '#/admin'
    }, 2000)
  } else {
    error.value = result.message
  }

  loading.value = false
}
</script>
