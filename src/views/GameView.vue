<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col overflow-hidden">
    <!-- Game Setup Screen (not in match) -->
    <div v-if="!gameStarted" class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="bg-slate-900 border-b border-slate-700 p-4">
        <router-link
          to="/dashboard"
          class="text-purple-400 hover:text-purple-300 text-sm mb-3 block"
        >
          Back to Dashboard
        </router-link>
        <h1 class="text-3xl font-bold">{{ gameTypeName }}</h1>
        <p class="text-slate-400">Select game mode</p>
      </div>

      <!-- Mode Selection -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h2 class="text-lg font-bold mb-3">Game Mode</h2>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="mode in ['classic', 'adventure', 'ranked']"
              :key="mode"
              @click="selectedMode = mode"
              :class="[
                'p-3 rounded-lg font-semibold transition text-sm',
                selectedMode === mode
                  ? 'bg-purple-600 shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800 hover:bg-slate-700'
              ]"
            >
              {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
            </button>
          </div>
        </div>

        <!-- Play Type Selection -->
        <div>
          <h2 class="text-lg font-bold mb-3">Play Mode</h2>
          <div class="space-y-2">
            <button
              @click="playType = 'online'"
              :class="[
                'w-full p-3 rounded-lg font-semibold transition text-left border-2',
                playType === 'online'
                  ? 'bg-blue-900 border-blue-600'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              ]"
            >
              <p class="font-bold">Play Online</p>
              <p class="text-xs text-slate-400">Match with another player</p>
            </button>
            <button
              @click="playType = 'offline'"
              :class="[
                'w-full p-3 rounded-lg font-semibold transition text-left border-2',
                playType === 'offline'
                  ? 'bg-blue-900 border-blue-600'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              ]"
            >
              <p class="font-bold">Play Offline</p>
              <p class="text-xs text-slate-400">Play against AI</p>
            </button>
          </div>
        </div>

        <!-- AI Difficulty (Offline) -->
        <div v-if="playType === 'offline'">
          <h2 class="text-lg font-bold mb-3">AI Difficulty</h2>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="level in ['easy', 'medium', 'hard']"
              :key="level"
              @click="aiDifficulty = level"
              :class="[
                'p-3 rounded-lg font-semibold transition text-sm',
                aiDifficulty === level
                  ? 'bg-amber-600 shadow-lg shadow-amber-500/50'
                  : 'bg-slate-800 hover:bg-slate-700'
              ]"
            >
              {{ level.charAt(0).toUpperCase() + level.slice(1) }}
            </button>
          </div>
        </div>

        <!-- Betting (Online) -->
        <div v-if="playType === 'online'">
          <h2 class="text-lg font-bold mb-3">Betting</h2>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="bettingEnabled"
              type="checkbox"
              class="w-4 h-4"
            />
            <span class="font-semibold">Enable Betting</span>
          </label>
        </div>
      </div>

      <!-- Start Game Button -->
      <div class="bg-slate-900 border-t border-slate-700 p-4">
        <button
          @click="startGame"
          class="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg font-bold hover:shadow-lg hover:shadow-green-500/50 transition"
        >
          {{ playType === 'online' ? 'Find Match' : 'Start Game' }}
        </button>
      </div>
    </div>

    <!-- In-Game Screen -->
    <div v-else class="flex-1 flex flex-col overflow-hidden">
      <!-- Timer (Chess) -->
      <div v-if="gameType === 'chess'" class="bg-slate-900 border-b border-slate-700 p-3 flex justify-between items-center">
        <div class="text-left">
          <p class="text-xs text-slate-400">Your Time</p>
          <p class="text-xl font-bold">{{ formatTime(playerTimer) }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold">Turn: {{ currentPlayer }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400">Opponent Time</p>
          <p class="text-xl font-bold">{{ formatTime(opponentTimer) }}</p>
        </div>
      </div>

      <!-- Game Board Area -->
      <div class="flex-1 overflow-hidden bg-black/50 flex items-center justify-center">
        <div class="text-center">
          <p class="text-2xl font-bold mb-2">{{ gameType.toUpperCase() }} Board</p>
          <p class="text-slate-400 text-sm mb-4">Game engine integration here</p>
          <div class="w-64 h-64 bg-gradient-to-br from-slate-800 to-slate-700 border-4 border-slate-600 rounded-lg flex items-center justify-center">
            <p class="text-slate-400">Board Placeholder</p>
          </div>
        </div>
      </div>

      <!-- Game Controls & Betting Panel -->
      <div class="bg-slate-900 border-t border-slate-700 p-4 space-y-3">
        <!-- Betting Display (if enabled) -->
        <BettingUI
          v-if="bettingEnabled"
          :pot-total="potTotal"
          :phase="gamePhase"
          :player-bet="playerBet"
          @place-bet="placeBet"
        />

        <!-- Game Controls -->
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="offerDraw"
            class="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-sm transition"
          >
            Offer Draw
          </button>
          <button
            @click="resign"
            class="px-3 py-2 bg-red-900 hover:bg-red-800 rounded-lg font-semibold text-sm transition"
          >
            Resign
          </button>
        </div>

        <!-- Skills (if enabled) -->
        <div v-if="skillsEnabled" class="space-y-2">
          <p class="text-xs font-semibold text-slate-400">Available Skills</p>
          <div class="flex gap-2">
            <button
              v-for="skill in availableSkills"
              :key="skill.id"
              @click="useSkill(skill.id)"
              :disabled="!skill.ready"
              :class="[
                'flex-1 px-2 py-2 rounded-lg font-semibold text-xs transition',
                skill.ready
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-slate-800 opacity-50 cursor-not-allowed'
              ]"
            >
              {{ skill.name }} {{ !skill.ready ? `(${skill.cooldown}s)` : '' }}
            </button>
          </div>
        </div>

        <!-- Resign/Draw Buttons -->
        <button
          @click="exitGame"
          class="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-sm transition"
        >
          Exit Game
        </button>
      </div>
    </div>

    <!-- Post-Match Reward Screen -->
    <div
      v-if="showRewardScreen"
      class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-slate-900 border-2 border-yellow-600 rounded-lg p-6 max-w-md w-full text-center">
        <p class="text-5xl mb-4">{{ matchResult === 'win' ? '🎉' : '😢' }}</p>
        <h2 class="text-3xl font-bold mb-4">
          {{ matchResult === 'win' ? 'Victory!' : 'Defeat' }}
        </h2>

        <div class="space-y-3 mb-6">
          <div class="bg-slate-800 p-3 rounded-lg">
            <p class="text-slate-400 text-sm mb-1">Base Rewards</p>
            <p class="text-2xl font-bold text-yellow-400">+{{ baseReward }} Koin</p>
          </div>
          <div v-if="matchResult === 'win'" class="bg-slate-800 p-3 rounded-lg">
            <p class="text-slate-400 text-sm mb-1">Win Bonus</p>
            <p class="text-2xl font-bold text-green-400">+{{ winBonus }} Koin</p>
          </div>
        </div>

        <button
          @click="watchAds"
          class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold mb-2 hover:shadow-lg hover:shadow-purple-500/50 transition"
        >
          x1.4 Reward with Ads
        </button>

        <button
          @click="continueToLobby"
          class="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BettingUI from '@/components/game/BettingUI.vue';

