<template>
  <div class="rps-game-container">
    <!-- Pre-match mode -->
    <div v-if="mode === 'prematch'" class="prematch-section">
      <h2 class="text-2xl font-bold text-white mb-6">Determining First Player...</h2>
      <div class="flex gap-12 justify-center items-end mb-8">
        <RPSHand
          choice="unknown"
          :shaking="isCountingDown"
          class="w-24 h-24"
        />
        <div class="text-4xl font-bold text-white animate-bounce">VS</div>
        <RPSHand
          choice="unknown"
          :shaking="isCountingDown"
          class="w-24 h-24"
        />
      </div>
      <div v-if="countdownTime > 0" class="text-3xl font-bold text-yellow-400 text-center">
        {{ countdownTime }}
      </div>
    </div>

    <!-- Lobby and Betting mode -->
    <div v-else class="game-section">
      <!-- Game status display -->
      <div class="mb-8 text-center">
        <h2 class="text-2xl font-bold text-white mb-2">
          {{ mode === 'lobby' ? 'Free Play' : 'Betting Match' }}
        </h2>
        <p class="text-gray-400">
          {{ mode === 'betting' ? `Bet: ${betAmount} Koin` : 'Win 5 Koin' }}
        </p>
      </div>

      <!-- Game display area -->
      <div v-if="!isPlaying" class="text-center mb-8">
        <p class="text-xl text-gray-300 mb-4">Choose your move:</p>
      </div>

      <!-- Playing animation -->
      <div v-if="isPlaying" class="flex gap-12 justify-center items-end mb-8 h-32">
        <!-- Player hand -->
        <div class="flex flex-col items-center">
          <RPSHand
            :choice="playerChoice"
            :shaking="isShaking"
            :is-winner="result === 'win'"
            :is-loser="result === 'lose'"
            :is-tie="result === 'tie'"
            class="w-24 h-24"
          />
          <p class="text-gray-300 mt-2">You</p>
        </div>

        <!-- VS indicator -->
        <div class="text-2xl font-bold text-white">
          {{ isRevealing ? 'VS' : '🤝' }}
        </div>

        <!-- Opponent hand -->
        <div class="flex flex-col items-center">
          <RPSHand
            :choice="opponentChoice"
            :shaking="isShaking"
            :is-winner="result === 'lose'"
            :is-loser="result === 'win'"
            :is-tie="result === 'tie'"
            class="w-24 h-24"
          />
          <p class="text-gray-300 mt-2">Opponent</p>
        </div>
      </div>

      <!-- Result display -->
      <div v-if="result && isRevealing" class="text-center mb-8">
        <p v-if="result === 'win'" class="text-3xl font-bold text-yellow-300">YOU WIN!</p>
        <p v-else-if="result === 'lose'" class="text-3xl font-bold text-red-400">YOU LOSE!</p>
        <p v-else-if="result === 'tie'" class="text-3xl font-bold text-blue-300 animate-pulse">
          DRAW!
        </p>
      </div>

      <!-- Choice buttons -->
      <div v-if="!isPlaying" class="flex gap-6 justify-center mb-8">
        <button
          @click="makeChoice('rock')"
          :disabled="isCountingDown"
          class="choice-btn rock-btn"
          title="Rock"
        >
          <span class="text-4xl">✊</span>
        </button>
        <button
          @click="makeChoice('paper')"
          :disabled="isCountingDown"
          class="choice-btn paper-btn"
          title="Paper"
        >
          <span class="text-4xl">✋</span>
        </button>
        <button
          @click="makeChoice('scissors')"
          :disabled="isCountingDown"
          class="choice-btn scissors-btn"
          title="Scissors"
        >
          <span class="text-4xl">✌️</span>
        </button>
      </div>

      <!-- Countdown timer -->
      <div v-if="!isPlaying && countdownTime > 0" class="text-center">
        <div class="text-2xl font-bold text-yellow-400">{{ countdownTime }}</div>
        <p class="text-gray-400 text-sm">seconds to choose</p>
      </div>

      <!-- Play again button -->
      <div v-if="result && isRevealing && !isPlaying" class="text-center">
        <button
          @click="playAgain"
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Play Again
        </button>
      </div>

      <!-- Countdown timer for next round -->
      <div v-if="result && !isRevealing" class="text-center text-gray-400">
        <p>Next round in {{ nextRoundCountdown }}s</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import RPSHand from './RPSHand.vue'
