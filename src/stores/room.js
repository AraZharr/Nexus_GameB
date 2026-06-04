import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRoomStore = defineStore('room', () => {
  const currentRoom = ref(null)
  const players = ref([])
  const readyStatus = ref({})

  const setRoom = (room) => {
    currentRoom.value = room
  }

  const setPlayers = (playerList) => {
    players.value = playerList
  }

  const updateReadyStatus = (uid, ready) => {
    readyStatus.value[uid] = ready
  }

  const clearRoom = () => {
    currentRoom.value = null
    players.value = []
    readyStatus.value = {}
  }

  return {
    currentRoom,
    players,
    readyStatus,
    setRoom,
    setPlayers,
    updateReadyStatus,
    clearRoom,
  }
})
