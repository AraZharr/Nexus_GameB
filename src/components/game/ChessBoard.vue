<template>
  <div class="chess-container">
    <!-- Top player info -->
    <div class="player-info top-player" :class="{ 'is-checking': playerColor === 'white' && isWhiteInCheck }">
      <div class="player-name">{{ playerColor === 'black' ? 'You (Black)' : 'Opponent (Black)' }}</div>
      <div class="player-timer">{{ formatTime(blackTime) }}</div>
      <div class="captured-pieces">
        <span v-for="piece in capturedPieces.white" :key="piece" class="piece">{{ getPieceUnicode(piece, 'white') }}</span>
      </div>
    </div>

    <!-- Board -->
    <div class="board" :class="{ 'flipped': boardFlipped && playerColor === 'black' }">
      <div
        v-for="(row, rowIdx) in board"
        :key="`row-${rowIdx}`"
        class="board-row"
      >
        <div
          v-for="(piece, colIdx) in row"
          :key="`${rowIdx}-${colIdx}`"
          class="square"
          :class="getSquareClass(rowIdx, colIdx, piece)"
          @click="selectSquare(rowIdx, colIdx)"
        >
          <!-- Rank labels (left side) -->
          <div v-if="colIdx === 0" class="rank-label">{{ 8 - rowIdx }}</div>

          <!-- File labels (bottom) -->
          <div v-if="rowIdx === 7" class="file-label">{{ String.fromCharCode(97 + colIdx) }}</div>

          <!-- Piece -->
          <div v-if="piece" class="piece-display" :class="{ 'dragging': selectedSquare && selectedSquare[0] === rowIdx && selectedSquare[1] === colIdx }">
            {{ getPieceUnicode(piece.type, piece.color) }}
          </div>

          <!-- Legal move indicators -->
          <div v-if="showLegalMoves && legalMovesSet.has(`${rowIdx}-${colIdx}`)">
            <div v-if="!piece" class="move-dot"></div>
            <div v-else class="capture-indicator"></div>
          </div>

          <!-- Check indicator -->
          <div v-if="isKingSquare(rowIdx, colIdx) && (isWhiteInCheck || isBlackInCheck)" class="check-indicator"></div>
        </div>
      </div>
    </div>

    <!-- Bottom player info -->
    <div class="player-info bottom-player" :class="{ 'is-checking': playerColor === 'black' && isBlackInCheck }">
      <div class="player-name">{{ playerColor === 'black' ? 'You (Black)' : 'You (White)' }}</div>
      <div class="player-timer">{{ formatTime(whiteTime) }}</div>
      <div class="captured-pieces">
        <span v-for="piece in capturedPieces.black" :key="piece" class="piece">{{ getPieceUnicode(piece, 'black') }}</span>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button @click="flipBoard" class="btn btn-flip">Flip Board</button>
      <button @click="resetGame" class="btn btn-reset">New Game</button>
      <button @click="undoMove" class="btn btn-undo" :disabled="moveHistory.length === 0">Undo</button>
    </div>

    <!-- Move History -->
    <div class="move-history">
      <div class="move-history-title">Move History</div>
      <div class="moves-list">
        <div v-for="(move, idx) in moveHistory" :key="idx" class="move">
          <span class="move-number" v-if="idx % 2 === 0">{{ Math.floor(idx / 2) + 1 }}.</span>
          <span class="move-notation">{{ move }}</span>
        </div>
      </div>
    </div>

    <!-- Pawn Promotion Dialog -->
    <div v-if="showPromotionDialog" class="modal-overlay">
      <div class="promotion-dialog">
        <div class="dialog-title">Choose Promotion</div>
        <div class="promotion-options">
          <button
            v-for="piece in ['queen', 'rook', 'bishop', 'knight']"
            :key="piece"
            @click="confirmPromotion(piece)"
            class="promotion-btn"
          >
            {{ getPieceUnicode(piece, promotionColor) }}
            <div class="piece-label">{{ piece.charAt(0).toUpperCase() + piece.slice(1) }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Game Over Overlay -->
    <div v-if="gameOverMessage" class="modal-overlay">
      <div class="game-over-dialog">
        <div class="dialog-title">{{ gameOverMessage }}</div>
        <div class="dialog-content">{{ gameOverDetail }}</div>
        <div class="dialog-actions">
          <button @click="resetGame" class="btn btn-primary">Play Again</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChessEngine from '../../lib/chess-engine.js';

const PIECE_UNICODE = {
  pawn: { white: '♙', black: '♟' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  rook: { white: '♖', black: '♜' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' }
};

export default {
  name: 'ChessBoard',
  props: {
    fen: {
      type: String,
      default: null
    },
    playerColor: {
      type: String,
      default: 'white',
      validator: val => ['white', 'black'].includes(val)
    },
    aiDifficulty: {
      type: Number,
      default: 2,
      validator: val => [1, 2, 3].includes(val)
    },
    timer: {
      type: Number,
      default: null
    },
    playAgainstAI: {
      type: Boolean,
      default: false
    }
  },
  emits: ['move', 'game-over'],
  data() {
    return {
      engine: null,
      board: [],
      selectedSquare: null,
      legalMoves: [],
      legalMovesSet: new Set(),
      moveHistory: [],
      boardFlipped: false,
      showPromotionDialog: false,
      promotionSquare: null,
      promotionColor: null,
      gameOverMessage: null,
      gameOverDetail: null,
      whiteTime: 0,
      blackTime: 0,
      gameTimer: null,
      isWhiteInCheck: false,
      isBlackInCheck: false,
      capturedPieces: { white: [], black: [] },
      aiThinking: false
    };
  },
  computed: {
    showLegalMoves() {
      return this.selectedSquare !== null && this.legalMoves.length > 0;
    }
  },
  watch: {
    'engine.whiteToMove': function() {
      this.updateCheckStatus();
      if (this.playAgainstAI && this.engine.whiteToMove !== (this.playerColor === 'white')) {
        this.makeAIMove();
      }
    }
  },
  methods: {
    initGame() {
      this.engine = new ChessEngine(this.fen);
      this.updateBoard();
      this.moveHistory = [];
      this.selectedSquare = null;
      this.legalMoves = [];
      this.legalMovesSet.clear();
      this.gameOverMessage = null;
      this.gameOverDetail = null;
      this.whiteTime = this.timer || 300;
      this.blackTime = this.timer || 300;
      this.startTimer();

      if (this.playAgainstAI && this.playerColor === 'black') {
        this.makeAIMove();
      }
    },

    updateBoard() {
      this.board = JSON.parse(JSON.stringify(this.engine.getBoard()));
      this.moveHistory = this.engine.getMoveHistory();

      const whiteCaptures = [];
      const blackCaptures = [];

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = this.engine.getPiece(r, c);
          this.board[r][c] = piece ? { ...piece } : null;
        }
      }

      this.capturedPieces.white = this.engine.capturedPieces.white.map(p => p.type);
      this.capturedPieces.black = this.engine.capturedPieces.black.map(p => p.type);
    },

    updateCheckStatus() {
      this.isWhiteInCheck = this.engine.isCheck('white');
      this.isBlackInCheck = this.engine.isCheck('black');
    },

    selectSquare(row, col) {
      if (this.gameOverMessage || this.showPromotionDialog || this.aiThinking) return;

      // Check if current player is trying to move
      if (this.playAgainstAI && this.engine.whiteToMove !== (this.playerColor === 'white')) {
        return;
      }

      const piece = this.board[row][col];

      // If square is a legal move destination
      if (this.legalMovesSet.has(`${row}-${col}`)) {
        this.makeMove([this.selectedSquare[0], this.selectedSquare[1]], [row, col]);
        this.selectedSquare = null;
        this.legalMoves = [];
        this.legalMovesSet.clear();
        return;
      }

      // Select a piece
      if (piece && piece.color === (this.engine.whiteToMove ? 'white' : 'black')) {
        this.selectedSquare = [row, col];
        this.legalMoves = this.engine.getLegalMoves(row, col);
        this.legalMovesSet.clear();
        for (const move of this.legalMoves) {
          this.legalMovesSet.add(`${move.to[0]}-${move.to[1]}`);
        }
      } else {
        this.selectedSquare = null;
        this.legalMoves = [];
        this.legalMovesSet.clear();
      }
    },

    makeMove(from, to, promotion = null) {
      const movePiece = this.engine.getPiece(from[0], from[1]);

      if (movePiece && movePiece.type === 'pawn') {
        const toRow = to[0];
        if ((movePiece.color === 'white' && toRow === 0) || (movePiece.color === 'black' && toRow === 7)) {
          this.promotionSquare = to;
          this.promotionColor = movePiece.color;
          this.showPromotionDialog = true;
          return;
        }
      }

      const move = this.engine.makeMove(from, to, promotion);
      if (move) {
        this.updateBoard();
        this.updateCheckStatus();
        this.$emit('move', { from, to, move });

        // Check game status
        const result = this.engine.getResult();
        if (result) {
          this.endGame(result);
        }
      }
    },

    confirmPromotion(piece) {
      this.showPromotionDialog = false;
      this.makeMove(this.selectedSquare, this.promotionSquare, piece);
      this.selectedSquare = null;
      this.legalMoves = [];
      this.legalMovesSet.clear();
      this.promotionSquare = null;
      this.promotionColor = null;
    },

    async makeAIMove() {
      this.aiThinking = true;
      await new Promise(resolve => setTimeout(resolve, 300));

      const move = this.engine.getAIMove(this.aiDifficulty);
      if (move) {
        this.makeMove(move.from, move.to, move.promotion);
      }

      this.aiThinking = false;

      const result = this.engine.getResult();
      if (result) {
        this.endGame(result);
      }
    },

    endGame(result) {
      this.stopTimer();

      if (result === 'draw') {
        this.gameOverMessage = 'Game Over';
        this.gameOverDetail = 'The game ended in a draw.';
      } else if (result === this.playerColor) {
        this.gameOverMessage = 'You Won!';
        this.gameOverDetail = 'Congratulations!';
      } else {
        this.gameOverMessage = 'Game Over';
        this.gameOverDetail = `${result.charAt(0).toUpperCase() + result.slice(1)} wins!`;
      }

      this.$emit('game-over', { result });
    },

    flipBoard() {
      this.boardFlipped = !this.boardFlipped;
    },

    resetGame() {
      this.initGame();
    },

    undoMove() {
      if (this.engine.undoMove()) {
        this.updateBoard();
        this.updateCheckStatus();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.legalMovesSet.clear();
      }
    },

    startTimer() {
      if (!this.timer) return;

      this.stopTimer();
      this.gameTimer = setInterval(() => {
        if (this.engine.whiteToMove) {
          this.whiteTime--;
          if (this.whiteTime <= 0) {
            this.stopTimer();
            this.endGame('black');
          }
        } else {
          this.blackTime--;
          if (this.blackTime <= 0) {
            this.stopTimer();
            this.endGame('white');
          }
        }
      }, 1000);
    },

    stopTimer() {
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
        this.gameTimer = null;
      }
    },

    formatTime(seconds) {
      if (!seconds) return '∞';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    getPieceUnicode(type, color) {
      return PIECE_UNICODE[type][color];
    },

    getSquareClass(row, col, piece) {
      const classes = [];

      // Light/dark squares
      const isLight = (row + col) % 2 === 0;
      classes.push(isLight ? 'light' : 'dark');

      // Selected square
      if (this.selectedSquare && this.selectedSquare[0] === row && this.selectedSquare[1] === col) {
        classes.push('selected');
      }

      return classes.join(' ');
    },

    isKingSquare(row, col) {
      const piece = this.board[row][col];
      return piece && piece.type === 'king';
    }
  },
  mounted() {
    this.initGame();
  },
  beforeUnmount() {
    this.stopTimer();
  }
};
</script>

<style scoped>
.chess-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #0f172a;
  border-radius: 0.5rem;
  max-width: 520px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
}

