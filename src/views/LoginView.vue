<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <div class="space-y-6">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-3xl font-bold mb-2">Welcome Back</h1>
          <p class="text-slate-400">Sign in to your account</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
          {{ error }}
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <Input
            v-model="formData.email"
            type="email"
            label="Email"
            placeholder="your@email.com"
            required
            :disabled="isLoading"
          />

          <Input
            v-model="formData.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
            :disabled="isLoading"
          />

          <!-- Login Button -->
          <Button
            type="submit"
            variant="primary"
            size="lg"
            class="w-full mt-6"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Sign In</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          </Button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-slate-700"></div>
          <span class="text-sm text-slate-400">Or continue with</span>
          <div class="flex-1 h-px bg-slate-700"></div>
        </div>

        <!-- Google Sign In -->
        <Button
          @click="handleGoogleLogin"
          variant="secondary"
          size="lg"
          class="w-full flex items-center justify-center gap-2"
          :disabled="isLoading"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.5,12.545,1.5c-6.135,0-11.116,4.981-11.116,11.116c0,6.135,4.981,11.116,11.116,11.116c11.066,0,11.881-8.527,11.881-11.116c0-0.611-0.035-1.211-0.126-1.803H12.545z" />
          </svg>
          <span>Google</span>
        </Button>

        <!-- Guest Login -->
        <Button
          @click="handleGuestLogin"
          variant="ghost"
          size="lg"
          class="w-full"
          :disabled="isLoading"
        >
          Continue as Guest
        </Button>

        <!-- Register Link -->
        <div class="text-center pt-4 border-t border-slate-700">
          <p class="text-slate-400">
            Don't have an account?
            <router-link to="/register" class="text-primary-400 hover:text-primary-300 font-medium transition">
              Create one
            </router-link>
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const { login, loginWithGoogle, loginAsGuest, isLoading } = useAuth()

const formData = ref({
  email: '',
  password: ''
})

const error = ref('')

const handleLogin = async () => {
  error.value = ''

  if (!formData.value.email || !formData.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  const result = await login(formData.value.email, formData.value.password)

  if (result.success) {
    router.push({ name: 'dashboard' })
  } else {
    error.value = result.error || 'Login failed. Please try again.'
  }
}

const handleGoogleLogin = async () => {
  error.value = ''
  const result = await loginWithGoogle()

  if (!result.success) {
    error.value = result.error || 'Google login failed. Please try again.'
  }
  // Google OAuth redirects automatically
}

const handleGuestLogin = async () => {
  error.value = ''
  const result = await loginAsGuest()

  if (result.success) {
    router.push({ name: 'dashboard' })
  } else {
    error.value = result.error || 'Guest login failed. Please try again.'
  }
}
</script>
