import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const board = ref(null)
  const moves = ref([])
  const currentPlayer = ref(null)
  const gameState = ref('waiting') // waiting, playing, finished

  const setBoard = (newBoard) => {
    board.value = newBoard
  }

  const addMove = (move) => {
    moves.value.push(move)
  }

  const setCurrentPlayer = (playerId) => {
    currentPlayer.value = playerId
  }

  const setGameState = (state) => {
    gameState.value = state
  }

  const resetGame = () => {
    board.value = null
    moves.value = []
    currentPlayer.value = null
    gameState.value = 'waiting'
  }

  return {
    board,
    moves,
    currentPlayer,
    gameState,
    setBoard,
    addMove,
    setCurrentPlayer,
    setGameState,
    resetGame,
  }
})