.player-info {
  width: 100%;
  padding: 0.75rem;
  background-color: #1e293b;
  border-radius: 0.375rem;
  border: 2px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #f1f5f9;
  transition: all 0.3s ease;
}

.player-info.is-checking {
  border-color: #ef4444;
  background-color: #7f1d1d;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.player-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.player-timer {
  font-family: 'Courier New', monospace;
  font-size: 1.125rem;
  font-weight: 700;
  min-width: 60px;
  text-align: center;
}

.captured-pieces {
  display: flex;
  gap: 0.25rem;
  min-width: 100px;
  justify-content: flex-end;
}

.captured-pieces .piece {
  font-size: 1rem;
  display: inline-block;
}

.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  aspect-ratio: 1;
  width: 100%;
  max-width: 480px;
  border: 3px solid #1e293b;
  border-radius: 0.375rem;
  overflow: hidden;
  background-color: #0f172a;
}

.board.flipped {
  transform: rotate(180deg);
}

.board-row {
  display: contents;
}

.square {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
}

.square.light {
  background-color: #e7d9c3;
}

.square.dark {
  background-color: #8b7355;
}

.square:hover {
  opacity: 0.8;
}

.square.selected {
  background-color: #bfdbfe !important;
  box-shadow: inset 0 0 10px rgba(59, 130, 246, 0.6);
}