const route = useRoute();

const gameType = ref(route.params.type || 'chess');
const selectedMode = ref('classic');
const playType = ref('online');
const aiDifficulty = ref('medium');
const bettingEnabled = ref(false);
const skillsEnabled = ref(false);
const gameStarted = ref(false);
const gamePhase = ref('betting'); // betting, playing, finished
const currentPlayer = ref('You');
const playerTimer = ref(300);
const opponentTimer = ref(300);
const potTotal = ref(0);
const playerBet = ref(0);
const showRewardScreen = ref(false);
const matchResult = ref(null);
const baseReward = ref(100);
const winBonus = ref(50);

const availableSkills = ref([
  { id: 1, name: 'Freeze', ready: true, cooldown: 0 },
  { id: 2, name: 'Insight', ready: false, cooldown: 15 },
  { id: 3, name: 'Dodge', ready: true, cooldown: 0 },
]);

const gameTypeName = computed(() => {
  const names = { chess: 'Chess', ludo: 'Ludo', snakes: 'Snakes & Ladders' };
  return names[gameType.value] || 'Game';
});

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const startGame = () => {
  gamePhase.value = bettingEnabled.value ? 'betting' : 'playing';
  gameStarted.value = true;

  // Simulate game timer for chess
  if (gameType.value === 'chess') {
    const interval = setInterval(() => {
      if (currentPlayer.value === 'You') {
        playerTimer.value--;
        if (playerTimer.value <= 0) clearInterval(interval);
      } else {
        opponentTimer.value--;
        if (opponentTimer.value <= 0) clearInterval(interval);
      }
    }, 1000);
  }
};

const placeBet = (amount) => {
  playerBet.value = amount;
  potTotal.value += amount * 2;
  gamePhase.value = 'playing';
};

const useSkill = (skillId) => {
  console.log('Using skill:', skillId);
};

const offerDraw = () => {
  console.log('Draw offered');
};

const resign = () => {
  matchResult.value = 'loss';
  baseReward.value = 25;
  winBonus.value = 0;
  showRewardScreen.value = true;
};

const exitGame = () => {
  gameStarted.value = false;
  showRewardScreen.value = false;
  gamePhase.value = 'betting';
};

const watchAds = () => {
  baseReward.value = Math.floor(baseReward.value * 1.4);
  continueToLobby();
};

const continueToLobby = () => {
  gameStarted.value = false;
  showRewardScreen.value = false;
};

onMounted(() => {
  // Simulate match result after game time
  const timer = setTimeout(() => {
    if (gameStarted.value && gamePhase.value === 'playing') {
      matchResult.value = Math.random() > 0.5 ? 'win' : 'loss';
      showRewardScreen.value = true;
    }
  }, 30000); // 30 seconds for demo

  return () => clearTimeout(timer);
});
</script>
