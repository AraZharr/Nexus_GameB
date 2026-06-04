<template>
  <div class="glassmorphism p-6 rounded-2xl">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  class: String
})
</script>
