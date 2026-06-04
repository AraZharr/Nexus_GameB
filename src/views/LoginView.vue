<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 flex items-center justify-center">
    <Card class="w-full max-w-md">
      <h1 class="text-3xl font-bold mb-6 text-center">Sign In</h1>
      <Input v-model="email" type="email" label="Email" placeholder="your@email.com" class="mb-4" />
      <Button class="w-full">Send Sign In Link</Button>
      <p class="text-center text-sm text-slate-400 mt-4">
        Don't have an account?
        <router-link to="/register" class="text-primary-400 hover:text-primary-300">Sign up</router-link>
      </p>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const email = ref('')
</script>
