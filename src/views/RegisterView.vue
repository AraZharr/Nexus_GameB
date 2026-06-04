<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <div class="space-y-6">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-3xl font-bold mb-2">Create Account</h1>
          <p class="text-slate-400">Join the game today</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-300 text-sm">
          Account created! Redirecting to login...
        </div>

        <!-- Registration Form -->
        <form v-if="!success" @submit.prevent="handleRegister" class="space-y-4">
          <Input
            v-model="formData.displayName"
            type="text"
            label="Display Name"
            placeholder="Choose a username"
            required
            :disabled="isLoading"
          />

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
            placeholder="At least 6 characters"
            required
            minlength="6"
            :disabled="isLoading"
          />

          <!-- Terms & Privacy Checkbox -->
          <div class="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
            <input
              v-model="formData.acceptedTerms"
              type="checkbox"
              id="terms"
              required
              :disabled="isLoading"
              class="mt-1 w-4 h-4 rounded bg-slate-700 border-slate-600 text-primary-600 cursor-pointer"
            />
            <label for="terms" class="text-sm text-slate-300 cursor-pointer flex-1">
              I agree to the
              <router-link to="/terms" target="_blank" class="text-primary-400 hover:text-primary-300 underline">
                Terms of Service
              </router-link>
              and
              <router-link to="/privacy" target="_blank" class="text-primary-400 hover:text-primary-300 underline">
                Privacy Policy
              </router-link>
            </label>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            size="lg"
            class="w-full mt-6"
            :disabled="isLoading || !formData.acceptedTerms"
          >
            <span v-if="!isLoading">Create Account</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          </Button>
        </form>

        <!-- Login Link -->
        <div class="text-center pt-4 border-t border-slate-700">
          <p class="text-slate-400">
            Already have an account?
            <router-link to="/login" class="text-primary-400 hover:text-primary-300 font-medium transition">
              Sign in
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
const { register, isLoading } = useAuth()

const formData = ref({
  displayName: '',
  email: '',
  password: '',
  acceptedTerms: false
})

const error = ref('')
const success = ref(false)

const handleRegister = async () => {
  error.value = ''

  // Validate form
  if (!formData.value.displayName || !formData.value.email || !formData.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  if (formData.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  if (!formData.value.acceptedTerms) {
    error.value = 'You must accept the Terms of Service and Privacy Policy'
    return
  }

  const result = await register(
    formData.value.email,
    formData.value.password,
    formData.value.displayName
  )

  if (result.success) {
    success.value = true
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
  } else {
    error.value = result.error || 'Registration failed. Please try again.'
  }
}
</script>
