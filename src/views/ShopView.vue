<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-black pb-8">
    <!-- Header with Balance -->
    <div class="sticky top-0 z-40 bg-gradient-to-b from-gray-900 to-gray-900/50 backdrop-blur border-b border-gray-700 py-4 px-4">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-2xl font-bold text-white mb-4">Shop</h1>
        <!-- Balance Display -->
        <div class="flex gap-3">
          <div class="flex items-center gap-2 bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/50 rounded-lg px-4 py-2">
            <span class="text-xl">💰</span>
            <div>
              <p class="text-xs text-gray-400">Koin</p>
              <p class="text-lg font-bold text-yellow-400">{{ userBalance.koin }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 bg-gradient-to-r from-purple-900/30 to-pink-800/20 border border-purple-700/50 rounded-lg px-4 py-2">
            <span class="text-xl">💎</span>
            <div>
              <p class="text-xs text-gray-400">Diamond</p>
              <p class="text-lg font-bold text-purple-400">{{ userBalance.diamond }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- Tab Navigation -->
      <div class="flex gap-2 mb-6 border-b border-gray-700 overflow-x-auto pb-4">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-2 font-semibold text-sm whitespace-nowrap transition-all duration-200 relative"
          :class="{
            'text-blue-400': activeTab === tab,
            'text-gray-400 hover:text-gray-300': activeTab !== tab
          }"
        >
          {{ tab }}
          <div
            v-if="activeTab === tab"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
          ></div>
        </button>
      </div>

      <!-- Themes Tab -->
      <div v-if="activeTab === 'Themes'" class="space-y-6">
        <!-- Bundle Section -->
        <div class="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-700/50 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white mb-1">All-Theme Bundle</h3>
              <p class="text-gray-400 text-sm">Get all 5 themes with -15% discount</p>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-2 justify-end mb-2">
                <span class="text-2xl">💎</span>
                <span class="text-3xl font-bold text-purple-400">2,900</span>
              </div>
              <button class="px-6 py-2 rounded font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all duration-200">
                Buy Bundle
              </button>
            </div>
          </div>
        </div>

        <!-- Themes Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="theme in themes"
            :key="theme.id"
            class="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors duration-200"
          >
            <!-- Theme Preview -->
            <div class="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              <!-- Day preview -->
              <div class="absolute inset-0 w-1/2 bg-gradient-to-r from-yellow-300 to-orange-300 opacity-40"></div>
              <!-- Night preview -->
              <div class="absolute inset-0 left-1/2 bg-gradient-to-r from-indigo-900 to-blue-900 opacity-40"></div>
              <div class="absolute inset-0 flex items-center justify-center text-4xl">
                🎨
              </div>
            </div>

            <!-- Content -->
            <div class="p-4">
              <h3 class="text-lg font-bold text-white mb-1">{{ theme.name }}</h3>
              <p class="text-sm text-gray-400 mb-4">{{ theme.description }}</p>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1 text-purple-400 font-semibold">
                  <span>💎</span>
                  <span>{{ theme.price_diamond }}</span>
                </div>
                <button
                  @click="handlePurchaseTheme(theme.id)"
                  :disabled="userBalance.diamond < (theme.price_diamond || 0) || loadingTheme === theme.id"
                  class="px-4 py-2 rounded font-semibold text-sm transition-all duration-200"
                  :class="{
                    'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500': userBalance.diamond >= (theme.price_diamond || 0) && loadingTheme !== theme.id,
                    'bg-gray-700 text-gray-500 cursor-not-allowed': userBalance.diamond < (theme.price_diamond || 0) || loadingTheme === theme.id
                  }"
                >
                  <span v-if="loadingTheme !== theme.id">Buy</span>
                  <span v-else class="inline-block animate-spin">⏳</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skills Tab -->
      <div v-if="activeTab === 'Skills'" class="space-y-6">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <SkillShopItem
            v-for="skill in skills"
            :key="skill.id"
            :skill="skill"
            :owned="ownedSkillIds.has(skill.id)"
            :canAfford="userBalance.koin >= (skill.price_koin || 0)"
            @purchase="handlePurchaseSkill"
          />
        </div>
      </div>

      <!-- Skins Tab (V1.1) -->
      <div v-if="activeTab === 'Skins'" class="text-center py-12">
        <div class="text-gray-400">
          <p class="text-lg font-semibold mb-2">🎨 Skins Coming Soon</p>
          <p class="text-sm">Dice, chess sets, and board themes coming in V1.1</p>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="translate-y-full opacity-0"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showToast"
        class="fixed bottom-4 left-4 right-4 bg-green-900/90 border border-green-700 text-green-100 px-4 py-3 rounded-lg flex items-center gap-2"
      >
        <span>✓</span>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useShopStore } from '@/stores/shop'
import { useSkillStore } from '@/stores/skill'
import SkillShopItem from '@/components/skill/SkillShopItem.vue'

const shopStore = useShopStore()
const skillStore = useSkillStore()

const activeTab = ref('Themes')
const tabs = ['Themes', 'Skills', 'Skins']
const showToast = ref(false)
const toastMessage = ref('')
const loadingTheme = ref(null)

const userBalance = ref({ koin: 0, diamond: 0 })

const skills = computed(() => shopStore.shopItems.filter(item => item.item_type !== 'skin'))
const themes = computed(() => shopStore.themes)
const ownedSkillIds = computed(() => skillStore.ownedSkillIds)

const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const handlePurchaseSkill = async (skillId) => {
  try {
    await skillStore.purchaseSkill(skillId)
    showToastMessage('Skill purchased!')
    await fetchUserBalance()
  } catch (error) {
    showToastMessage(error.message || 'Purchase failed')
  }
}

const handlePurchaseTheme = async (themeId) => {
  loadingTheme.value = themeId
  try {
    await shopStore.purchaseTheme(themeId)
    showToastMessage('Theme purchased!')
    await fetchUserBalance()
  } catch (error) {
    showToastMessage(error.message || 'Purchase failed')
  } finally {
    loadingTheme.value = null
  }
}

const fetchUserBalance = async () => {
  // This would fetch from user profile/auth context in real implementation
  // For now, placeholder
}

onMounted(async () => {
  await shopStore.fetchShopItems()
  await shopStore.fetchThemes()
  await skillStore.fetchSkills()
  // Fetch user balance here
})
</script>
