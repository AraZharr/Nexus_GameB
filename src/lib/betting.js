/**
 * Betting utility functions and constants
 * Handles all betting calculations and validations
 */

export const HOUSE_FEE_PERCENT = 5
export const MIN_BET = 50
export const MAX_BET = 1000
export const MAX_BET_BALANCE_PERCENT = 10

/**
 * Calculate house fee from pot
 * @param {number} pot - Total pot amount
 * @returns {number} House fee amount
 */
export const calculateHouseFee = (pot) => {
  return Math.floor((pot * HOUSE_FEE_PERCENT) / 100)
}

/**
 * Calculate winner payout (95% of pot after 5% house fee)
 * @param {number} pot - Total pot amount
 * @returns {number} Winner payout amount
 */
export const calculateWinnerPayout = (pot) => {
  return Math.floor(pot * (1 - HOUSE_FEE_PERCENT / 100))
}

/**
 * Validate a bet amount
 * @param {number} amount - Bet amount
 * @param {number} playerBalance - Player's current koin balance
 * @param {number} min - Minimum bet (default MIN_BET)
 * @param {number} max - Maximum bet (default MAX_BET)
 * @returns {{valid: boolean, error?: string}}
 */
export const validateBet = (amount, playerBalance, min = MIN_BET, max = MAX_BET) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { valid: false, error: 'Bet must be a positive integer' }
  }

  if (amount < min) {
    return { valid: false, error: `Minimum bet is ${min} Koin` }
  }

  if (amount > max) {
    return { valid: false, error: `Maximum bet is ${max} Koin` }
  }

  if (amount > playerBalance) {
    return { valid: false, error: 'Insufficient balance' }
  }

  return { valid: true }
}

/**
 * Calculate multiplayer pot distribution
 * For 4-player: 1st=70%, 2nd=20%, 3rd=10%, 4th=0%
 * House takes 5% from total
 * @param {number} pot - Total pot amount
 * @param {number} playerCount - Number of players (2 or 4)
 * @returns {Array} Array of {place, percentage, amount}
 */
export const calculateMultiPlayerDistribution = (pot, playerCount = 4) => {
  const fee = calculateHouseFee(pot)
  const availablePot = pot - fee

  if (playerCount === 2) {
    // 2-player: winner takes all
    return [
      { place: 1, percentage: 100, amount: availablePot }
    ]
  }

  if (playerCount === 4) {
    // 4-player distribution
    const first = Math.floor(availablePot * 0.7)
    const second = Math.floor(availablePot * 0.2)
    const third = Math.floor(availablePot * 0.1)
    const fourth = availablePot - first - second - third // Remainder goes to 4th place

    return [
      { place: 1, percentage: 70, amount: first },
      { place: 2, percentage: 20, amount: second },
      { place: 3, percentage: 10, amount: third },
      { place: 4, percentage: 0, amount: fourth > 0 ? fourth : 0 }
    ]
  }

  return []
}

/**
 * Check if a player can place a bet
 * Must have balance > max bet or be able to go all-in
 * @param {number} balance - Player's current koin balance
 * @param {number} maxBet - Maximum configured bet
 * @returns {boolean}
 */
export const canPlayerBet = (balance, maxBet = MAX_BET) => {
  // Can bet if balance is at least the minimum bet
  if (balance < MIN_BET) {
    return false
  }

  // Can always bet minimum
  if (balance >= MIN_BET) {
    return true
  }

  return false
}

/**
 * Check if all-in is allowed (player has less than max bet balance)
 * @param {number} balance - Player's current koin balance
 * @returns {boolean}
 */
export const isAllInAllowed = (balance) => {
  return balance < MAX_BET && balance >= MIN_BET
}

/**
 * Calculate maximum allowed bet for a player
 * Limited by: configured max, balance, and 10% rule
 * @param {number} balance - Player's current koin balance
 * @param {number} configuredMax - Configured maximum bet
 * @returns {number} Maximum bet allowed
 */
export const getMaxAllowedBet = (balance, configuredMax = MAX_BET) => {
  // 10% of balance limit
  const balanceLimit = Math.floor(balance * (MAX_BET_BALANCE_PERCENT / 100))

  // Take the minimum of all limits
  return Math.min(
    configuredMax,
    balanceLimit,
    balance
  )
}

/**
 * Validate bet range is reasonable
 * @param {number} min - Minimum bet
 * @param {number} max - Maximum bet
 * @returns {{valid: boolean, error?: string}}
 */
export const validateBetRange = (min, max) => {
  if (min <= 0 || max <= 0) {
    return { valid: false, error: 'Bet amounts must be positive' }
  }

  if (min > max) {
    return { valid: false, error: 'Minimum cannot exceed maximum' }
  }

  if (min < 10) {
    return { valid: false, error: 'Minimum bet is too low (minimum: 10)' }
  }

  return { valid: true }
}

/**
 * Format bet amount for display
 * @param {number} amount - Bet amount
 * @returns {string}
 */
export const formatBet = (amount) => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K'
  }
  return amount.toString()
}

/**
 * Calculate pot value after fees
 * @param {Array} bets - Array of bet amounts
 * @returns {number}
 */
export const calculatePotValue = (bets) => {
  const total = Array.isArray(bets) ? bets.reduce((sum, bet) => sum + bet, 0) : 0
  return total
}

/**
 * Check if a result should trigger a refund
 * Draw or disputed results
 * @param {string} result - Result code ('win', 'draw', 'dispute', 'forfeit')
 * @returns {boolean}
 */
export const shouldRefundBets = (result) => {
  return result === 'draw' || result === 'dispute'
}

/**
 * Calculate total pot from player bets
 * @param {Object} playerBets - {playerId: amount}
 * @returns {number}
 */
export const getTotalPot = (playerBets) => {
  return Object.values(playerBets || {}).reduce((sum, amount) => sum + amount, 0)
}

/**
 * Get number of active bettors
 * @param {Object} playerBets - {playerId: amount}
 * @returns {number}
 */
export const getActiveBettorCount = (playerBets) => {
  return Object.keys(playerBets || {}).length
}

/**
 * Check if all players have placed equal bets (for fairness)
 * @param {Object} playerBets - {playerId: amount}
 * @returns {boolean}
 */
export const areAllBetsEqual = (playerBets) => {
  const amounts = Object.values(playerBets || {})
  if (amounts.length === 0) return true
  return amounts.every(amount => amount === amounts[0])
}
