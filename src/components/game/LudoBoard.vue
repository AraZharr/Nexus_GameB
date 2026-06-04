<template>
  <div class="flex flex-col items-center gap-6 p-4 bg-slate-900 min-h-screen rounded-lg">
    <!-- Game Title -->
    <h1 class="text-3xl font-bold text-white">Ludo Game</h1>

    <!-- Player Info Bar -->
    <div class="w-full max-w-2xl bg-slate-800 rounded-lg p-4 flex justify-between items-center">
      <div
        v-for="(player, idx) in board.players"
        :key="idx"
        class="flex items-center gap-2 px-3 py-2 rounded-lg"
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
        <span class="font-semibold">{{ player.color }}</span>
        <span class="text-xs text-slate-400">
          {{ player.pieces.filter((p) => p.state === 'home').length }}/4
        </span>
        <span v-if="idx === board.currentPlayer" class="text-xs text-yellow-400">
          ★
        </span>
      </div>
    </div>

    <!-- Main Game Container -->
    <div class="flex flex-col lg:flex-row gap-6 justify-center items-start">
      <!-- Ludo Board -->
      <div class="w-full max-w-2xl aspect-square bg-slate-800 rounded-lg p-4 shadow-2xl border border-slate-700">
        <svg
          viewBox="0 0 400 400"
          class="w-full h-full"
          @click="handleBoardClick"
        >
          <!-- Background -->
          <rect width="400" height="400" fill="#1e293b" />

          <!-- Board Grid Lines -->
          <g stroke="#475569" stroke-width="1">
            <line x1="0" y1="100" x2="400" y2="100" />
            <line x1="0" y1="200" x2="400" y2="200" />
            <line x1="0" y1="300" x2="400" y2="300" />
            <line x1="100" y1="0" x2="100" y2="400" />
            <line x1="200" y1="0" x2="200" y2="400" />
            <line x1="300" y1="0" x2="300" y2="400" />
          </g>

          <!-- Home Areas (Corners) -->
          <!-- Red Home (Top-Left) -->
          <rect x="0" y="0" width="100" height="100" fill="#7f1d1d" opacity="0.3" />
          <text x="50" y="50" text-anchor="middle" dy="0.3em" fill="#fca5a5" font-size="12" font-weight="bold">
            Red Home
          </text>

          <!-- Green Home (Top-Right) -->
          <rect x="300" y="0" width="100" height="100" fill="#15803d" opacity="0.3" />
          <text x="350" y="50" text-anchor="middle" dy="0.3em" fill="#86efac" font-size="12" font-weight="bold">
            Green Home
          </text>

          <!-- Yellow Home (Bottom-Left) -->
          <rect x="0" y="300" width="100" height="100" fill="#854d0e" opacity="0.3" />
          <text x="50" y="350" text-anchor="middle" dy="0.3em" fill="#facc15" font-size="12" font-weight="bold">
            Yellow Home
          </text>

          <!-- Blue Home (Bottom-Right) -->
          <rect x="300" y="300" width="100" height="100" fill="#1e3a8a" opacity="0.3" />
          <text x="350" y="350" text-anchor="middle" dy="0.3em" fill="#60a5fa" font-size="12" font-weight="bold">
            Blue Home
          </text>

          <!-- Center Safe Zone -->
          <circle cx="200" cy="200" r="30" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,5" />

          <!-- Board Path Cells -->
          <g id="board-cells">
            <!-- Draw cells around the board -->
            <circle
              v-for="(cellPos, idx) in getPathCellPositions()"
              :key="`cell-${idx}`"
              :cx="cellPos.x"
              :cy="cellPos.y"
              r="8"
              :fill="getCellColor(idx)"
              :opacity="0.6"
              :stroke="isSafeCell(idx) ? '#fbbf24' : '#94a3b8'"
              :stroke-width="isSafeCell(idx) ? '2' : '1'"
            />

            <!-- Star markers for safe cells -->
            <text
              v-for="idx in getSafeCells()"
              :key="`star-${idx}`"
              :x="getPathCellPositions()[idx]?.x"
              :y="getPathCellPositions()[idx]?.y"
              text-anchor="middle"
              dy="0.3em"
              fill="#fbbf24"
              font-size="10"
              font-weight="bold"
            >
              ★
            </text>
          </g>

          <!-- Pieces -->
          <g id="pieces">
            <circle
              v-for="(piece, pIdx, playerIdx) in getPieceRenderData()"
              :key="`piece-${playerIdx}-${pIdx}`"
              :cx="piece.x"
              :cy="piece.y"
              :r="piece.radius"
              :fill="getPieceColor(piece.color)"
              :opacity="piece.opacity"
              :stroke="piece.state === 'selected' ? 'white' : piece.color === 'selected' ? 'gold' : 'white'"
              :stroke-width="piece.state === 'selected' ? '3' : '2'"
              @click.stop="selectPiece(playerIdx, pIdx)"
              class="cursor-pointer transition-all hover:opacity-100"
            />

            <!-- Piece numbers -->
            <text
              v-for="(piece, pIdx, playerIdx) in getPieceRenderData()"
              :key="`piece-num-${playerIdx}-${pIdx}`"
              :x="piece.x"
              :y="piece.y"
              text-anchor="middle"
              dy="0.3em"
              fill="white"
              font-size="10"
              font-weight="bold"
              class="pointer-events-none"
            >
              {{ pIdx + 1 }}
            </text>
          </g>
        </svg>
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

        <!-- Legal Moves -->
        <div
          v-if="currentLegalMoves.length > 0"
          class="bg-slate-800 rounded-lg p-4 border border-slate-700"
        >
          <p class="text-slate-300 text-sm font-semibold mb-3">Legal Moves:</p>
          <div class="space-y-2">
            <button
              v-for="(move, idx) in currentLegalMoves"
              :key="idx"
              @click="makeMove(move)"
              class="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-200 transition-colors"
            >
              Piece {{ move.pieceIdx + 1 }}: {{ move.from || 'yard' }} → {{ move.to }}
              <span v-if="move.type === 'home'" class="text-yellow-400 ml-2">🏠</span>
            </button>
          </div>
        </div>

        <!-- Game Messages -->
        <div
          v-if="gameMessage"
          class="bg-slate-800 rounded-lg p-4 border border-slate-700"
          :class="[
            gameMessage.type === 'success'
              ? 'border-green-600 bg-green-900/30'
              : 'border-yellow-600 bg-yellow-900/30',
          ]"
        >
          <p
            class="text-sm"
            :class="[
              gameMessage.type === 'success' ? 'text-green-300' : 'text-yellow-300',
            ]"
          >
            {{ gameMessage.text }}
          </p>
        </div>

        <!-- Game Status -->
        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p class="text-slate-400 text-xs mb-2">Game Status</p>
          <div class="space-y-1 text-sm text-slate-300">
            <p>Current: <span class="font-semibold">{{ board.players[board.currentPlayer].color }}</span></p>
            <p>Dice: <span class="font-semibold">{{ diceValue }}</span></p>
            <p v-if="selectedPiece !== null">
              Selected: Piece {{ selectedPiece.piece + 1 }}
            </p>
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
import LudoEngine from '@/lib/ludo-engine.js';

