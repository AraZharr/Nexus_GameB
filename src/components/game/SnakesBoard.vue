<template>
  <div class="flex flex-col items-center gap-6 p-4 bg-slate-900 min-h-screen rounded-lg">
    <!-- Game Title -->
    <h1 class="text-3xl font-bold text-white">Snakes & Ladders</h1>

    <!-- Player Info Bar -->
    <div class="w-full max-w-2xl bg-slate-800 rounded-lg p-4 flex justify-between items-center flex-wrap gap-2">
      <div
        v-for="(player, idx) in board.players"
        :key="idx"
        class="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-fit"
        :class="[
          idx === board.currentPlayer
            ? 'ring-2 ring-white bg-slate-700'
            : 'bg-slate-700/50',
          `text-${getPlayerColor(player.color)}-400`,
        ]"
      >
        <div
          class="w-4 h-4 rounded-full"
          :class="`bg-${getPlayerColor(player.color)}-500`"
        />
        <span class="font-semibold text-sm">{{ player.color }}</span>
        <span class="text-xs text-slate-400">{{ player.position }}/100</span>
      </div>
    </div>

    <!-- Main Game Container -->
    <div class="flex flex-col lg:flex-row gap-6 justify-center items-start">
      <!-- Snakes & Ladders Board -->
      <div class="w-full max-w-2xl aspect-square bg-slate-800 rounded-lg p-4 shadow-2xl border border-slate-700 overflow-hidden">
        <div class="w-full h-full grid grid-cols-10 gap-1 auto-rows-fr">
          <!-- Board cells (1-100 in reverse snake pattern) -->
          <div
            v-for="(cellNum, idx) in getBoardCells()"
            :key="idx"
            class="relative bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 cursor-pointer hover:bg-slate-600 transition-colors"
            :class="[
              getCellClass(cellNum),
              hasPiece(cellNum) && 'ring-2 ring-white',
            ]"
            @click="selectCell(cellNum)"
          >
            <!-- Cell number -->
            <span class="text-xs font-bold text-slate-400">{{ cellNum }}</span>

            <!-- Player pieces on this cell -->
            <div v-if="getPiecesOnCell(cellNum).length > 0" class="absolute inset-0 flex items-center justify-center">
              <div class="flex gap-1">
                <div
                  v-for="piece in getPiecesOnCell(cellNum)"
                  :key="`${piece.playerIdx}`"
                  class="w-4 h-4 rounded-full"
                  :class="`bg-${getPlayerColor(piece.color)}-500 border border-white`"
                />
              </div>
            </div>

            <!-- Ladder/Snake indicator -->
            <span v-if="board.ladders[cellNum]" class="absolute top-0.5 left-0.5 text-green-400 text-xs">
              ⬆
            </span>
            <span v-if="board.snakes[cellNum]" class="absolute top-0.5 left-0.5 text-red-400 text-xs">
              ⬇
            </span>
          </div>
        </div>
      </div>

      <!-- Control Panel -->
      <div class="w-full lg:w-80 flex flex-col gap-4">
        <!-- Dice -->
        <div class="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
          <p class="text-slate-400 text-sm mb-4">Roll Dice</p>
          <button
            @click="rollDice"
            :disabled="gameOver || diceRolling"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
          >
            <span v-if="!diceRolling"> Dice: {{ diceValue }} </span>
            <span v-else> Rolling... </span>
          </button>
        </div>

        <!-- Last Move Info -->
        <div v-if="lastMoveInfo" class="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p class="text-slate-300 text-sm font-semibold mb-2">Last Move:</p>
          <div class="space-y-1 text-sm text-slate-300">
            <p>From: {{ lastMoveInfo.from }}</p>
            <p>To: {{ lastMoveInfo.to }}</p>
            <p v-if="lastMoveInfo.climbedLadder" class="text-green-400">
              ⬆ Climbed a ladder!
            </p>
            <p v-if="lastMoveInfo.slidSnake" class="text-red-400">
              ⬇ Hit a snake!
            </p>
          </div>
        </div>

        <!-- Game Messages -->
        <div
          v-if="gameMessage"
          class="bg-slate-800 rounded-lg p-4 border border-slate-700 animate-pulse"
          :class="[
            gameMessage.type === 'success'
              ? 'border-green-600 bg-green-900/30'
              : gameMessage.type === 'warning'
                ? 'border-yellow-600 bg-yellow-900/30'
                : 'border-red-600 bg-red-900/30',
          ]"
        >
          <p
            class="text-sm"
            :class="[
              gameMessage.type === 'success'
                ? 'text-green-300'
                : gameMessage.type === 'warning'
                  ? 'text-yellow-300'
                  : 'text-red-300',
            ]"
          >
            {{ gameMessage.text }}
          </p>
        </div>

        <!-- Game Status -->
        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p class="text-slate-400 text-xs mb-2">Game Status</p>
          <div class="space-y-1 text-sm text-slate-300">
            <p>
              Current:
              <span class="font-semibold">{{
                board.players[board.currentPlayer].color
              }}</span>
            </p>
            <p>Position: <span class="font-semibold">{{ board.players[board.currentPlayer].position }}/100</span></p>
            <p>Dice: <span class="font-semibold">{{ diceValue }}</span></p>
          </div>
        </div>

        <!-- New Game Button -->
        <button
          v-if="gameOver"
          @click="startNewGame"
          class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
        >
          New Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SnakesEngine from '@/lib/snakes-engine.js';

