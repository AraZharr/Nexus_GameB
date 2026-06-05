<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex flex-col items-center justify-center p-4">
    <div class="text-center max-w-md">
      <h1 class="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
        NEXUS BOARD
      </h1>
      <p class="text-lg text-slate-300 mb-8">
        Play Chess, Ludo & Snakes with friends online!
      </p>

      <!-- If logged in, show dashboard -->
      <div v-if="authStore.isLoggedIn" class="space-y-3">
        <router-link to="/dashboard">
          <Button class="w-full">Go to Dashboard</Button>
        </router-link>
        <router-link to="/game/chess">
          <Button variant="ghost" class="w-full">Play Offline</Button>
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/admin">
          <Button variant="danger" class="w-full">Admin Panel</Button>
        </router-link>
      </div>

      <!-- If not logged in -->
      <div v-else class="space-y-3">
        <router-link to="/login">
          <Button class="w-full">Sign In</Button>
        </router-link>
        <router-link to="/register">
          <Button variant="secondary" class="w-full">Create Account</Button>
        </router-link>
        <router-link to="/game/chess">
          <Button variant="ghost" class="w-full">Play Offline</Button>
        </router-link>
      </div>

      <div class="mt-8 pt-8 border-t border-slate-700/50">
        <router-link to="/leaderboard" class="text-primary-400 hover:text-primary-300 text-sm">
          View Leaderboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'

const authStore = useAuthStore()
</script>
