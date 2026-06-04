<template>
  <div class="h-screen w-screen bg-slate-950 text-slate-50 overflow-hidden portrait-lock">
    <SplashScreen v-if="showSplash" @splash-complete="showSplash = false" />
    <router-view v-show="!showSplash" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SplashScreen from '@/components/theme/SplashScreen.vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'

const showSplash = ref(true)

onMounted(() => {
  const themeStore = useThemeStore()
  const authStore = useAuthStore()

  // Initialize theme
  themeStore.applyTheme()

  // Initialize auth
  authStore.initialize()

  // Show splash only on first visit per session
  if (sessionStorage.getItem('splashShown')) {
    showSplash.value = false
  } else {
    sessionStorage.setItem('splashShown', 'true')
  }
})
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
