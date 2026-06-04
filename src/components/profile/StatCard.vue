<template>
  <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
    <p class="text-2xl mb-1">{{ icon }}</p>
    <p class="text-xs text-gray-400">{{ label }}</p>
    <p class="text-lg font-bold text-white">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  }
})
</script>
