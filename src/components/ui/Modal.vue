<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="glassmorphism rounded-2xl max-w-md w-full shadow-2xl animated">
          <div class="flex items-center justify-between p-6 border-b border-slate-700/50">
            <h2 class="text-xl font-bold">{{ title }}</h2>
            <button @click="close" class="text-slate-400 hover:text-slate-200 text-2xl leading-none">×</button>
          </div>
          <div class="p-6">
            <slot />
          </div>
          <div v-if="showFooter" class="flex gap-3 p-6 border-t border-slate-700/50">
            <Button variant="ghost" size="md" @click="close">Cancel</Button>
            <Button variant="primary" size="md" @click="confirm">Confirm</Button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import Button from './Button.vue'
import { defineEmits } from 'vue'

defineProps({
  isOpen: Boolean,
  title: String,
  showFooter: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'confirm'])

const close = () => emit('close')
const confirm = () => emit('confirm')
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.animated {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
