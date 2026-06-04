<template>
  <div
    class="absolute rounded-full flex items-center justify-center font-bold transition-all"
    :class="[sizeClass, colorClass, stateClass, animationClass]"
    :style="positionStyle"
  >
    <!-- Piece number/label -->
    <span v-if="showNumber" class="text-xs font-bold drop-shadow-lg">
      {{ number }}
    </span>

    <!-- Glow effect for selected pieces -->
    <div
      v-if="state === 'selected'"
      class="absolute inset-0 rounded-full animate-pulse"
      :class="glowColor"
    />

    <!-- Highlight ring for legal moves -->
    <div
      v-if="state === 'highlighted'"
      class="absolute inset-0 rounded-full border-2"
      :class="highlightColor"
    />

    <!-- Capture animation flash -->
    <div
      v-if="state === 'captured'"
      class="absolute inset-0 rounded-full animate-pulse"
      :class="'bg-white/50'"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    required: true,
    validator: (v) => ['red', 'green', 'yellow', 'blue'].includes(v),
  },
  number: {
    type: Number,
    default: null,
  },
  state: {
    type: String,
    default: 'idle',
    validator: (v) => ['idle', 'selected', 'highlighted', 'moving', 'captured'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
});

const showNumber = computed(() => props.number !== null);

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  return sizes[props.size] || sizes.md;
});

const colorClass = computed(() => {
  const colors = {
    red: 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50',
    green: 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/50',
    yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/50',
    blue: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50',
  };
  return colors[props.color] || colors.blue;
});

const stateClass = computed(() => {
  const states = {
    idle: 'shadow-lg border border-white/20',
    selected: 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-xl',
    highlighted: 'border-4 border-white/60 shadow-xl',
    moving: 'shadow-2xl opacity-90',
    captured: 'opacity-60 shadow-none',
  };
  return states[props.state] || states.idle;
});

const glowColor = computed(() => {
  const colors = {
    red: 'bg-red-400/30',
    green: 'bg-green-400/30',
    yellow: 'bg-yellow-400/30',
    blue: 'bg-blue-400/30',
  };
  return colors[props.color] || colors.blue;
});

const highlightColor = computed(() => {
  const colors = {
    red: 'border-red-300',
    green: 'border-green-300',
    yellow: 'border-yellow-300',
    blue: 'border-blue-300',
  };
  return colors[props.color] || colors.blue;
});

const positionStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  transform: 'translate(-50%, -50%)',
}));

const animationClass = computed(() => {
  if (props.state === 'moving') {
    return 'animate-bounce';
  }
  if (props.state === 'captured') {
    return 'animate-ping';
  }
  return '';
});
</script>
