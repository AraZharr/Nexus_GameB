import { computed } from 'vue'
import { useEconomyStore } from '@/stores/economy'

/**
 * Economy composable - wraps economy store with convenience methods
 * Provides reactive computed properties and formatting functions
 */
export const useEconomy = () => {
  const economyStore = useEconomyStore()

  /**
   * Format number as Koin (add thousands separator and 'K' suffix for large numbers)
   * @param {number} n - Number to format
   * @returns {string}
   */
  const formatKoin = (n) => {
    if (n === undefined || n === null || isNaN(n)) return '0'
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M'
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K'
    }
    return n.toString()
  }

  /**
   * Format number as Diamond (add thousands separator)
   * @param {number} n - Number to format
   * @returns {string}
   */
  const formatDiamond = (n) => {
    if (n === undefined || n === null || isNaN(n)) return '0'
    return n.toLocaleString('en-US')
  }

  /**
   * Format number with commas
   * @param {number} n - Number to format
   * @returns {string}
   */
  const formatNumber = (n) => {
    if (n === undefined || n === null || isNaN(n)) return '0'
    return Math.round(n).toLocaleString('en-US')
  }

  // Reactive computed properties
  const koin = computed(() => economyStore.koin)
  const diamond = computed(() => economyStore.diamond)
  const totalKoinEarned = computed(() => economyStore.totalKoinEarned)
  const totalDiamondPurchased = computed(() => economyStore.totalDiamondPurchased)
  const dailyLoginStreak = computed(() => economyStore.dailyLoginStreak)
  const lastLoginDate = computed(() => economyStore.lastLoginDate)
  const dailyQuests = computed(() => economyStore.dailyQuests)
  const achievements = computed(() => economyStore.achievements)
  const offlineQueue = computed(() => economyStore.offlineQueue)

  // Formatted display properties
  const formattedKoin = computed(() => formatKoin(koin.value))
  const formattedDiamond = computed(() => formatDiamond(diamond.value))
  const formattedTotalKoinEarned = computed(() => formatNumber(totalKoinEarned.value))
  const formattedTotalDiamondPurchased = computed(() => formatNumber(totalDiamondPurchased.value))

  // Balance availability
  const hasKoin = computed(() => koin.value > 0)
  const hasDiamond = computed(() => diamond.value > 0)

  /**
   * Check if user can afford a specific amount of Koin
   * @param {number} amount
   * @returns {boolean}
   */
  const canAffordKoin = (amount) => {
    return economyStore.canAffordKoin(amount)
  }

  /**
   * Check if user can afford a specific amount of Diamond
   * @param {number} amount
   * @returns {boolean}
   */
  const canAffordDiamond = (amount) => {
    return economyStore.canAffordDiamond(amount)
  }

  /**
   * Initialize economy from Supabase
   * @param {string} uid - User ID
   */
  const initialize = (uid) => {
    return economyStore.initialize(uid)
  }

  /**
   * Add Koin with optional reason
   * @param {number} amount
   * @param {string} reason
   */
  const addKoin = (amount, reason = 'unknown') => {
    return economyStore.addKoin(amount, reason)
  }

  /**
   * Add Diamond with optional reason
   * @param {number} amount
   * @param {string} reason
   */
  const addDiamond = (amount, reason = 'unknown') => {
    return economyStore.addDiamond(amount, reason)
  }

  /**
   * Spend Koin
   * @param {number} amount
   */
  const spendKoin = (amount) => {
    return economyStore.spendKoin(amount)
  }

  /**
   * Spend Diamond
   * @param {number} amount
   */
  const spendDiamond = (amount) => {
    return economyStore.spendDiamond(amount)
  }

  /**
   * Claim daily login reward
   */
  const claimDailyLogin = () => {
    return economyStore.claimDailyLogin()
  }

  /**
   * Claim quest reward
   * @param {string} questId
   */
  const claimQuestReward = (questId) => {
    return economyStore.claimQuestReward(questId)
  }

  /**
   * Apply ad multiplier to a reward
   * @param {number} baseReward
   */
  const applyAdMultiplier = (baseReward) => {
    return economyStore.applyAdMultiplier(baseReward)
  }

  /**
   * Record ad multiplier use
   */
  const recordAdMultiplierUse = () => {
    return economyStore.recordAdMultiplierUse()
  }

  /**
   * Add RPS win and reward
   */
  const addRPSWin = () => {
    return economyStore.addRPSWin()
  }

  /**
   * Calculate match reward
   */
  const getMatchReward = (
    gameType,
    placement,
    isRanked = false,
    eloDiff = 0,
    winStreak = 0,
    killCount = 0,
    homeRun = false,
    ladderCount = 0
  ) => {
    return economyStore.getMatchReward(
      gameType,
      placement,
      isRanked,
      eloDiff,
      winStreak,
      killCount,
      homeRun,
      ladderCount
    )
  }

  /**
   * Sync offline earnings
   * @param {Array} offlineEarnings
   */
  const syncOfflineEconomy = (offlineEarnings) => {
    return economyStore.syncOfflineEconomy(offlineEarnings)
  }

  return {
    // State
    koin,
    diamond,
    totalKoinEarned,
    totalDiamondPurchased,
    dailyLoginStreak,
    lastLoginDate,
    dailyQuests,
    achievements,
    offlineQueue,

    // Formatted display
    formattedKoin,
    formattedDiamond,
    formattedTotalKoinEarned,
    formattedTotalDiamondPurchased,
    hasKoin,
    hasDiamond,

    // Format functions
    formatKoin,
    formatDiamond,
    formatNumber,

    // Balance checks
    canAffordKoin,
    canAffordDiamond,

    // Methods
    initialize,
    addKoin,
    addDiamond,
    spendKoin,
    spendDiamond,
    claimDailyLogin,
    claimQuestReward,
    applyAdMultiplier,
    recordAdMultiplierUse,
    addRPSWin,
    getMatchReward,
    syncOfflineEconomy
  }
}
