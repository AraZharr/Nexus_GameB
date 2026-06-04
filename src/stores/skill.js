import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useSkillStore = defineStore('skill', () => {
  const skills = ref([])
  const ownedSkills = ref([])
  const equippedSkills = ref({ slot1: null, slot2: null })
  const usedSkillsThisMatch = ref(new Set())
  const loading = ref(false)
  const error = ref(null)

  const userId = ref(null)

  // Computed properties
  const equippedSlot1 = computed(() => {
    const skillId = equippedSkills.value.slot1
    return skills.value.find(s => s.id === skillId) || null
  })

  const equippedSlot2 = computed(() => {
    const skillId = equippedSkills.value.slot2
    return skills.value.find(s => s.id === skillId) || null
  })

  const ownedSkillIds = computed(() => new Set(ownedSkills.value.map(s => s.skill_id)))

  const isSkillUsed = (slot) => usedSkillsThisMatch.value.has(slot)

  // Initialize with user ID
  const setUserId = (id) => {
    userId.value = id
  }

  // Fetch all available skills from Supabase
  const fetchSkills = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('skills')
        .select('*')
        .order('name')

      if (err) throw err
      skills.value = data || []
    } catch (e) {
      error.value = e.message
      console.error('Failed to fetch skills:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch user's owned skills from user_inventory
  const fetchOwnedSkills = async (uid = userId.value) => {
    if (!uid) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('user_inventory')
        .select('skill_id, acquired_at')
        .eq('user_id', uid)
        .eq('item_type', 'skill')
        .order('acquired_at', { ascending: false })

      if (err) throw err
      ownedSkills.value = data || []

      // Fetch equipped skills
      await fetchEquippedSkills(uid)
    } catch (e) {
      error.value = e.message
      console.error('Failed to fetch owned skills:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch currently equipped skills
  const fetchEquippedSkills = async (uid = userId.value) => {
    if (!uid) return
    try {
      const { data, error: err } = await supabase
        .from('user_inventory')
        .select('skill_id, equipped_slot')
        .eq('user_id', uid)
        .eq('item_type', 'skill')
        .eq('equipped', true)

      if (err) throw err

      equippedSkills.value = { slot1: null, slot2: null }
      if (data) {
        data.forEach(item => {
          if (item.equipped_slot === 1) equippedSkills.value.slot1 = item.skill_id
          if (item.equipped_slot === 2) equippedSkills.value.slot2 = item.skill_id
        })
      }
    } catch (e) {
      console.error('Failed to fetch equipped skills:', e)
    }
  }

  // Purchase a skill with Koin
  const purchaseSkill = async (skillId, uid = userId.value) => {
    if (!uid) throw new Error('User not authenticated')

    const skill = skills.value.find(s => s.id === skillId)
    if (!skill) throw new Error('Skill not found')

    if (ownedSkillIds.value.has(skillId)) {
      throw new Error('Skill already owned')
    }

    try {
      // Check user balance
      const { data: userData, error: userErr } = await supabase
        .from('profiles')
        .select('koin_balance')
        .eq('id', uid)
        .single()

      if (userErr) throw userErr
      if (userData.koin_balance < skill.price_koin) {
        throw new Error('Insufficient Koin')
      }

      // Deduct Koin
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ koin_balance: userData.koin_balance - skill.price_koin })
        .eq('id', uid)

      if (updateErr) throw updateErr

      // Add to inventory
      const { error: inventoryErr } = await supabase
        .from('user_inventory')
        .insert({
          user_id: uid,
          skill_id: skillId,
          item_type: 'skill',
          acquired_at: new Date().toISOString()
        })

      if (inventoryErr) throw inventoryErr

      // Update local state
      await fetchOwnedSkills(uid)

      return { success: true, message: `Purchased ${skill.name}` }
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  // Equip skill to a slot (1 or 2)
  const equipSkill = async (skillId, slot = 1, uid = userId.value) => {
    if (!uid) throw new Error('User not authenticated')
    if (![1, 2].includes(slot)) throw new Error('Invalid slot')
    if (!ownedSkillIds.value.has(skillId)) {
      throw new Error('Skill not owned')
    }

    try {
      // Unequip previous skill in this slot
      const slotKey = slot === 1 ? 'slot1' : 'slot2'
      if (equippedSkills.value[slotKey]) {
        await supabase
          .from('user_inventory')
          .update({ equipped: false, equipped_slot: null })
          .eq('user_id', uid)
          .eq('skill_id', equippedSkills.value[slotKey])
          .eq('item_type', 'skill')
      }

      // Equip new skill
      const { error: equipErr } = await supabase
        .from('user_inventory')
        .update({ equipped: true, equipped_slot: slot })
        .eq('user_id', uid)
        .eq('skill_id', skillId)
        .eq('item_type', 'skill')

      if (equipErr) throw equipErr

      // Update local state
      equippedSkills.value[slotKey] = skillId

      return { success: true }
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  // Unequip skill from a slot
  const unequipSkill = async (slot = 1, uid = userId.value) => {
    if (!uid) throw new Error('User not authenticated')
    if (![1, 2].includes(slot)) throw new Error('Invalid slot')

    const slotKey = slot === 1 ? 'slot1' : 'slot2'
    const skillId = equippedSkills.value[slotKey]

    if (!skillId) return { success: true }

    try {
      const { error: err } = await supabase
        .from('user_inventory')
        .update({ equipped: false, equipped_slot: null })
        .eq('user_id', uid)
        .eq('skill_id', skillId)
        .eq('item_type', 'skill')

      if (err) throw err

      equippedSkills.value[slotKey] = null
      return { success: true }
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  // Check if skill in slot can be used (not already used this match)
  const canUseSkill = (slot) => {
    if (![1, 2].includes(slot)) return false
    const slotKey = slot === 1 ? 'slot1' : 'slot2'
    return equippedSkills.value[slotKey] && !isSkillUsed(slot)
  }

  // Use skill in match (marks it as used for current match)
  const useSkill = (slot) => {
    if (!canUseSkill(slot)) {
      throw new Error('Cannot use skill in this slot')
    }
    usedSkillsThisMatch.value.add(slot)
    return { success: true }
  }

  // Reset used skills for new match
  const resetMatchSkills = () => {
    usedSkillsThisMatch.value.clear()
  }

  // Get skill by ID
  const getSkillById = (skillId) => {
    return skills.value.find(s => s.id === skillId)
  }

  return {
    // State
    skills,
    ownedSkills,
    equippedSkills,
    loading,
    error,

    // Computed
    equippedSlot1,
    equippedSlot2,
    ownedSkillIds,

    // Methods
    setUserId,
    fetchSkills,
    fetchOwnedSkills,
    fetchEquippedSkills,
    purchaseSkill,
    equipSkill,
    unequipSkill,
    canUseSkill,
    useSkill,
    isSkillUsed,
    resetMatchSkills,
    getSkillById
  }
})
