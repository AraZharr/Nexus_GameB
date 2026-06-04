import { ref, computed } from 'vue'
import { useEconomyStore } from '@/stores/economy'
import {
  HOUSE_FEE_PERCENT,
  MIN_BET,
  MAX_BET,
  MAX_BET_BALANCE_PERCENT,
  calculateHouseFee,
  calculateWinnerPayout,
  validateBet,
  calculateMultiPlayerDistribution,
  canPlayerBet,
  isAllInAllowed
} from '@/lib/betting'

/**
 * Betting composable - manages betting mechanics in matches
 */
export const useBetting = () => {
  const economyStore = useEconomyStore()

  // Betting state
  const bettingEnabled = ref(false)
  const minBet = ref(MIN_BET)
  const maxBet = ref(MAX_BET)
  const playerBets = ref({})
  const potTotal = ref(0)
  const isLocked = ref(false)
  const bettingResult = ref(null)

  // Betting history for current match
  const bettingHistory = ref([])

  /**
   * Create betting configuration for a match
   * @param {number} min - Minimum bet amount
   * @param {number} max - Maximum bet amount
   * @returns {{success: boolean, error?: string}}
   */
  const createBettingConfig = (min, max) => {
    if (min <= 0 || max <= 0) {
      return { success: false, error: 'Bet amounts must be positive' }
    }

    if (min > max) {
      return { success: false, error: 'Minimum bet cannot exceed maximum' }
    }

    minBet.value = min
    maxBet.value = max
    bettingEnabled.value = true
    potTotal.value = 0
    playerBets.value = {}
    isLocked.value = false

    return { success: true }
  }

  /**
   * Place a bet for a player
   * @param {string} playerId - Player ID
   * @param {number} amount - Bet amount
   * @returns {{success: boolean, locked: boolean, potTotal: number, error?: string}}
   */
  const placeBet = (playerId, amount) => {
    // Validate betting is enabled and not locked
    if (!bettingEnabled.value) {
      return { success: false, error: 'Betting is not enabled for this match' }
    }

    if (isLocked.value) {
      return { success: false, error: 'Betting is locked' }
    }

    // Validate bet amount
    const validation = validateBet(
      amount,
      economyStore.koin,
      minBet.value,
      maxBet.value
    )

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Check if player can bet (has sufficient balance)
    if (!canPlayerBet(economyStore.koin, maxBet.value)) {
      return { success: false, error: 'Insufficient balance to place this bet' }
    }

    // Deduct from player's balance (lock the koin)
    const spendResult = economyStore.spendKoin(amount)
    if (!spendResult.success) {
      return { success: false, error: 'Failed to lock bet amount' }
    }

    // Record the bet
    playerBets.value[playerId] = amount
    potTotal.value += amount

    // Record history
    bettingHistory.value.push({
      playerId,
      amount,
      timestamp: Date.now(),
      action: 'placed'
    })

    return {
      success: true,
      locked: true,
      potTotal: potTotal.value,
      playerBet: amount
    }
  }

  /**
   * Resolve betting based on match result
   * @param {string} winnerId - Winner's player ID
   * @param {number} playerCount - Number of players (2 or 4)
   * @param {Object} placements - {1: playerId, 2: playerId, ...} for multiplayer
   * @returns {{success: boolean, distributions: Array}}
   */
  const resolveBet = (winnerId, playerCount = 2, placements = {}) => {
    if (!bettingEnabled.value || potTotal.value === 0) {
      return { success: false, distributions: [] }
    }

    let distributions = []

    if (playerCount === 2) {
      // 2-player: winner gets 95% of pot
      const winnerPayout = calculateWinnerPayout(potTotal.value)
      distributions = [
        {
          playerId: winnerId,
          amount: winnerPayout,
          placement: 1
        }
      ]
    } else if (playerCount === 4 && placements) {
      // 4-player: distribute based on placements
      distributions = calculateMultiPlayerDistribution(potTotal.value, playerCount)
      // Map amounts to placementIds
      distributions = distributions.map(dist => ({
        playerId: placements[dist.place],
        amount: dist.amount,
        placement: dist.place
      }))
    }

    // Record resolution
    bettingHistory.value.push({
      action: 'resolved',
      timestamp: Date.now(),
      distributions
    })

    bettingResult.value = {
      potTotal: potTotal.value,
      distributions,
      houseFee: calculateHouseFee(potTotal.value)
    }

    return { success: true, distributions }
  }

  /**
   * Refund all bets (draw, dispute, admin close)
   * @returns {Promise<{success: boolean, refunded: number}>}
   */
  const refundAllBets = async () => {
    if (!bettingEnabled.value || potTotal.value === 0) {
      return { success: false, refunded: 0 }
    }

    try {
      let totalRefunded = 0

      for (const [playerId, amount] of Object.entries(playerBets.value)) {
        // Return koin to player
        const result = await economyStore.addKoin(amount, 'betting_refund')
        if (result.success) {
          totalRefunded += amount
        }
      }

      bettingHistory.value.push({
        action: 'refunded',
        timestamp: Date.now(),
        amount: totalRefunded
      })

      // Reset betting state
      resetBetting()

      return { success: true, refunded: totalRefunded }
    } catch (error) {
      console.error('Error refunding bets:', error)
      return { success: false, refunded: 0, error: error.message }
    }
  }

  /**
   * Lock betting (no more bets can be placed)
   */
  const lockBetting = () => {
    isLocked.value = true
  }

  /**
   * Reset betting state
   */
  const resetBetting = () => {
    bettingEnabled.value = false
    minBet.value = MIN_BET
    maxBet.value = MAX_BET
    playerBets.value = {}
    potTotal.value = 0
    isLocked.value = false
    bettingResult.value = null
    bettingHistory.value = []
  }

  /**
   * Get a player's current bet
   * @param {string} playerId
   * @returns {number}
   */
  const getPlayerBet = (playerId) => {
    return playerBets.value[playerId] || 0
  }

  /**
   * Get all player bets
   * @returns {Object}
   */
  const getAllBets = () => {
    return { ...playerBets.value }
  }

  /**
   * Check if betting is available for a player
   * @param {number} playerBalance - Player's koin balance
   * @returns {boolean}
   */
  const isBettingAvailable = (playerBalance = economyStore.koin) => {
    return bettingEnabled.value && !isLocked.value && canPlayerBet(playerBalance, maxBet.value)
  }

  /**
   * Get maximum bet allowed for player
   * @param {number} playerBalance - Player's koin balance
   * @returns {number}
   */
  const getMaxAllowedBet = (playerBalance = economyStore.koin) => {
    // Max bet is the minimum of configured max and 10% of balance
    const balanceLimit = Math.floor(playerBalance * (MAX_BET_BALANCE_PERCENT / 100))
    return Math.min(maxBet.value, balanceLimit)
  }

  /**
   * Calculate pot distribution for specific game
   * @param {number} place - Placement (1, 2, 3, or 4)
   * @param {number} playerCount - Total number of players
   * @returns {{place: number, percentage: number, amount: number}}
   */
  const calculatePlacementReward = (place, playerCount = 2) => {
    if (potTotal.value === 0) {
      return { place, percentage: 0, amount: 0 }
    }

    let percentage = 0

    if (playerCount === 2) {
      if (place === 1) {
        percentage = 95
      }
    } else if (playerCount === 4) {
      switch (place) {
        case 1:
          percentage = 70
          break
        case 2:
          percentage = 20
          break
        case 3:
          percentage = 10
          break
        case 4:
          percentage = 0
          break
      }
    }

    const amount = Math.floor((potTotal.value * percentage) / 100)
    return { place, percentage, amount }
  }

  // Computed properties
  const houseFee = computed(() => calculateHouseFee(potTotal.value))
  const playerCount = computed(() => Object.keys(playerBets.value).length)
  const hasActiveBets = computed(() => potTotal.value > 0)
  const canPlaceBets = computed(() => bettingEnabled.value && !isLocked.value)

  return {
    // State
    bettingEnabled,
    minBet,
    maxBet,
    playerBets,
    potTotal,
    isLocked,
    bettingResult,
    bettingHistory,

    // Computed
    houseFee,
    playerCount,
    hasActiveBets,
    canPlaceBets,

    // Methods
    createBettingConfig,
    placeBet,
    resolveBet,
    refundAllBets,
    lockBetting,
    resetBetting,
    getPlayerBet,
    getAllBets,
    isBettingAvailable,
    getMaxAllowedBet,
    calculatePlacementReward
  }
}
