<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-black pb-8">
    <!-- Header Section -->
    <div class="bg-gradient-to-b from-gray-800/50 to-gray-900/20 border-b border-gray-700 px-4 py-6">
      <div class="max-w-4xl mx-auto">
        <!-- Profile Header -->
        <div class="flex gap-6 mb-6">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div class="relative w-24 h-24">
              <canvas
                ref="avatarCanvas"
                class="w-full h-full rounded-full border-4 border-blue-500"
              ></canvas>
              <button
                @click="showAvatarUpload = true"
                class="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 rounded-full p-2 text-white transition-colors"
              >
                📷
              </button>
            </div>
          </div>

          <!-- Profile Info -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <input
                v-model="displayName"
                @blur="updateDisplayName"
                class="text-2xl font-bold bg-transparent text-white border-b-2 border-gray-700 hover:border-gray-600 focus:border-blue-500 outline-none px-2"
                type="text"
              />
              <button @click="editNameMode = !editNameMode" class="text-gray-400">✎</button>
            </div>
            <p class="text-gray-400 text-sm">{{ userId }}</p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Matches Played" :value="stats.matchesPlayed" icon="🎮" />
          <StatCard label="Win Rate" :value="`${stats.winRate}%`" icon="🏆" />
          <StatCard label="ELO (Chess)" :value="stats.eloChess" icon="♟️" />
          <StatCard label="ELO (Ludo)" :value="stats.eloLudo" icon="🎲" />
          <StatCard label="Koin Earned" :value="stats.koinEarned" icon="💰" />
          <StatCard label="Diamond" :value="stats.diamond" icon="💎" />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <!-- Equipped Theme -->
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 class="text-lg font-bold text-white mb-4">Equipped Theme</h2>
        <div v-if="equippedTheme" class="flex items-center gap-4">
          <div class="w-32 aspect-video bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg opacity-40"></div>
          <div>
            <p class="text-white font-semibold">{{ equippedTheme.name }}</p>
            <button class="text-sm text-blue-400 hover:text-blue-300 mt-2">Change Theme</button>
          </div>
        </div>
      </div>

      <!-- Equipped Skills -->
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 class="text-lg font-bold text-white mb-4">Equipped Skills</h2>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="slot in [1, 2]"
            :key="slot"
            class="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center"
          >
            <p class="text-gray-400 text-sm mb-2">Slot {{ slot }}</p>
            <div v-if="equippedSkills[`slot${slot}`]" class="text-white">
              <p class="font-semibold">{{ equippedSkills[`slot${slot}`].name }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ equippedSkills[`slot${slot}`].category }}</p>
            </div>
            <div v-else class="text-gray-500 text-sm">Empty</div>
          </div>
        </div>
        <button class="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition-colors">
          Manage Skills
        </button>
      </div>

      <!-- Inventory Tabs -->
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div class="flex gap-2 mb-4 border-b border-gray-700">
          <button
            v-for="invTab in inventoryTabs"
            :key="invTab"
            @click="activeInventoryTab = invTab"
            class="px-4 py-2 font-semibold text-sm transition-colors"
            :class="{
              'text-blue-400 border-b-2 border-blue-400': activeInventoryTab === invTab,
              'text-gray-400': activeInventoryTab !== invTab
            }"
          >
            {{ invTab }}
          </button>
        </div>

        <!-- Themes Inventory -->
        <div v-if="activeInventoryTab === 'Themes'" class="grid grid-cols-3 gap-3">
          <div
            v-for="theme in ownedThemes"
            :key="theme.id"
            class="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:border-gray-600 transition-colors"
          >
            <div class="w-full aspect-video bg-gradient-to-r from-blue-400 to-purple-400 rounded mb-2 opacity-40"></div>
            <p class="text-sm font-semibold text-white truncate">{{ theme.name }}</p>
          </div>
        </div>

        <!-- Skills Inventory -->
        <div v-if="activeInventoryTab === 'Skills'" class="grid grid-cols-3 gap-3">
          <div
            v-for="skill in ownedSkills"
            :key="skill.id"
            class="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:border-gray-600 transition-colors"
          >
            <p class="text-2xl mb-1">✨</p>
            <p class="text-sm font-semibold text-white truncate">{{ skill.name }}</p>
            <p class="text-xs text-gray-400">{{ skill.category }}</p>
          </div>
        </div>

        <!-- Skins Inventory -->
        <div v-if="activeInventoryTab === 'Skins'" class="text-center py-8">
          <p class="text-gray-400">No skins yet</p>
        </div>
      </div>

      <!-- Custom Board Upload -->
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 class="text-lg font-bold text-white mb-4">Custom Board</h2>
        <div class="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
          <p class="text-gray-400 mb-2">📸 Upload a custom board image</p>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleBoardUpload"
          />
          <button
            @click="$refs.boardInput.click()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition-colors"
          >
            Choose Image
          </button>
        </div>
      </div>

      <!-- Login History -->
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 class="text-lg font-bold text-white mb-4">Login History</h2>
        <div class="space-y-2">
          <div
            v-for="(login, index) in loginHistory"
            :key="index"
            class="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0"
          >
            <div>
              <p class="text-gray-300 text-sm">{{ login.device }}</p>
              <p class="text-gray-500 text-xs">{{ formatDate(login.timestamp) }}</p>
            </div>
            <span class="text-green-400 text-sm">Active</span>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 class="text-lg font-bold text-white mb-4">Account Settings</h2>
        <div class="space-y-3">
          <button class="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300">
            ✎ Change Email
          </button>
          <button class="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-red-400">
            🗑️ Delete Account
          </button>
          <button class="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300">
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSkillStore } from '@/stores/skill'
import { useAuthStore } from '@/stores/auth'
import StatCard from '@/components/profile/StatCard.vue'

