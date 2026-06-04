<template>
  <div class="space-y-4">
    <!-- Equip Slots Header -->
    <div class="mb-6">
      <h2 class="text-lg font-bold text-white mb-3">Equipped Skills</h2>
      <div class="grid grid-cols-2 gap-3">
        <!-- Slot 1 -->
        <div
          class="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden group"
          :class="equippedSlot1 ? 'border-blue-500 hover:border-blue-400' : 'border-gray-700 hover:border-gray-600'"
          @click="handleSlotClick(1)"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div v-if="equippedSlot1" class="inset-0 p-3 flex flex-col justify-between h-full">
            <div>
              <div class="text-2xl mb-1">1️⃣</div>
              <p class="text-xs text-gray-400">Slot 1</p>
            </div>
            <div>
              <p class="text-sm font-semibold text-white truncate">{{ equippedSlot1.name }}</p>
              <span class="text-xs text-blue-400">{{ formatCategory(equippedSlot1.category) }}</span>
            </div>
          </div>
          <div v-else class="inset-0 flex items-center justify-center text-center">
            <div>
              <div class="text-3xl mb-2 opacity-50">1️⃣</div>
              <p class="text-xs text-gray-500">Empty</p>
              <p class="text-xs text-gray-600 mt-1">Tap to equip</p>
            </div>
          </div>
        </div>

        <!-- Slot 2 -->
        <div
          class="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden group"
          :class="equippedSlot2 ? 'border-purple-500 hover:border-purple-400' : 'border-gray-700 hover:border-gray-600'"
          @click="handleSlotClick(2)"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div v-if="equippedSlot2" class="inset-0 p-3 flex flex-col justify-between h-full">
            <div>
              <div class="text-2xl mb-1">2️⃣</div>
              <p class="text-xs text-gray-400">Slot 2</p>
            </div>
            <div>
              <p class="text-sm font-semibold text-white truncate">{{ equippedSlot2.name }}</p>
              <span class="text-xs text-purple-400">{{ formatCategory(equippedSlot2.category) }}</span>
            </div>
          </div>
          <div v-else class="inset-0 flex items-center justify-center text-center">
            <div>
              <div class="text-3xl mb-2 opacity-50">2️⃣</div>
              <p class="text-xs text-gray-500">Empty</p>
              <p class="text-xs text-gray-600 mt-1">Tap to equip</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inventory Section -->
    <div>
      <h2 class="text-lg font-bold text-white mb-3">Owned Skills</h2>
      <div v-if="ownedSkillsList.length === 0" class="text-center py-8">
        <p class="text-gray-400">No skills owned yet</p>
        <p class="text-sm text-gray-500 mt-1">Purchase skills from the shop</p>
      </div>
      <div v-else class="grid grid-cols-2 gap-3">
        <div
          v-for="skill in ownedSkillsList"
          :key="skill.id"
          class="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:border-gray-500 active:scale-95"
          :class="{
            'ring-2 ring-blue-500': equippedSlot1?.id === skill.id,
            'ring-2 ring-purple-500': equippedSlot2?.id === skill.id
          }"
          @click="handleSkillClick(skill)"
        >
          <div class="text-2xl mb-2">✨</div>
          <p class="text-sm font-semibold text-white truncate">{{ skill.name }}</p>
          <p class="text-xs text-gray-400 truncate">{{ formatCategory(skill.category) }}</p>
          <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ skill.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSkillStore } from '@/stores/skill'

const skillStore = useSkillStore()

const emit = defineEmits(['equip', 'unequip'])

const equippedSlot1 = computed(() => skillStore.equippedSlot1)
const equippedSlot2 = computed(() => skillStore.equippedSlot2)

const ownedSkillsList = computed(() => {
  return skillStore.ownedSkills
    .map(owned => skillStore.getSkillById(owned.skill_id))
    .filter(skill => skill && !isEquipped(skill.id))
})

const isEquipped = (skillId) => {
  return (
    skillStore.equippedSkills.slot1 === skillId ||
    skillStore.equippedSkills.slot2 === skillId
  )
}

const handleSkillClick = async (skill) => {
  // Find first empty slot
  if (!equippedSlot1.value) {
    await skillStore.equipSkill(skill.id, 1)
    emit('equip', { skillId: skill.id, slot: 1 })
  } else if (!equippedSlot2.value) {
    await skillStore.equipSkill(skill.id, 2)
    emit('equip', { skillId: skill.id, slot: 2 })
  } else {
    // Replace slot 1 if both are full
    await skillStore.equipSkill(skill.id, 1)
    emit('equip', { skillId: skill.id, slot: 1 })
  }
}

const handleSlotClick = async (slot) => {
  const slotKey = slot === 1 ? 'slot1' : 'slot2'
  if (skillStore.equippedSkills[slotKey]) {
    await skillStore.unequipSkill(slot)
    emit('unequip', slot)
  }
}

const formatCategory = (category) => {
  const categoryMap = {
    taunt: 'Taunt',
    visual: 'Visual',
    audio: 'Audio',
    board: 'Board',
    dice: 'Dice'
  }
  return categoryMap[category] || category
}
</script>