const engine = ref(null);
const board = ref(null);
const diceValue = ref(1);
const diceRolling = ref(false);
const gameOver = ref(false);
const selectedPiece = ref(null);
const gameMessage = ref(null);

onMounted(() => {
  startNewGame();
});

const startNewGame = () => {
  engine.value = new LudoEngine(4);
  board.value = engine.value.getBoard();
  diceValue.value = 1;
  gameOver.value = false;
  selectedPiece.value = null;
  gameMessage.value = null;
};

const rollDice = async () => {
  diceRolling.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600));

  diceValue.value = engine.value.rollDice();
  diceRolling.value = false;

  const moves = engine.value.getLegalMoves(board.value.currentPlayer, diceValue.value);
  if (moves.length === 0) {
    gameMessage.value = {
      type: 'info',
      text: 'No legal moves. Turn skipped.',
    };
    setTimeout(() => {
      engine.value.nextTurn(false);
      board.value = engine.value.getBoard();
      gameMessage.value = null;
      diceValue.value = 1;
    }, 2000);
  }
};

const currentLegalMoves = computed(() => {
  if (!board.value || diceValue.value === 1) return [];
  return engine.value.getLegalMoves(board.value.currentPlayer, diceValue.value);
});

const makeMove = (move) => {
  if (!engine.value || !board.value) return;

  const result = engine.value.makeMove(
    board.value.currentPlayer,
    move.pieceIdx,
    diceValue.value
  );

  board.value = engine.value.getBoard();

  if (result.killed) {
    gameMessage.value = {
      type: 'success',
      text: 'Enemy piece killed!',
    };
  } else if (result.finishedPiece) {
    gameMessage.value = {
      type: 'success',
      text: 'Piece reached home!',
    };
  }

  if (engine.value.isGameOver()) {
    gameOver.value = true;
    gameMessage.value = {
      type: 'success',
      text: `${board.value.players[board.value.currentPlayer].color} player wins!`,
    };
    return;
  }

  engine.value.nextTurn(result.extraTurn);
  board.value = engine.value.getBoard();
  diceValue.value = 1;
  selectedPiece.value = null;

  setTimeout(() => {
    gameMessage.value = null;
  }, 2000);
};