const engine = ref(null);
const board = ref(null);
const diceValue = ref(1);
const diceRolling = ref(false);
const gameOver = ref(false);
const gameMessage = ref(null);
const lastMoveInfo = ref(null);

onMounted(() => {
  startNewGame();
});

const startNewGame = () => {
  engine.value = new SnakesEngine(4);
  board.value = engine.value.getBoard();
  diceValue.value = 1;
  gameOver.value = false;
  gameMessage.value = null;
  lastMoveInfo.value = null;
};

const rollDice = async () => {
  if (gameOver.value || diceRolling.value) return;

  diceRolling.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600));

  diceValue.value = engine.value.rollDice();
  diceRolling.value = false;

  const moveResult = engine.value.movePlayer(board.value.currentPlayer, diceValue.value);
  board.value = engine.value.getBoard();

  lastMoveInfo.value = {
    from: moveResult.from,
    to: moveResult.to,
    climbedLadder: moveResult.climbedLadder,
    slidSnake: moveResult.slidSnake,
  };

  if (moveResult.climbedLadder) {
    gameMessage.value = {
      type: 'success',
      text: 'Climbed a ladder!',
    };
  } else if (moveResult.slidSnake) {
    gameMessage.value = {
      type: 'warning',
      text: 'Hit a snake!',
    };
  }

  if (moveResult.won) {
    gameOver.value = true;
    gameMessage.value = {
      type: 'success',
      text: `${board.value.players[board.value.currentPlayer].color} player wins!`,
    };
    return;
  }

  engine.value.nextTurn(moveResult.extraTurn);
  board.value = engine.value.getBoard();
  diceValue.value = 1;

  setTimeout(() => {
    gameMessage.value = null;
  }, 2000);
};

const getBoardCells = () => {
  const cells = [];
  let cellNum = 100;

  // Generate 10 rows of 10 cells in snake pattern
  for (let row = 0; row < 10; row++) {
    if (row % 2 === 0) {
      // Left to right
      for (let col = 0; col < 10; col++) {
        cells.push(cellNum);
        cellNum--;
      }
    } else {
      // Right to left
      cellNum += 10;
      for (let col = 0; col < 10; col++) {
        cells.push(cellNum);
        cellNum--;
      }
      cellNum -= 10;
    }
  }

  return cells;
};

const getCellClass = (cellNum) => {
  if (board.value.ladders[cellNum]) {
    return 'bg-slate-700/80 border-green-500 border-2';
  }
  if (board.value.snakes[cellNum]) {
    return 'bg-slate-700/80 border-red-500 border-2';
  }
  return '';
};

const getPiecesOnCell = (cellNum) => {
  return board.value.players
    .filter((p) => p.position === cellNum)
    .map((p) => ({
      playerIdx: p.id,
      color: p.color,
    }));
};

const hasPiece = (cellNum) => {
  return board.value.players.some((p) => p.position === cellNum);
};

const selectCell = (cellNum) => {
  // Just for visual feedback - actual movement happens on dice roll
};

const getPlayerColor = (color) => {
  const colorMap = {
    red: 'red',
    green: 'green',
    yellow: 'yellow',
    blue: 'blue',
  };
  return colorMap[color] || 'blue';
};
</script>

<style scoped>
@keyframes climb {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes slide {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(20px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
