import { ref, reactive } from 'vue'

export function useRPS() {
  const playerChoice = ref('')
  const opponentChoice = ref('')
  const result = ref(null) // 'win', 'lose', 'tie'
  const isPlaying = ref(false)

  const gameState = reactive({
    wins: 0,
    losses: 0,
    ties: 0,
    totalRewardToday: 0,
    maxRewardPerDay: 50, // 5 Koin per win, max 10 wins/day
    rewardsToday: [],
    lastResetDate: new Date().toDateString()
  })

  /**
   * Determine the winner of a round
   * @param {string} player - 'rock', 'paper', or 'scissors'
   * @param {string} opponent - 'rock', 'paper', or 'scissors'
   * @returns {string} - 'win', 'lose', or 'tie'
   */
  const determineWinner = (player, opponent) => {
    if (player === opponent) {
      gameState.ties++
      return 'tie'
    }

    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    }

    if (winConditions[player] === opponent) {
      gameState.wins++
      addReward(5)
      return 'win'
    } else {
      gameState.losses++
      return 'lose'
    }
  }

  /**
   * Generate random opponent choice
   * @returns {string} - 'rock', 'paper', or 'scissors'
   */
  const autoChoice = () => {
    const choices = ['rock', 'paper', 'scissors']
    return choices[Math.floor(Math.random() * choices.length)]
  }

  /**
   * Add reward if daily limit not exceeded
   * @param {number} amount - Amount of Koin to reward
   */
  const addReward = (amount) => {
    const today = new Date().toDateString()

    // Reset if new day
    if (gameState.lastResetDate !== today) {
      gameState.totalRewardToday = 0
      gameState.rewardsToday = []
      gameState.lastResetDate = today
    }

    // Add reward if under daily limit
    if (gameState.totalRewardToday + amount <= gameState.maxRewardPerDay) {
      gameState.totalRewardToday += amount
      gameState.rewardsToday.push({
        amount,
        timestamp: new Date(),
        type: 'win'
      })
      return true
    }

    return false
  }

  /**
   * Get remaining daily reward capacity
   * @returns {number} - Remaining Koin available today
   */
  const getRemainingDailyReward = () => {
    const today = new Date().toDateString()

    if (gameState.lastResetDate !== today) {
      return gameState.maxRewardPerDay
    }

    return Math.max(0, gameState.maxRewardPerDay - gameState.totalRewardToday)
  }

  /**
   * Get game statistics
   * @returns {object} - Current game stats
   */
  const getStats = () => ({
    wins: gameState.wins,
    losses: gameState.losses,
    ties: gameState.ties,
    winRate: gameState.wins + gameState.losses > 0
      ? (gameState.wins / (gameState.wins + gameState.losses) * 100).toFixed(1)
      : 0,
    totalGames: gameState.wins + gameState.losses + gameState.ties,
    rewardToday: gameState.totalRewardToday,
    maxRewardToday: gameState.maxRewardPerDay,
    remainingReward: getRemainingDailyReward()
  })

  /**
   * Reset game state
   */
  const resetGame = () => {
    playerChoice.value = ''
    opponentChoice.value = ''
    result.value = null
    isPlaying.value = false
  }

  /**
   * Reset all statistics
   */
  const resetStats = () => {
    gameState.wins = 0
    gameState.losses = 0
    gameState.ties = 0
    gameState.totalRewardToday = 0
    gameState.rewardsToday = []
    gameState.lastResetDate = new Date().toDateString()
  }

  return {
    // State
    playerChoice,
    opponentChoice,
    result,
    isPlaying,
    gameState,

    // Methods
    determineWinner,
    autoChoice,
    addReward,
    getRemainingDailyReward,
    getStats,
    resetGame,
    resetStats
  }
}
