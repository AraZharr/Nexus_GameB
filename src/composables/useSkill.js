import { computed } from 'vue'
import { useSkillStore } from '@/stores/skill'

/**
 * Skill composable - wraps skill store with convenience methods
 * Provides skill effects integration and reactive properties
 */
export const useSkill = () => {
  const skillStore = useSkillStore()

  // Reactive computed properties
  const skills = computed(() => skillStore.skills)
  const ownedSkills = computed(() => skillStore.ownedSkills)
  const equippedSkills = computed(() => skillStore.equippedSkills)
  const equippedSlot1 = computed(() => skillStore.equippedSlot1)
  const equippedSlot2 = computed(() => skillStore.equippedSlot2)
  const ownedSkillIds = computed(() => skillStore.ownedSkillIds)
  const loading = computed(() => skillStore.loading)
  const error = computed(() => skillStore.error)

  /**
   * Check if a skill can be used in a specific slot
   * @param {number} slot - Slot number (1 or 2)
   * @returns {boolean}
   */
  const canUseSkill = (slot) => {
    return skillStore.canUseSkill(slot)
  }

  /**
   * Activate a skill (mark as used in current match)
   * @param {number} slot - Slot number (1 or 2)
   * @returns {{success: boolean, error?: string}}
   */
  const activateSkill = (slot) => {
    try {
      const result = skillStore.useSkill(slot)
      return result
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  /**
   * Check if a skill is already used this match
   * @param {number} slot - Slot number (1 or 2)
   * @returns {boolean}
   */
  const isSkillUsed = (slot) => {
    return skillStore.isSkillUsed(slot)
  }

  /**
   * Get skill name for a slot
   * @param {number} slot - Slot number (1 or 2)
   * @returns {string}
   */
  const getSkillName = (slot) => {
    if (slot === 1 && equippedSlot1.value) {
      return equippedSlot1.value.name
    }
    if (slot === 2 && equippedSlot2.value) {
      return equippedSlot2.value.name
    }
    return null
  }

  /**
   * Get skill description for a slot
   * @param {number} slot - Slot number (1 or 2)
   * @returns {string}
   */
  const getSkillDescription = (slot) => {
    if (slot === 1 && equippedSlot1.value) {
      return equippedSlot1.value.description
    }
    if (slot === 2 && equippedSlot2.value) {
      return equippedSlot2.value.description
    }
    return null
  }

  /**
   * Get skill effect for a slot
   * @param {number} slot - Slot number (1 or 2)
   * @returns {Object|null}
   */
  const getSkillEffect = (slot) => {
    if (slot === 1 && equippedSlot1.value) {
      return parseSkillEffect(equippedSlot1.value.effect)
    }
    if (slot === 2 && equippedSlot2.value) {
      return parseSkillEffect(equippedSlot2.value.effect)
    }
    return null
  }

  /**
   * Parse skill effect string into an object
   * Effects can be like: 'draw_extra_card', 'add_time_5s', 'freeze_opponent', etc.
   * @param {string} effectString - Effect string
   * @returns {Object|null}
   */
  const parseSkillEffect = (effectString) => {
    if (!effectString) return null

    const match = effectString.match(/^(\w+)(?:_(\d+))?([a-z]?)$/)
    if (!match) return null

    const [, effectType, value, unit] = match
    return {
      type: effectType,
      value: value ? parseInt(value) : null,
      unit: unit || null
    }
  }

  /**
   * Apply skill effect to game state
   * Returns the effect configuration for the game engine
   * @param {number} slot - Slot number
   * @param {Object} gameState - Current game state
   * @returns {Object|null}
   */
  const applySkillEffect = (slot, gameState = {}) => {
    if (!canUseSkill(slot)) {
      return null
    }

    const effect = getSkillEffect(slot)
    if (!effect) return null

    // Activate the skill
    activateSkill(slot)

    // Return effect for game engine to apply
    return {
      skillId: slot === 1 ? equippedSkill1.value?.id : equippedSkill2.value?.id,
      effect: effect,
      timestamp: Date.now()
    }
  }

  /**
   * Check if skill is owned
   * @param {string} skillId
   * @returns {boolean}
   */
  const isSkillOwned = (skillId) => {
    return ownedSkillIds.value.has(skillId)
  }

  /**
   * Get skill by ID
   * @param {string} skillId
   * @returns {Object|null}
   */
  const getSkillById = (skillId) => {
    return skillStore.getSkillById(skillId)
  }

  /**
   * Get all purchasable skills (not owned)
   * @returns {Array}
   */
  const getPurchasableSkills = () => {
    return skills.value.filter(skill => !isSkillOwned(skill.id))
  }

  /**
   * Get all unequipped owned skills
   * @returns {Array}
   */
  const getUnequippedSkills = () => {
    const slot1SkillId = equippedSkills.value.slot1
    const slot2SkillId = equippedSkills.value.slot2

    return skills.value.filter(
      skill => isSkillOwned(skill.id) &&
               skill.id !== slot1SkillId &&
               skill.id !== slot2SkillId
    )
  }

  /**
   * Initialize skill system
   * @param {string} uid - User ID
   */
  const initialize = async (uid) => {
    skillStore.setUserId(uid)
    await skillStore.fetchSkills()
    await skillStore.fetchOwnedSkills(uid)
  }

  /**
   * Fetch all available skills
   */
  const fetchSkills = () => {
    return skillStore.fetchSkills()
  }

  /**
   * Fetch user's owned skills
   * @param {string} uid - User ID (optional, uses stored if not provided)
   */
  const fetchOwnedSkills = (uid) => {
    return skillStore.fetchOwnedSkills(uid)
  }

  /**
   * Purchase a skill
   * @param {string} skillId
   */
  const purchaseSkill = (skillId) => {
    return skillStore.purchaseSkill(skillId)
  }

  /**
   * Equip skill to a slot
   * @param {string} skillId
   * @param {number} slot
   */
  const equipSkill = (skillId, slot = 1) => {
    return skillStore.equipSkill(skillId, slot)
  }

  /**
   * Unequip skill from a slot
   * @param {number} slot
   */
  const unequipSkill = (slot = 1) => {
    return skillStore.unequipSkill(slot)
  }

  /**
   * Reset skills used in match
   */
  const resetMatchSkills = () => {
    return skillStore.resetMatchSkills()
  }

  return {
    // State
    skills,
    ownedSkills,
    equippedSkills,
    equippedSlot1,
    equippedSlot2,
    ownedSkillIds,
    loading,
    error,

    // Checks
    canUseSkill,
    isSkillUsed,
    isSkillOwned,

    // Getters
    getSkillName,
    getSkillDescription,
    getSkillEffect,
    getSkillById,
    getPurchasableSkills,
    getUnequippedSkills,

    // Actions
    activateSkill,
    applySkillEffect,
    initialize,
    fetchSkills,
    fetchOwnedSkills,
    purchaseSkill,
    equipSkill,
    unequipSkill,
    resetMatchSkills,

    // Utility
    parseSkillEffect
  }
}
