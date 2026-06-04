import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAchievementStore = defineStore('achievement', () => {
  const achievements = ref([])
  const unlockedAchievements = ref([])
  const userId = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Achievement definitions with all metadata
  const achievementDefinitions = [
    // Games Category
    {
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first match',
      category: 'Games',
      condition: 'wins >= 1',
      rewardKoin: 50,
      rewardDiamond: 0,
      icon: 'trophy'
    },
    {
      id: 'win_10',
      name: 'Decathlon',
      description: 'Win 10 matches',
      category: 'Games',
      condition: 'wins >= 10',
      rewardKoin: 100,
      rewardDiamond: 0,
      icon: 'trophy'
    },
    {
      id: 'win_50',
      name: 'Half Century',
      description: 'Win 50 matches',
      category: 'Games',
      condition: 'wins >= 50',
      rewardKoin: 200,
      rewardDiamond: 10,
      icon: 'trophy'
    },
    {
      id: 'play_100',
      name: 'Centennial Player',
      description: 'Play 100 matches',
      category: 'Games',
      condition: 'total_matches >= 100',
      rewardKoin: 300,
      rewardDiamond: 0,
      icon: 'gamepad'
    },

    // Social Category
    {
      id: 'friend_5',
      name: 'Friend Circle',
      description: 'Add 5 friends',
      category: 'Social',
      condition: 'friends >= 5',
      rewardKoin: 50,
      rewardDiamond: 0,
      icon: 'users'
    },
    {
      id: 'friend_20',
      name: 'Popular',
      description: 'Add 20 friends',
      category: 'Social',
      condition: 'friends >= 20',
      rewardKoin: 100,
      rewardDiamond: 5,
      icon: 'users'
    },

    // Economy Category
    {
      id: 'earn_1000',
      name: 'Kilocoin',
      description: 'Earn 1,000 Koin total',
      category: 'Economy',
      condition: 'total_koin_earned >= 1000',
      rewardKoin: 50,
      rewardDiamond: 0,
      icon: 'coins'
    },
    {
      id: 'earn_10000',
      name: 'Millionaire',
      description: 'Earn 10,000 Koin total',
      category: 'Economy',
      condition: 'total_koin_earned >= 10000',
      rewardKoin: 200,
      rewardDiamond: 10,
      icon: 'coins'
    },
    {
      id: 'earn_100000',
      name: 'Billionaire',
      description: 'Earn 100,000 Koin total',
      category: 'Economy',
      condition: 'total_koin_earned >= 100000',
      rewardKoin: 500,
      rewardDiamond: 50,
      icon: 'coins'
    },

    // Skills Category
    {
      id: 'skill_first',
      name: 'Skill Collector',
      description: 'Purchase your first skill',
      category: 'Skills',
      condition: 'owned_skills >= 1',
      rewardKoin: 50,
      rewardDiamond: 0,
      icon: 'sparkles'
    },
    {
      id: 'skill_5',
      name: 'Skill Master',
      description: 'Own 5 skills',
      category: 'Skills',
      condition: 'owned_skills >= 5',
      rewardKoin: 150,
      rewardDiamond: 10,
      icon: 'sparkles'
    },
    {
      id: 'skill_10',
      name: 'Ultimate Arsenal',
      description: 'Own 10 skills',
      category: 'Skills',
      condition: 'owned_skills >= 10',
      rewardKoin: 300,
      rewardDiamond: 20,
      icon: 'sparkles'
    },

    // Themes Category
    {
      id: 'theme_first',
      name: 'Style Icon',
      description: 'Purchase your first theme',
      category: 'Themes',
      condition: 'owned_themes >= 1',
      rewardKoin: 50,
      rewardDiamond: 0,
      icon: 'palette'
    },
    {
      id: 'theme_5',
      name: 'Fashion Forward',
      description: 'Own 5 themes',
      category: 'Themes',
      condition: 'owned_themes >= 5',
      rewardKoin: 150,
      rewardDiamond: 5,
      icon: 'palette'
    },

    // Game-Specific Masters
    {
      id: 'chess_master',
      name: 'Chess Grandmaster',
      description: 'Reach 1500 ELO in Chess',
      category: 'Games',
      condition: 'chess_elo >= 1500',
      rewardKoin: 300,
      rewardDiamond: 20,
      icon: 'crown'
    },
    {
      id: 'ludo_king',
      name: 'Ludo Royalty',
      description: 'Reach 1500 ELO in Ludo',
      category: 'Games',
      condition: 'ludo_elo >= 1500',
      rewardKoin: 300,
      rewardDiamond: 20,
      icon: 'crown'
    },
    {
      id: 'snakes_master',
      name: 'Snakes Legend',
      description: 'Reach 1500 ELO in Snakes',
      category: 'Games',
      condition: 'snakes_elo >= 1500',
      rewardKoin: 300,
      rewardDiamond: 20,
      icon: 'crown'
    },

    // Streak Achievements
    {
      id: 'streak_5',
      name: 'Hot Hand',
      description: 'Achieve a 5-game win streak',
      category: 'Games',
      condition: 'max_win_streak >= 5',
      rewardKoin: 100,
      rewardDiamond: 0,
      icon: 'fire'
    },
    {
      id: 'streak_10',
      name: 'On Fire',
      description: 'Achieve a 10-game win streak',
      category: 'Games',
      condition: 'max_win_streak >= 10',
      rewardKoin: 300,
      rewardDiamond: 15,
      icon: 'fire'
    },
    {
      id: 'streak_20',
      name: 'Unstoppable',
      description: 'Achieve a 20-game win streak',
      category: 'Games',
      condition: 'max_win_streak >= 20',
      rewardKoin: 500,
      rewardDiamond: 30,
      icon: 'fire'
    },

    // Daily Login Streaks
    {
      id: 'daily_7',
      name: 'Weekly Warrior',
      description: 'Maintain a 7-day login streak',
      category: 'Economy',
      condition: 'daily_login_streak >= 7',
      rewardKoin: 100,
      rewardDiamond: 10,
      icon: 'calendar'
    },
    {
      id: 'daily_30',
      name: 'Monthly Maestro',
      description: 'Maintain a 30-day login streak',
      category: 'Economy',
      condition: 'daily_login_streak >= 30',
      rewardKoin: 500,
      rewardDiamond: 50,
      icon: 'calendar'
    },
    {
      id: 'daily_100',
      name: 'Century Dedication',
      description: 'Maintain a 100-day login streak',
      category: 'Economy',
      condition: 'daily_login_streak >= 100',
      rewardKoin: 1000,
      rewardDiamond: 100,
      icon: 'calendar'
    },

    // Match Statistics
    {
      id: 'perfect_game',
      name: 'Perfect Play',
      description: 'Win a match without losing a piece/turn',
      category: 'Games',
      condition: 'perfect_games >= 1',
      rewardKoin: 200,
      rewardDiamond: 5,
      icon: 'star'
    },
    {
      id: 'comeback_king',
      name: 'Comeback King',
      description: 'Win from a losing position',
      category: 'Games',
      condition: 'comeback_wins >= 1',
      rewardKoin: 150,
      rewardDiamond: 5,
      icon: 'zap'
    },
    {
      id: 'speedrun',
      name: 'Speed Demon',
      description: 'Win a match in under 2 minutes',
      category: 'Games',
      condition: 'speedrun_wins >= 1',
      rewardKoin: 100,
      rewardDiamond: 0,
      icon: 'zap'
    }
  ]

  /**
   * Initialize achievements for a user
   * @param {string} uid - User ID
   */
  const initialize = async (uid) => {
    if (!uid) return
    userId.value = uid
    await fetchAchievements()
  }

  /**
   * Fetch all achievement definitions and user's unlocked achievements
   */
  const fetchAchievements = async () => {
    if (!userId.value) return

    loading.value = true
    error.value = null

    try {
      achievements.value = [...achievementDefinitions]

      // Fetch user's unlocked achievements
      const { data, error: err } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId.value)

      if (err) throw err

      unlockedAchievements.value = data ? data.map(a => a.achievement_id) : []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching achievements:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if achievement should be unlocked based on conditions
   * @param {string} achievementId - Achievement ID
   * @param {Object} userStats - User statistics object
   * @returns {boolean}
   */
  const checkAchievement = (achievementId, userStats = {}) => {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (!achievement) return false

    // Already unlocked
    if (unlockedAchievements.value.includes(achievementId)) {
      return false
    }

    // Parse condition and check
    const condition = achievement.condition
    return evaluateCondition(condition, userStats)
  }

  /**
   * Evaluate achievement condition against user stats
   * @param {string} condition - Condition string (e.g., 'wins >= 10')
   * @param {Object} stats - User statistics
   * @returns {boolean}
   */
  const evaluateCondition = (condition, stats) => {
    // Parse condition: "field operator value"
    const match = condition.match(/(\w+)\s*(>=|<=|>|<|=)\s*(\d+)/)
    if (!match) return false

    const [, field, operator, value] = match
    const userValue = stats[field] || 0
    const compareValue = parseInt(value)

    switch (operator) {
      case '>=':
        return userValue >= compareValue
      case '<=':
        return userValue <= compareValue
      case '>':
        return userValue > compareValue
      case '<':
        return userValue < compareValue
      case '=':
        return userValue === compareValue
      default:
        return false
    }
  }

  /**
   * Unlock an achievement
   * @param {string} achievementId - Achievement ID
   * @returns {Promise<{success: boolean, achievement: Object}>}
   */
  const unlockAchievement = async (achievementId) => {
    if (!userId.value) {
      return { success: false }
    }

    // Already unlocked
    if (unlockedAchievements.value.includes(achievementId)) {
      return { success: false, error: 'Already unlocked' }
    }

    const achievement = achievements.value.find(a => a.id === achievementId)
    if (!achievement) {
      return { success: false, error: 'Achievement not found' }
    }

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert([
          {
            user_id: userId.value,
            achievement_id: achievementId,
            unlocked_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      unlockedAchievements.value.push(achievementId)

      return { success: true, achievement }
    } catch (err) {
      error.value = err.message
      console.error('Error unlocking achievement:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Get achievement progress
   * @param {string} achievementId - Achievement ID
   * @param {Object} userStats - User statistics
   * @returns {Object} Progress object {current, required, percentage, unlocked}
   */
  const getProgress = (achievementId, userStats = {}) => {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (!achievement) {
      return { current: 0, required: 0, percentage: 0, unlocked: false }
    }

    const isUnlocked = unlockedAchievements.value.includes(achievementId)
    const condition = achievement.condition

    // Parse condition
    const match = condition.match(/(\w+)\s*(>=|<=|>|<|=)\s*(\d+)/)
    if (!match) {
      return { current: 0, required: 0, percentage: 0, unlocked: isUnlocked }
    }

    const [, field, , value] = match
    const current = userStats[field] || 0
    const required = parseInt(value)
    const percentage = Math.min(Math.round((current / required) * 100), 100)

    return {
      current,
      required,
      percentage,
      unlocked: isUnlocked
    }
  }

  /**
   * Get all achievements for a category
   * @param {string} category - Category name
   * @returns {Array}
   */
  const getByCategory = (category) => {
    return achievements.value.filter(a => a.category === category)
  }

  /**
   * Get all unlocked achievements
   * @returns {Array}
   */
  const getUnlocked = () => {
    return achievements.value.filter(a => unlockedAchievements.value.includes(a.id))
  }

  /**
   * Calculate total rewards from achievements
   * @returns {{koin: number, diamond: number}}
   */
  const getTotalRewards = () => {
    let totalKoin = 0
    let totalDiamond = 0

    getUnlocked().forEach(achievement => {
      totalKoin += achievement.rewardKoin
      totalDiamond += achievement.rewardDiamond
    })

    return { koin: totalKoin, diamond: totalDiamond }
  }

  return {
    // State
    achievements,
    unlockedAchievements,
    userId,
    loading,
    error,

    // Methods
    initialize,
    fetchAchievements,
    checkAchievement,
    evaluateCondition,
    unlockAchievement,
    getProgress,
    getByCategory,
    getUnlocked,
    getTotalRewards
  }
})