.square.selected.dark {
  background-color: #3b82f6 !important;
}

.rank-label,
.file-label {
  position: absolute;
  font-size: 0.625rem;
  font-weight: 700;
  color: #1e293b;
}

.rank-label {
  top: 2px;
  left: 2px;
}

.file-label {
  bottom: 2px;
  right: 2px;
}

.piece-display {
  font-size: 2.5rem;
  line-height: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.15s ease;
}

.piece-display.dragging {
  opacity: 0.7;
  transform: scale(0.95);
}

.move-dot {
  width: 0.375rem;
  height: 0.375rem;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(16, 185, 129, 0.6);
}

.capture-indicator {
  position: absolute;
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid #ef4444;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

.check-indicator {
  position: absolute;
  inset: 0;
  border: 3px solid #ef4444;
  animation: checkFlash 0.6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes checkFlash {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(239, 68, 68, 0.2);
  }
}

.controls {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
}

.btn {
  padding: 0.5rem 1rem;
  background-color: #1e293b;
  color: #f1f5f9;
  border: 1px solid #334155;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  background-color: #334155;
  border-color: #475569;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-flip,
.btn-reset,
.btn-undo {
  flex: 1;
}

.move-history {
  width: 100%;
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.375rem;
  padding: 0.75rem;
  max-height: 150px;
  overflow-y: auto;
}

.move-history-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.moves-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.move {
  display: flex;
  gap: 0.25rem;
  color: #cbd5e1;
}

.move-number {
  color: #64748b;
  font-weight: 600;
}

.move-notation {
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.promotion-dialog,
.game-over-dialog {
  background-color: #1e293b;
  border: 2px solid #334155;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  color: #f1f5f9;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.promotion-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.promotion-btn {
  padding: 1rem;
  background-color: #0f172a;
  border: 2px solid #334155;
  border-radius: 0.375rem;
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.promotion-btn:hover {
  border-color: #3b82f6;
  background-color: #1e293b;
}

.promotion-btn:active {
  background-color: #3b82f6;
}

.promotion-btn > :first-child {
  font-size: 2rem;
}

.piece-label {
  font-size: 0.75rem;
  font-weight: 600;
}

.dialog-content {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: #cbd5e1;
}

.dialog-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  flex: 1;
  background-color: #3b82f6;
  border-color: #3b82f6;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 1rem;
}

.btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}
</style>