import { useRPS } from '../../composables/useRPS'

const props = defineProps({
  mode: {
    type: String,
    default: 'lobby',
    validator: (val) => ['prematch', 'lobby', 'betting'].includes(val)
  },
  betAmount: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['result', 'choice'])

const {
  playerChoice,
  opponentChoice,
  result,
  isPlaying,
  determineWinner,
  autoChoice
} = useRPS()

const isShaking = ref(false)
const isRevealing = ref(false)
const countdownTime = ref(0)
const nextRoundCountdown = ref(0)
const isCountingDown = ref(false)

const CHOICE_TIMEOUT = 5000 // 5 seconds for lobby/betting
const PREMATCH_TIMEOUT = 3000 // 3 seconds for prematch
const SHAKE_DURATION = 900 // 3 cycles of 300ms each
const REVEAL_DELAY = SHAKE_DURATION + 300

const makeChoice = (choice) => {
  if (isPlaying.value || isCountingDown.value) return

  playerChoice.value = choice
  emit('choice', choice)
  startGame()
}

const startGame = () => {
  isPlaying.value = true
  isShaking.value = true
  countdownTime.value = 0

  // Auto-select opponent choice after shake
  setTimeout(() => {
    opponentChoice.value = autoChoice()
    isShaking.value = false
  }, SHAKE_DURATION)

  // Reveal result after shake completes
  setTimeout(() => {
    isRevealing.value = true
    result.value = determineWinner(playerChoice.value, opponentChoice.value)
    emit('result', {
      winner: result.value === 'win' ? 'player' : result.value === 'lose' ? 'opponent' : null,
      loser: result.value === 'lose' ? 'player' : result.value === 'win' ? 'opponent' : null,
      isTie: result.value === 'tie'
    })
  }, REVEAL_DELAY)

  // Auto reset after showing result
  setTimeout(() => {
    resetGame()
  }, REVEAL_DELAY + 2000)
}

const playAgain = () => {
  resetGame()
}

const resetGame = () => {
  result.value = null
  isRevealing.value = false
  isPlaying.value = false
  playerChoice.value = ''
  opponentChoice.value = ''
  nextRoundCountdown.value = 0
  startCountdown()
}

const startCountdown = () => {
  if (props.mode === 'prematch') {
    isCountingDown.value = true
    countdownTime.value = 3
    const timer = setInterval(() => {
      countdownTime.value--
      if (countdownTime.value <= 0) {
        clearInterval(timer)
        isCountingDown.value = false
        // Auto-trigger game when countdown ends in prematch
        if (props.mode === 'prematch') {
          playerChoice.value = autoChoice()
          startGame()
        }
      }
    }, 1000)
  } else {
    countdownTime.value = 5
    const timer = setInterval(() => {
      countdownTime.value--
      if (countdownTime.value <= 0) {
        clearInterval(timer)
        // Auto-select if timeout
        if (!isPlaying.value && playerChoice.value === '') {
          playerChoice.value = autoChoice()
          startGame()
        }
      }
    }, 1000)
  }
}

onMounted(() => {
  if (props.mode === 'prematch') {
    isCountingDown.value = true
    countdownTime.value = 3
    const timer = setInterval(() => {
      countdownTime.value--
      if (countdownTime.value <= 0) {
        clearInterval(timer)
        isCountingDown.value = false
      }
    }, 1000)
  }
})
</script>

<style scoped>
.rps-game-container {
  padding: 2rem;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%);
  border-radius: 1rem;
  min-height: 400px;
}

.prematch-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.game-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.choice-btn {
  width: 5rem;
  height: 5rem;
  border-radius: 1rem;
  border: 2px solid;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.choice-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
  border-color: rgba(255, 255, 255, 0.4);
}

.choice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.choice-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.rock-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.paper-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.scissors-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

@keyframes pulse-gold {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
