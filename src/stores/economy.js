import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEconomyStore = defineStore('economy', () => {
  const koin = ref(0)
  const diamond = ref(0)
  const totalKoinEarned = ref(0)
  const totalDiamondPurchased = ref(0)

  const updateBalance = (newKoin, newDiamond) => {
    koin.value = newKoin
    diamond.value = newDiamond
  }

  const addKoin = (amount) => {
    koin.value += amount
    totalKoinEarned.value += amount
  }

  const addDiamond = (amount) => {
    diamond.value += amount
    totalDiamondPurchased.value += amount
  }

  return {
    koin,
    diamond,
    totalKoinEarned,
    totalDiamondPurchased,
    updateBalance,
    addKoin,
    addDiamond,
  }
})