const skillStore = useSkillStore()
const authStore = useAuthStore()

const avatarCanvas = ref(null)
const displayName = ref('Player')
const userId = ref('')
const editNameMode = ref(false)
const showAvatarUpload = ref(false)
const activeInventoryTab = ref('Themes')
const inventoryTabs = ['Themes', 'Skills', 'Skins']

const stats = ref({
  matchesPlayed: 128,
  winRate: 62,
  eloChess: 1850,
  eloLudo: 1720,
  koinEarned: 45200,
  diamond: 890
})

const equippedTheme = ref({
  id: 'theme_1',
  name: 'Sunset Dreams'
})

const equippedSkills = ref({
  slot1: { name: 'Fire Trail', category: 'Visual' },
  slot2: { name: 'Lightning', category: 'Visual' }
})

const ownedThemes = ref([
  { id: 'theme_1', name: 'Sunset Dreams' },
  { id: 'theme_2', name: 'Ocean Vibes' }
])

const ownedSkills = computed(() => skillStore.ownedSkills.map(owned => skillStore.getSkillById(owned.skill_id)).filter(s => s))

const loginHistory = ref([
  { device: 'iPhone 13 Pro', timestamp: new Date(Date.now() - 2000000) },
  { device: 'MacBook Pro', timestamp: new Date(Date.now() - 86400000) },
  { device: 'iPad Air', timestamp: new Date(Date.now() - 172800000) },
  { device: 'iPhone 13 Pro', timestamp: new Date(Date.now() - 259200000) },
  { device: 'Chrome (Web)', timestamp: new Date(Date.now() - 345600000) }
])

const drawAvatar = () => {
  if (!avatarCanvas.value) return

  const canvas = avatarCanvas.value
  const ctx = canvas.getContext('2d')
  const size = canvas.width

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#3B82F6')
  gradient.addColorStop(1, '#8B5CF6')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Draw initials
  const initials = displayName.value.split(' ').map(n => n[0]).join('').toUpperCase()
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${size * 0.35}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials || 'P', size / 2, size / 2)
}

const updateDisplayName = async () => {
  editNameMode.value = false
  drawAvatar()
  // Update in database
}

const handleBoardUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    // Handle upload
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  userId.value = authStore.userId || 'Anonymous'
  drawAvatar()
})
</script>

<style scoped>
canvas {
  image-rendering: pixelated;
}
</style>
