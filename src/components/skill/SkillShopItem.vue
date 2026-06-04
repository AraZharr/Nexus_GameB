<template>
  <div class="relative bg-gray-900 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors duration-200">
    <!-- Preview Animation Placeholder -->
    <div class="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
      <div class="relative z-10 text-center">
        <div class="text-4xl mb-2">✨</div>
        <p class="text-gray-400 text-sm">{{ skill.effect_type }}</p>
      </div>
      <!-- Locked Overlay -->
      <div v-if="!owned && skill.unlock_condition && skill.unlock_condition !== 'none'" class="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
        <div class="text-center">
          <div class="text-3xl mb-2">🔒</div>
          <p class="text-xs text-gray-300">{{ formatUnlockCondition(skill.unlock_condition) }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 bg-gray-900">
      <!-- Category Badge -->
      <div class="flex items-center justify-between mb-2">
        <span class="px-2 py-1 text-xs font-semibold rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          {{ formatCategory(skill.category) }}
        </span>
        <span v-if="owned" class="text-xs font-semibold text-green-400">✓ Owned</span>
      </div>

      <!-- Skill Name -->
      <h3 class="text-sm font-bold text-white mb-1 truncate">{{ skill.name }}</h3>

      <!-- Description -->
      <p class="text-xs text-gray-400 line-clamp-2 mb-3">{{ skill.description }}</p>

      <!-- Price & Button -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1 text-yellow-500 font-semibold text-sm">
          <span>💰</span>
          <span>{{ skill.price_koin }}</span>
        </div>
        <button
          v-if="!owned"
          :disabled="!canAfford || loading"
          @click="handlePurchase"
          class="flex-1 px-3 py-2 rounded font-semibold text-sm transition-all duration-200"
          :class="{
            'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 active:scale-95': canAfford && !loading,
            'bg-gray-700 text-gray-500 cursor-not-allowed': !canAfford || loading
          }"
        >
          <span v-if="!loading">Buy</span>
          <span v-else class="inline-block animate-spin">⏳</span>
        </button>
        <div v-else class="flex-1 px-3 py-2 text-center rounded font-semibold text-sm bg-gray-800 text-green-400">
          Owned
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  skill: {
    type: Object,
    required: true
  },
  owned: {
    type: Boolean,
    default: false
  },
  canAfford: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['purchase'])

const loading = ref(false)

const handlePurchase = async () => {
  loading.value = true
  try {
    emit('purchase', props.skill.id)
  } finally {
    loading.value = false
  }
}

const formatCategory = (category) => {
  const categoryMap = {
    taunt: 'Taunt',
    visual: 'Visual',
    audio: 'Audio',
    board: 'Board',
    dice: 'Dice'
  }
  return categoryMap[category] || category
}

const formatUnlockCondition = (condition) => {
  const conditionMap = {
    play_5: 'Play 5 games',
    play_10: 'Play 10 games',
    play_20: 'Play 20 games',
    play_10_chess: 'Play 10 chess',
    play_10_ludo: 'Play 10 ludo',
    win_5: 'Win 5 games',
    win_10: 'Win 10 games',
    win_15: 'Win 15 games',
    win_20: 'Win 20 games',
    win_10_chess: 'Win 10 chess',
    win_10_ludo: 'Win 10 ludo',
    rank_silver: 'Silver rank',
    rank_gold: 'Gold rank'
  }
  return conditionMap[condition] || condition
}
</script>
