<template>
  <div class="relative">
    <button
      v-if="!disabled"
      @click="handleActivate"
      class="relative w-16 h-16 rounded-full font-bold text-lg transition-all duration-200 active:scale-95 focus:outline-none"
      :class="{
        'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/50 hover:from-blue-300 hover:to-blue-500 hover:shadow-blue-500/70': !used,
        'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-400 opacity-60 cursor-not-allowed': used
      }"
    >
      <!-- Glow effect when ready -->
      <div
        v-if="!used"
        class="absolute inset-0 rounded-full bg-blue-400 opacity-0 animate-pulse"
      ></div>

      <!-- Skill Icon/Number -->
      <div class="relative z-10 flex items-center justify-center h-full">
        <span class="text-2xl">{{ slotNumber === 1 ? '1️⃣' : '2️⃣' }}</span>
      </div>

      <!-- State indicator -->
      <div
        v-if="!used"
        class="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse"
      ></div>
    </button>

    <!-- Disabled state - hidden -->
    <div
      v-else
      class="w-16 h-16 rounded-full opacity-0 pointer-events-none"
    ></div>

    <!-- Tooltip -->
    <div
      v-if="skill && !disabled"
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 whitespace-nowrap pointer-events-none"
    >
      {{ skill.name }}
      <span v-if="used" class="text-gray-400 ml-1">(used)</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  skill: {
    type: Object,
    default: null
  },
  slotNumber: {
    type: Number,
    required: true,
    validator: (value) => [1, 2].includes(value)
  },
  used: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['activate'])

const handleActivate = () => {
  if (!emit.used) {
    emit('activate', emit.slotNumber)
  }
}
</script>