const selectPiece = (playerIdx, pieceIdx) => {
  if (playerIdx !== board.value.currentPlayer) return;
  selectedPiece.value = { player: playerIdx, piece: pieceIdx };
};

const handleBoardClick = () => {
  selectedPiece.value = null;
};

const getPathCellPositions = () => {
  const positions = [];
  const centerX = 200;
  const centerY = 200;
  const radius = 120;

  // Generate 52 cells around a circular path
  for (let i = 0; i < 52; i++) {
    const angle = (i / 52) * Math.PI * 2 - Math.PI / 2;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  return positions;
};

const getCellColor = (idx) => {
  const playerStartCells = [0, 13, 26, 39];
  if (playerStartCells.includes(idx)) {
    return '#fbbf24';
  }
  return '#3f3f46';
};

const getSafeCells = () => [1, 9, 14, 22, 27, 35, 40, 48];

const isSafeCell = (idx) => getSafeCells().includes(idx);

const getPieceRenderData = () => {
  if (!board.value) return [];

  const data = [];
  const colors = ['red', 'green', 'yellow', 'blue'];

  board.value.players.forEach((player, playerIdx) => {
    player.pieces.forEach((piece, pieceIdx) => {
      let x, y;

      if (piece.state === 'yard') {
        // Yard positions in corners
        const corners = [
          { x: 20 + (pieceIdx % 2) * 40, y: 20 + Math.floor(pieceIdx / 2) * 40 }, // Red
          { x: 340 + (pieceIdx % 2) * 40, y: 20 + Math.floor(pieceIdx / 2) * 40 }, // Green
          { x: 20 + (pieceIdx % 2) * 40, y: 340 + Math.floor(pieceIdx / 2) * 40 }, // Yellow
          { x: 340 + (pieceIdx % 2) * 40, y: 340 + Math.floor(pieceIdx / 2) * 40 }, // Blue
        ];
        const corner = corners[playerIdx];
        x = corner.x;
        y = corner.y;
      } else {
        const positions = getPathCellPositions();
        const pos = positions[piece.position % 52];
        x = pos.x;
        y = pos.y;

        // Offset multiple pieces on same cell
        x += (pieceIdx - 1.5) * 8;
        y += (pieceIdx - 1.5) * 8;
      }

      data.push({
        playerIdx,
        pieceIdx,
        x,
        y,
        color: colors[playerIdx],
        radius: 10,
        opacity: piece.state === 'home' ? 0.5 : 1,
        state:
          selectedPiece.value?.player === playerIdx &&
          selectedPiece.value?.piece === pieceIdx
            ? 'selected'
            : 'normal',
      });
    });
  });

  return data;
};

const getPieceColor = (color) => {
  const colors = {
    red: '#ef4444',
    green: '#22c55e',
    yellow: '#eab308',
    blue: '#3b82f6',
  };
  return colors[color] || colors.blue;
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
