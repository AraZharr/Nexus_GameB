import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useEconomyStore = defineStore('economy', () => {
  const koin = ref(0)
  const diamond = ref(0)
  const totalKoinEarned = ref(0)
  const totalDiamondPurchased = ref(0)
  const dailyLoginStreak = ref(0)
  const lastLoginDate = ref(null)
  const dailyQuests = ref([])
  const achievements = ref([])
  const offlineQueue = ref([])

  const userId = ref(null)
  const dailyAdMultiplierUsed = ref(0)
  const dailyRPSWins = ref(0)
  const lastAdMultiplierDate = ref(null)
  const lastRPSWinDate = ref(null)
  const matchesPlayedToday = ref(0)
  const lastMatchDate = ref(null)

  // Computed properties
  const canAffordKoin = computed(() => (amount) => koin.value >= amount)
  const canAffordDiamond = computed(() => (amount) => diamond.value >= amount)
  const dailyAdMultiplierUsed_computed = computed(() => dailyAdMultiplierUsed.value)
  const dailyRPSWinsToday = computed(() => dailyRPSWins.value)

  /**
   * Check if a new day has started
   * @returns {boolean}
   */
  const isNewDay = () => {
    if (!lastMatchDate.value) return true
    const lastDate = new Date(lastMatchDate.value)
    const today = new Date()
    return lastDate.toDateString() !== today.toDateString()
  }

  /**
   * Reset daily counters if new day
   */
  const checkAndResetDaily = () => {
    if (isNewDay()) {
      matchesPlayedToday.value = 0
      dailyAdMultiplierUsed.value = 0
      dailyRPSWins.value = 0
      lastMatchDate.value = new Date().toISOString()
    }
  }

  /**
   * Initialize economy from Supabase users table
   * @param {string} uid - User ID
   */
  const initialize = async (uid) => {
    if (!uid) return
    userId.value = uid

    try {
      const { data, error } = await supabase
        .from('users')
        .select('koin_balance, diamond_balance, total_koin_earned, total_diamond_purchased, daily_login_streak, last_login_date, daily_quests, achievements')
        .eq('id', uid)
        .single()

      if (error) throw error

      if (data) {
        koin.value = data.koin_balance || 0
        diamond.value = data.diamond_balance || 0
        totalKoinEarned.value = data.total_koin_earned || 0
        totalDiamondPurchased.value = data.total_diamond_purchased || 0
        dailyLoginStreak.value = data.daily_login_streak || 0
        lastLoginDate.value = data.last_login_date || null
        dailyQuests.value = data.daily_quests || []
        achievements.value = data.achievements || []
      }

      checkAndResetDaily()
    } catch (error) {
      console.error('Error initializing economy:', error)
    }
  }

  /**
   * Add Koin with daily cap check
   * Diminishing returns after 20 matches: -50%
   * @param {number} amount - Amount to add
   * @param {string} reason - Reason for adding Koin
   * @returns {Promise<{success: boolean, finalAmount: number}>}
   */
  const addKoin = async (amount, reason = 'unknown') => {
    if (!userId.value || amount <= 0) {
      return { success: false, finalAmount: koin.value }
    }

    checkAndResetDaily()

    let finalAmount = amount

    // Apply diminishing returns after 20 matches
    if (matchesPlayedToday.value >= 20) {
      finalAmount = Math.floor(amount * 0.5)
    }

    koin.value += finalAmount
    totalKoinEarned.value += finalAmount

    try {
      const { error } = await supabase
        .from('users')
        .update({
          koin_balance: koin.value,
          total_koin_earned: totalKoinEarned.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId.value)

      if (error) throw error
      return { success: true, finalAmount }
    } catch (error) {
      console.error('Error adding Koin:', error)
      koin.value -= finalAmount
      totalKoinEarned.value -= finalAmount
      return { success: false, finalAmount: 0 }
    }
  }

  /**
   * Add Diamond
   * @param {number} amount - Amount to add
   * @param {string} reason - Reason for adding Diamond
   * @returns {Promise<{success: boolean}>}
   */
  const addDiamond = async (amount, reason = 'unknown') => {
    if (!userId.value || amount <= 0) {
      return { success: false }
    }

    diamond.value += amount
    totalDiamondPurchased.value += amount

    try {
      const { error } = await supabase
        .from('users')
        .update({
          diamond_balance: diamond.value,
          total_diamond_purchased: totalDiamondPurchased.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId.value)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error adding Diamond:', error)
      diamond.value -= amount
      totalDiamondPurchased.value -= amount
      return { success: false }
    }
  }

  /**
   * Spend Koin (deduct from balance)
   * @param {number} amount - Amount to spend
   * @returns {Promise<{success: boolean}>}
   */
  const spendKoin = async (amount) => {
    if (!userId.value || amount <= 0) {
      return { success: false }
    }

    if (koin.value < amount) {
      return { success: false }
    }

    koin.value -= amount

    try {
      const { error } = await supabase
        .from('users')
        .update({
          koin_balance: koin.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId.value)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error spending Koin:', error)
      koin.value += amount
      return { success: false }
    }
  }

  /**
   * Spend Diamond (deduct from balance)
   * @param {number} amount - Amount to spend
   * @returns {Promise<{success: boolean}>}
   */
  const spendDiamond = async (amount) => {
    if (!userId.value || amount <= 0) {
      return { success: false }
    }

    if (diamond.value < amount) {
      return { success: false }
    }

    diamond.value -= amount

    try {
      const { error } = await supabase
        .from('users')
        .update({
          diamond_balance: diamond.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId.value)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error spending Diamond:', error)
      diamond.value += amount
      return { success: false }
    }
  }

  /**
   * Claim daily login reward
   * Day 7: +20 Diamond
   * Day 30: +50 Diamond
   * Base: +50 Koin
   * @returns {Promise<{success: boolean, koinReward: number, diamondReward: number}>}
   */
  const claimDailyLogin = async () => {
    if (!userId.value) {
      return { success: false, koinReward: 0, diamondReward: 0 }
    }

    try {
      // Check if already claimed today
      if (lastLoginDate.value) {
        const lastDate = new Date(lastLoginDate.value)
        const today = new Date()
        if (lastDate.toDateString() === today.toDateString()) {
          return { success: false, koinReward: 0, diamondReward: 0, error: 'Already claimed today' }
        }
      }

      const newStreak = dailyLoginStreak.value + 1
      let diamondBonus = 0
      let koinBonus = 50

      if (newStreak === 7) {
        diamondBonus = 20
      } else if (newStreak === 30) {
        diamondBonus = 50
      }

      dailyLoginStreak.value = newStreak
      lastLoginDate.value = new Date().toISOString()

      // Apply rewards
      const addKoinResult = await addKoin(koinBonus, 'daily_login')
      if (diamondBonus > 0) {
        await addDiamond(diamondBonus, 'daily_login_milestone')
      }

      // Update streak in database
      const { error } = await supabase
        .from('users')
        .update({
          daily_login_streak: newStreak,
          last_login_date: lastLoginDate.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId.value)

      if (error) throw error

      return {
        success: true,
        koinReward: koinBonus,
        diamondReward: diamondBonus,
        streak: newStreak
      }
    } catch (error) {
      console.error('Error claiming daily login:', error)
      return { success: false, koinReward: 0, diamondReward: 0, error: error.message }
    }
  }

  /**
   * Claim quest reward
   * @param {string} questId - Quest ID
   * @returns {Promise<{success: boolean, koinReward: number}>}
   */
  const claimQuestReward = async (questId) => {
    if (!userId.value) {
      return { success: false, koinReward: 0 }
    }

    try {
      const quest = dailyQuests.value.find(q => q.id === questId)
      if (!quest) {
        return { success: false, koinReward: 0, error: 'Quest not found' }
      }

      if (quest.completed && !quest.claimed) {
        const reward = Math.floor(Math.random() * 71) + 30 // 30-100 Koin
        const result = await addKoin(reward, `quest_${questId}`)

        if (result.success) {
          quest.claimed = true
          const { error } = await supabase
            .from('users')
            .update({
              daily_quests: dailyQuests.value,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId.value)

          if (error) throw error
          return { success: true, koinReward: reward }
        }
      }

      return { success: false, koinReward: 0 }
    } catch (error) {
      console.error('Error claiming quest reward:', error)
      return { success: false, koinReward: 0, error: error.message }
    }
  }

  /**
   * Apply ad multiplier (1.4x reward)
   * Max 2 per day
   * @param {number} baseReward - Base reward to multiply
   * @returns {{multiplied: number, available: number}}
   */
  const applyAdMultiplier = (baseReward) => {
    checkAndResetDaily()

    if (dailyAdMultiplierUsed.value >= 2) {
      return { multiplied: baseReward, available: 0 }
    }

    const multiplied = Math.floor(baseReward * 1.4)
    return { multiplied, available: 2 - dailyAdMultiplierUsed.value - 1 }
  }

  /**
   * Record ad multiplier use
   * @returns {boolean}
   */
  const recordAdMultiplierUse = () => {
    checkAndResetDaily()

    if (dailyAdMultiplierUsed.value >= 2) {
      return false
    }

    dailyAdMultiplierUsed.value += 1
    return true
  }

  /**
   * Add RPS win (Rock Paper Scissors)
   * 5 Koin per win, max 10 wins/day
   * @returns {Promise<{success: boolean, koinReward: number, winsRemaining: number}>}
   */
  const addRPSWin = async () => {
    if (!userId.value) {
      return { success: false, koinReward: 0, winsRemaining: 0 }
    }

    checkAndResetDaily()

    if (dailyRPSWins.value >= 10) {
      return { success: false, koinReward: 0, winsRemaining: 0 }
    }

    const reward = 5
    const result = await addKoin(reward, 'rps_win')

    if (result.success) {
      dailyRPSWins.value += 1
      return {
        success: true,
        koinReward: reward,
        winsRemaining: Math.max(0, 10 - dailyRPSWins.value)
      }
    }

    return { success: false, koinReward: 0, winsRemaining: 10 - dailyRPSWins.value }
  }

  /**
   * Calculate match reward based on game type and placement
   * @param {string} gameType - 'chess', 'ludo', 'snakes'
   * @param {number} placement - 1st (1), 2nd (2), 3rd (3), 4th (4) for multiplayer
   * @param {boolean} isRanked - Is ranked match
   * @param {number} eloDiff - ELO difference (chess only)
   * @param {number} winStreak - Current win streak
   * @param {number} killCount - Kill count (ludo only)
   * @param {boolean} homeRun - Home run achieved (ludo only)
   * @param {number} ladderCount - Ladder count (snakes only)
   * @returns {number} Koin reward
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
    let baseReward = 0

    switch (gameType.toLowerCase()) {
      case 'chess':
        if (placement === 1) {
          baseReward = 80
        } else if (placement === 0) {
          // Loss
          baseReward = 25
        } else {
          // Draw
          baseReward = 40
        }

        // ELO bonus (up to +20)
        if (eloDiff > 0) {
          baseReward += Math.min(Math.floor(eloDiff / 20), 20)
        }

        // Ranked bonus
        if (isRanked) {
          baseReward = Math.floor(baseReward * 1.2)
        }
        break

      case 'ludo':
        switch (placement) {
          case 1:
            baseReward = 60
            break
          case 2:
            baseReward = 35
            break
          case 3:
            baseReward = 25
            break
          case 4:
            baseReward = 15
            break
          default:
            baseReward = 0
        }

        // Kill bonus (max +20)
        baseReward += Math.min(killCount * 5, 20)

        // Home run bonus
        if (homeRun) {
          baseReward += 10
        }

        // Ranked bonus
        if (isRanked) {
          baseReward = Math.floor(baseReward * 1.2)
        }
        break

      case 'snakes':
        switch (placement) {
          case 1:
            baseReward = 40
            break
          case 2:
            baseReward = 25
            break
          case 3:
            baseReward = 18
            break
          case 4:
            baseReward = 12
            break
          default:
            baseReward = 0
        }

        // Ladder bonus
        baseReward += ladderCount * 2

        // Ranked bonus
        if (isRanked) {
          baseReward = Math.floor(baseReward * 1.2)
        }
        break

      default:
        baseReward = 0
    }

    // Win streak bonus (max 25%)
    if (placement === 1 && winStreak > 0) {
      const streakBonus = Math.min(winStreak * 0.05, 0.25)
      baseReward = Math.floor(baseReward * (1 + streakBonus))
    }

    return Math.max(0, baseReward)
  }

  /**
   * Sync offline economy earnings
   * Batch upload offline Koin earnings
   * @param {Array} offlineEarnings - Array of {amount, reason, timestamp}
   * @returns {Promise<{success: boolean, totalEarnings: number}>}
   */
  const syncOfflineEconomy = async (offlineEarnings = []) => {
    if (!userId.value || offlineEarnings.length === 0) {
      return { success: false, totalEarnings: 0 }
    }

    try {
      let totalEarnings = 0

      for (const earning of offlineEarnings) {
        const result = await addKoin(earning.amount, earning.reason)
        if (result.success) {
          totalEarnings += result.finalAmount
        }
      }

      // Clear offline queue
      offlineQueue.value = []

      return { success: true, totalEarnings }
    } catch (error) {
      console.error('Error syncing offline economy:', error)
      return { success: false, totalEarnings: 0 }
    }
  }

  /**
   * Update balance from Supabase
   * @param {number} newKoin
   * @param {number} newDiamond
   */
  const updateBalance = (newKoin, newDiamond) => {
    koin.value = newKoin
    diamond.value = newDiamond
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
    userId,

    // Computed
    canAffordKoin,
    canAffordDiamond,
    dailyAdMultiplierUsed_computed,
    dailyRPSWinsToday,

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
    syncOfflineEconomy,
    updateBalance,
    checkAndResetDaily
  }
})
