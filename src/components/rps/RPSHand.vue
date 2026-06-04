<template>
  <div class="rps-hand-container" :class="handClasses">
    <svg
      v-if="choice !== 'unknown'"
      class="hand-svg"
      :class="{ shaking: shaking, revealing: !shaking }"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Rock (fist) -->
      <g v-if="choice === 'rock'" class="hand-rock">
        <circle cx="50" cy="50" r="40" fill="currentColor" />
        <circle cx="30" cy="30" r="12" fill="currentColor" opacity="0.8" />
        <circle cx="70" cy="30" r="12" fill="currentColor" opacity="0.8" />
        <circle cx="30" cy="70" r="12" fill="currentColor" opacity="0.8" />
        <circle cx="70" cy="70" r="12" fill="currentColor" opacity="0.8" />
      </g>

      <!-- Paper (open hand) -->
      <g v-else-if="choice === 'paper'" class="hand-paper">
        <!-- Palm -->
        <ellipse cx="50" cy="55" rx="28" ry="35" fill="currentColor" />
        <!-- Thumb -->
        <rect x="15" y="40" width="12" height="35" rx="6" fill="currentColor" />
        <!-- Index finger -->
        <rect x="30" y="15" width="10" height="50" rx="5" fill="currentColor" />
        <!-- Middle finger -->
        <rect x="45" y="10" width="10" height="55" rx="5" fill="currentColor" />
        <!-- Ring finger -->
        <rect x="60" y="15" width="10" height="50" rx="5" fill="currentColor" />
        <!-- Pinky finger -->
        <rect x="75" y="25" width="10" height="40" rx="5" fill="currentColor" />
      </g>

      <!-- Scissors (V shape) -->
      <g v-else-if="choice === 'scissors'" class="hand-scissors">
        <!-- Thumb -->
        <rect x="20" y="45" width="12" height="35" rx="6" fill="currentColor" />
        <!-- Index and middle fingers split in V -->
        <path d="M 40 10 Q 35 35 30 60" stroke="currentColor" stroke-width="10" fill="none" stroke-linecap="round" />
        <path d="M 60 10 Q 65 35 70 60" stroke="currentColor" stroke-width="10" fill="none" stroke-linecap="round" />
      </g>

      <!-- Unknown (question mark) -->
      <g v-else class="hand-unknown">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2" />
        <text x="50" y="60" text-anchor="middle" font-size="50" fill="currentColor">?</text>
      </g>
    </svg>

    <!-- Loading/Unknown state -->
    <div v-else class="unknown-placeholder">
      <div class="loading-shimmer"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  choice: {
    type: String,
    default: 'unknown',
    validator: (val) => ['rock', 'paper', 'scissors', 'unknown'].includes(val)
  },
  isWinner: {
    type: Boolean,
    default: false
  },
  isLoser: {
    type: Boolean,
    default: false
  },
  isTie: {
    type: Boolean,
    default: false
  },
  shaking: {
    type: Boolean,
    default: false
  }
})

const handClasses = computed(() => ({
  'winner': props.isWinner,
  'loser': props.isLoser,
  'tie': props.isTie,
  'shaking-hand': props.shaking
}))
</script>

<style scoped>
.rps-hand-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #667eea;
  position: relative;
}

.hand-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.hand-svg.shaking {
  animation: handShake 0.3s ease-in-out;
  animation-iteration-count: 3;
}

.hand-svg.revealing {
  animation: revealBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.rps-hand-container.winner .hand-svg {
  color: #fbbf24;
  filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.8)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
  transform: scale(1.1);
}

.rps-hand-container.loser .hand-svg {
  color: #667eea;
  opacity: 0.4;
  filter: grayscale(100%) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.rps-hand-container.tie .hand-svg {
  animation: tiePulse 0.8s ease-in-out infinite;
}

.rps-hand-container.shaking-hand .hand-svg {
  animation: handShake 0.3s ease-in-out;
  animation-iteration-count: 3;
}

.unknown-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.3), rgba(102, 126, 234, 0.1), rgba(102, 126, 234, 0.3));
  background-size: 200% 100%;
  border-radius: 0.5rem;
  animation: loading 1.5s ease-in-out infinite;
}

.loading-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes handShake {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
}

@keyframes revealBounce {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes tiePulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes loading {
  0%, 100% {
    background-position: 200% 0;
  }
  50% {
    background-position: -200% 0;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
</style>
