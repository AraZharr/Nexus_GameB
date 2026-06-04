<template>
  <div class="fixed bottom-4 right-4 z-40 flex flex-col gap-2 pointer-events-none">
    <transition-group name="toast" tag="div">
      <div
        v-for="(toast, idx) in toasts"
        :key="toast.id"
        :class="[
          'glassmorphism px-4 py-3 rounded-lg pointer-events-auto',
          'animate-slide-up',
          {
            'bg-green-900/50 border-green-500/30': toast.type === 'success',
            'bg-red-900/50 border-red-500/30': toast.type === 'error',
            'bg-yellow-900/50 border-yellow-500/30': toast.type === 'warning',
            'bg-blue-900/50 border-blue-500/30': toast.type === 'info',
          }
        ]"
      >
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let id = 0

const addToast = (message, type = 'info', duration = 3000) => {
  const toastId = id++
  toasts.value.push({ id: toastId, message, type })

  if (duration > 0) {
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== toastId)
    }, duration)
  }

  return toastId
}

const removeToast = (toastId) => {
  toasts.value = toasts.value.filter(t => t.id !== toastId)
}

defineExpose({
  addToast,
  removeToast,
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
