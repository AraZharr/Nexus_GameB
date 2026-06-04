<template>
  <div>
    <!-- Pre-Match: Betting Setup -->
    <div v-if="phase === 'betting'" class="bg-gradient-to-r from-amber-900 to-amber-800 p-4 rounded-lg border border-amber-700">
      <p class="text-sm font-semibold text-amber-200 mb-3">Place Your Bet</p>

      <div class="space-y-3">
        <!-- Bet Amount Input -->
        <div class="flex gap-2">
          <input
            v-model.number="betAmount"
            type="number"
            min="0"
            :max="maxBet"
            placeholder="Enter bet amount"
            class="flex-1 px-3 py-2 bg-amber-900 border border-amber-700 rounded-lg text-slate-50 placeholder-amber-400 text-sm"
          />
          <button
            @click="betAmount = maxBet"
            class="px-3 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg font-semibold text-sm transition"
          >
            All-in
          </button>
        </div>

        <!-- Quick Bet Buttons -->
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="preset in [50, 100, 250]"
            :key="preset"
            @click="betAmount = preset"
            :disabled="preset > maxBet"
            :class="[
              'px-2 py-1 rounded text-sm font-semibold transition',
              preset > maxBet
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-amber-700 hover:bg-amber-600'
            ]"
          >
            {{ preset }}
          </button>
        </div>

        <!-- Bet Range Display -->
        <p class="text-xs text-amber-200">
          Balance: {{ currentBalance }} Koin | Max Bet: {{ maxBet }} Koin
        </p>

        <!-- Confirm Bet -->
        <button
          @click="confirmBet"
          :disabled="betAmount <= 0 || betAmount > maxBet"
          :class="[
            'w-full py-2 rounded-lg font-semibold transition text-sm',
            betAmount > 0 && betAmount <= maxBet
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          ]"
        >
          Confirm Bet ({{ betAmount }} Koin)
        </button>

        <!-- Coin Toss Animation -->
        <div v-if="showCoinToss" class="text-center py-4">
          <div class="text-4xl mb-2 animate-bounce">🪙</div>
          <p class="text-sm text-amber-200 font-semibold">Flipping coin...</p>
        </div>
      </div>
    </div>

    <!-- In-Match: Pot Display -->
    <div v-else-if="phase === 'playing'" class="relative">
      <div class="bg-gradient-to-r from-amber-900 to-amber-800 p-4 rounded-lg border-2 border-amber-600 shadow-lg shadow-amber-500/50">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-amber-200 font-semibold">POT TOTAL</p>
            <p class="text-2xl font-bold text-amber-300">{{ potTotal }} Koin</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-amber-200">Your Bet</p>
            <p class="text-xl font-bold text-amber-400">{{ playerBet }} Koin</p>
          </div>
        </div>
      </div>
      <!-- Glow pulse animation -->
      <div class="absolute inset-0 rounded-lg bg-amber-500/20 animate-pulse pointer-events-none" />
    </div>

    <!-- Post-Match: Result Animation -->
    <div v-else-if="phase === 'finished'" class="space-y-2">
      <!-- Win Animation: Coin Rain -->
      <div v-if="matchWon" class="relative h-16 bg-gradient-to-b from-yellow-900 to-amber-900 rounded-lg overflow-hidden border border-yellow-600">
        <div class="absolute inset-0 flex items-center justify-center">
          <p class="text-2xl font-bold text-yellow-300 z-10">Coins Raining!</p>
        </div>
        <div class="absolute inset-0 animate-pulse">
          <div v-for="i in 5" :key="i" class="absolute text-yellow-400 text-xl animate-bounce">
            {{ ['💰', '🪙', '💎', '✨'][i % 4] }}
          </div>
        </div>
      </div>

      <!-- Loss Animation: Chip Dissolve -->
      <div v-else class="relative h-16 bg-gradient-to-b from-red-900 to-slate-900 rounded-lg overflow-hidden border border-red-600">
        <div class="absolute inset-0 flex items-center justify-center">
          <p class="text-2xl font-bold text-red-300 z-10 opacity-75">Chips Vanished...</p>
        </div>
        <div class="absolute inset-0 opacity-50">
          <div v-for="i in 3" :key="i" class="absolute text-slate-400 text-2xl animate-ping">
            ♠
          </div>
        </div>
      </div>

      <!-- Result Details -->
      <div :class="['p-3 rounded-lg border', matchWon ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600']">
        <p :class="['font-semibold', matchWon ? 'text-green-300' : 'text-red-300']">
          {{ matchWon ? 'You won! +' : 'You lost -' }}{{ potTotal }} Koin
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  potTotal: {
    type: Number,
    default: 0,
  },
  phase: {
    type: String,
    default: 'betting', // betting, playing, finished
  },
  playerBet: {
    type: Number,
    default: 0,
  },
  currentBalance: {
    type: Number,
    default: 1000,
  },
  maxBet: {
    type: Number,
    default: 500,
  },
  matchWon: {
    type: Boolean,
    default: null,
  },
});

const emit = defineEmits(['place-bet']);

const betAmount = ref(100);
const showCoinToss = ref(false);

const confirmBet = () => {
  if (betAmount.value > 0 && betAmount.value <= props.maxBet) {
    showCoinToss.value = true;

    // Simulate coin toss animation
    setTimeout(() => {
      showCoinToss.value = false;
      emit('place-bet', betAmount.value);
    }, 2000);
  }
};
</script>

<style scoped>
@keyframes bounce-custom {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce-custom 1s infinite;
}
</style>
