<template>
  <div class="flex flex-col items-center gap-4">
    <div
      class="relative w-24 h-24 rounded-lg cursor-pointer transition-transform"
      :class="[
        'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-lg',
        diceColor,
        rolling && 'animate-spin',
      ]"
      @click="!rolling && $emit('roll')"
    >
      <!-- Dice dots pattern -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="grid grid-cols-3 gap-2 w-full h-full p-2">
          <!-- Dot 1 -->
          <div
            v-if="[1, 3, 5].includes(value)"
            class="rounded-full"
            :class="dotColor"
          />
          <div v-else />
          <div />
          <!-- Dot 2 -->
          <div />
          <div
            v-if="[2, 4, 6].includes(value)"
            class="rounded-full"
            :class="dotColor"
          />
          <div />
          <!-- Dot 3 -->
          <div />
          <div />
          <div
            v-if="[1, 3, 5].includes(value)"
            class="rounded-full"
            :class="dotColor"
          />
        </div>

        <!-- Alternative dot patterns for 2, 4, 6 -->
        <div v-if="[2, 4, 6].includes(value)" class="absolute inset-0 flex items-center justify-center">
          <div class="grid grid-cols-3 gap-2 w-full h-full p-2">
            <div
              v-if="[2, 4, 6].includes(value)"
              class="rounded-full"
              :class="dotColor"
            />
            <div />
            <div
              v-if="[2, 4, 6].includes(value)"
              class="rounded-full"
              :class="dotColor"
            />
            <div />
            <div
              v-if="value === 6"
              class="rounded-full"
              :class="dotColor"
            />
            <div />
            <div
              v-if="[2, 4, 6].includes(value)"
              class="rounded-full"
              :class="dotColor"
            />
            <div />
            <div
              v-if="[2, 4, 6].includes(value)"
              class="rounded-full"
              :class="dotColor"
            />
          </div>
        </div>
      </div>

      <!-- Value text -->
      <div class="absolute inset-0 flex items-center justify-center text-3xl font-bold" :class="textColor">
        {{ value }}
      </div>
    </div>

    <!-- Rolling indicator -->
    <div v-if="rolling" class="text-sm font-semibold text-slate-300 animate-pulse">
      Rolling...
    </div>
    <div v-else class="text-xs text-slate-400">
      Click to roll
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    default: 1,
    validator: (v) => v >= 1 && v <= 6,
  },
  rolling: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'blue',
    validator: (v) => ['red', 'green', 'yellow', 'blue', 'purple'].includes(v),
  },
});

const emit = defineEmits(['roll']);

const diceColor = computed(() => {
  const colors = {
    red: 'border-red-500 bg-gradient-to-br from-red-700 to-red-800',
    green: 'border-green-500 bg-gradient-to-br from-green-700 to-green-800',
    yellow: 'border-yellow-500 bg-gradient-to-br from-yellow-700 to-yellow-800',
    blue: 'border-blue-500 bg-gradient-to-br from-blue-700 to-blue-800',
    purple: 'border-purple-500 bg-gradient-to-br from-purple-700 to-purple-800',
  };
  return colors[props.color] || colors.blue;
});

const dotColor = computed(() => {
  const colors = {
    red: 'bg-red-300',
    green: 'bg-green-300',
    yellow: 'bg-yellow-300',
    blue: 'bg-blue-300',
    purple: 'bg-purple-300',
  };
  return colors[props.color] || colors.blue;
});

const textColor = computed(() => {
  const colors = {
    red: 'text-red-300',
    green: 'text-green-300',
    yellow: 'text-yellow-300',
    blue: 'text-blue-300',
    purple: 'text-purple-300',
  };
  return colors[props.color] || colors.blue;
});
</script>

<style scoped>
@keyframes roll {
  0% {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  100% {
    transform: rotateX(720deg) rotateY(720deg) rotateZ(720deg);
  }
}

.animate-spin {
  animation: roll 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>
