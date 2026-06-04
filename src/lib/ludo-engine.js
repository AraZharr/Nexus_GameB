/**
 * Ludo Game Engine
 * Manages game state, rules, and AI logic for a 2-4 player Ludo game
 */

class LudoEngine {
  constructor(playerCount = 4) {
    if (playerCount < 2 || playerCount > 4) {
      throw new Error('Ludo must have 2-4 players');
    }

    this.playerCount = playerCount;
    this.players = [];
    this.currentPlayer = 0;
    this.gameOver = false;
    this.ranking = [];
    this.consecutiveSixes = 0;
    this.gameHistory = [];

    // Initialize players
    for (let i = 0; i < playerCount; i++) {
      this.players.push({
        id: i,
        color: ['red', 'green', 'yellow', 'blue'][i],
        pieces: [
          { id: 0, state: 'yard', position: -1 },
          { id: 1, state: 'yard', position: -1 },
          { id: 2, state: 'yard', position: -1 },
          { id: 3, state: 'yard', position: -1 },
        ],
        finished: false,
      });
    }
  }

  /**
   * Get current board state
   */
  getBoard() {
    return {
      players: this.players.map((p) => ({
        id: p.id,
        color: p.color,
        pieces: p.pieces.map((piece) => ({
          id: piece.id,
          state: piece.state,
          position: piece.position,
        })),
        finished: p.finished,
      })),
      currentPlayer: this.currentPlayer,
      gameOver: this.gameOver,
      ranking: this.ranking,
    };
  }

  /**
   * Roll dice (1-6)
   */
  rollDice() {
    return Math.floor(Math.random() * 6) + 1;
  }

  /**
   * Get all legal moves for current player
   */
  getLegalMoves(playerIdx, diceValue) {
    const player = this.players[playerIdx];
    const moves = [];

    for (let pieceIdx = 0; pieceIdx < 4; pieceIdx++) {
      const piece = player.pieces[pieceIdx];
      const move = this._calculatePieceMove(playerIdx, pieceIdx, diceValue);

      if (move) {
        moves.push({
          pieceIdx,
          from: piece.position,
          to: move.to,
          type: move.type,
        });
      }
    }

    return moves;
  }

  /**
   * Calculate if a piece can move with given dice value
   */
  _calculatePieceMove(playerIdx, pieceIdx, diceValue) {
    const piece = this.players[playerIdx].pieces[pieceIdx];

    // If in yard
    if (piece.state === 'yard') {
      if (diceValue === 6) {
        return { to: this._getStartingCell(playerIdx), type: 'enter' };
      }
      return null;
    }

    // If on track or in home stretch
    let newPosition = piece.position + diceValue;

    // Check if entering home stretch
    if (piece.state === 'track') {
      const homeStretchStart = this._getHomeStretchStart(playerIdx);
      if (newPosition >= 52) {
        // Entering home stretch
        newPosition = newPosition - 52 + this._getHomeStretchStart(playerIdx);

        if (newPosition > this._getHomeStretchEnd(playerIdx)) {
          return null; // Overshoot
        }

        if (newPosition === this._getHomeStretchEnd(playerIdx)) {
          return { to: newPosition, type: 'home' };
        }

        return { to: newPosition, type: 'home_stretch' };
      }

      // Still on track
      newPosition = newPosition % 52;
      return { to: newPosition, type: 'move' };
    }

    // Already in home stretch
    if (piece.state === 'home_stretch') {
      newPosition = piece.position + diceValue;

      if (newPosition > this._getHomeStretchEnd(playerIdx)) {
        return null; // Overshoot in home stretch
      }

      if (newPosition === this._getHomeStretchEnd(playerIdx)) {
        return { to: newPosition, type: 'home' };
      }

      return { to: newPosition, type: 'move' };
    }

    return null;
  }

  /**
   * Make a move for a piece
   */
  makeMove(playerIdx, pieceIdx, diceValue) {
    const result = {
      killed: false,
      extraTurn: diceValue === 6,
      finishedPiece: false,
    };

    const piece = this.players[playerIdx].pieces[pieceIdx];
    const move = this._calculatePieceMove(playerIdx, pieceIdx, diceValue);

    if (!move) {
      return result;
    }

    const oldPosition = piece.position;
    piece.position = move.to;
    piece.state = move.type;

    // Check if piece is home
    if (move.type === 'home') {
      piece.state = 'home';
      const allHome = this.players[playerIdx].pieces.every(
        (p) => p.state === 'home'
      );
      if (allHome) {
        this.players[playerIdx].finished = true;
        this.ranking.push(playerIdx);
        result.finishedPiece = true;

        if (this.ranking.length === this.playerCount - 1) {
          this.gameOver = true;
        }
      }
    }

    // Check for kills (only on track, not in home stretch or safe cells)
    if (
      piece.state === 'track' &&
      !this._isSafeCell(piece.position, playerIdx)
    ) {
      const killed = this._killPiecesAt(piece.position, playerIdx);
      result.killed = killed.length > 0;
    }

    this.gameHistory.push({
      player: playerIdx,
      piece: pieceIdx,
      dice: diceValue,
      from: oldPosition,
      to: piece.position,
      result,
    });

    return result;
  }

  /**
   * Kill pieces at a position
   */
  _killPiecesAt(position, killerIdx) {
    const killed = [];

    for (let i = 0; i < this.playerCount; i++) {
      if (i === killerIdx) continue;

      for (const piece of this.players[i].pieces) {
        if (piece.position === position && piece.state === 'track') {
          piece.state = 'yard';
          piece.position = -1;
          killed.push({ player: i, piece: piece.id });
        }
      }
    }

    return killed;
  }

  /**
   * Check if a cell is safe (no killing)
   */
  _isSafeCell(position, playerIdx) {
    const startingCell = this._getStartingCell(playerIdx);
    const safeStars = [1, 9, 14, 22, 27, 35, 40, 48]; // Star safe cells

    return position === startingCell || safeStars.includes(position);
  }

  /**
   * Get starting cell for player
   */
  _getStartingCell(playerIdx) {
    return playerIdx * 13;
  }

  /**
   * Get home stretch start position
   */
  _getHomeStretchStart(playerIdx) {
    return 52 + playerIdx * 6;
  }

  /**
   * Get home stretch end position (in home)
   */
  _getHomeStretchEnd(playerIdx) {
    return 52 + playerIdx * 6 + 5;
  }

  /**
   * Check if game is over
   */
  isGameOver() {
    return this.gameOver;
  }

  /**
   * Get player rankings
   */
  getRanking() {
    const remaining = [];
    for (let i = 0; i < this.playerCount; i++) {
      if (!this.ranking.includes(i)) {
        remaining.push(i);
      }
    }
    return [...this.ranking, ...remaining];
  }

  /**
   * Get AI move based on difficulty level
   */
  getAIMove(playerIdx, diceValue, difficulty = 'medium') {
    const moves = this.getLegalMoves(playerIdx, diceValue);

    if (moves.length === 0) {
      return null;
    }

    if (moves.length === 1) {
      return moves[0];
    }

    if (difficulty === 'easy') {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (difficulty === 'medium') {
      return this._mediumAI(playerIdx, moves, diceValue);
    }

    if (difficulty === 'hard') {
      return this._hardAI(playerIdx, moves, diceValue);
    }

    return moves[0];
  }

  /**
   * Medium AI: prefer killing, prefer advancing
   */
  _mediumAI(playerIdx, moves, diceValue) {
    // Score each move
    const scored = moves.map((move) => {
      let score = 0;

      // Prefer killing moves
      const testPiece = this.players[playerIdx].pieces[move.pieceIdx];
      const oldPos = testPiece.position;
      testPiece.position = move.to;

      if (
        testPiece.state === 'track' &&
        !this._isSafeCell(move.to, playerIdx)
      ) {
        const killed = this._wouldKill(move.to, playerIdx);
        score += killed * 20;
      }

      // Prefer entering board
      if (move.type === 'enter') {
        score += 10;
      }

      // Prefer moving toward home
      if (move.type === 'move' || move.type === 'home_stretch') {
        score += move.to - oldPos;
      }

      // Prefer reaching home
      if (move.type === 'home') {
        score += 100;
      }

      testPiece.position = oldPos;
      return { move, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].move;
  }

  /**
   * Hard AI: evaluate all pieces strategically
   */
  _hardAI(playerIdx, moves, diceValue) {
    const scored = moves.map((move) => {
      let score = 0;
      const piece = this.players[playerIdx].pieces[move.pieceIdx];
      const oldPos = piece.position;

      // Home winning is highest priority
      if (move.type === 'home') {
        score += 1000;
        return { move, score };
      }

      // Entering board from yard
      if (move.type === 'enter') {
        score += 50;

        // Bonus if other pieces are advanced
        const advancedPieces = this.players[playerIdx].pieces.filter(
          (p) => p.state !== 'yard'
        ).length;
        score += advancedPieces * 10;
      }

      // Kill opponent pieces
      const killed = this._wouldKill(move.to, playerIdx);
      score += killed * 30;

      // Safety bonus for entering safe cell
      if (this._isSafeCell(move.to, playerIdx)) {
        score += 5;
      }

      // Progress toward home
      if (piece.state === 'track') {
        const distanceToHome = Math.abs(this._getStartingCell(playerIdx) - move.to);
        score += Math.max(0, 52 - distanceToHome) * 0.5;
      }

      // Bonus for moving toward home stretch
      if (piece.state === 'track' && move.to >= 50) {
        score += 15;
      }

      return { move, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].move;
  }

  /**
   * Check if a position would kill an opponent piece
   */
  _wouldKill(position, playerIdx) {
    let kills = 0;

    for (let i = 0; i < this.playerCount; i++) {
      if (i === playerIdx) continue;

      for (const piece of this.players[i].pieces) {
        if (piece.position === position && piece.state === 'track') {
          kills++;
        }
      }
    }

    return kills;
  }

  /**
   * Advance game turn
   */
  nextTurn(hasExtraTurn = false) {
    if (!hasExtraTurn) {
      this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
      while (this.players[this.currentPlayer].finished) {
        this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
      }
      this.consecutiveSixes = 0;
    } else {
      this.consecutiveSixes++;
    }

    // Three 6s in a row = forfeit turn and send random piece back
    if (this.consecutiveSixes === 3) {
      const pieces = this.players[this.currentPlayer].pieces.filter(
        (p) => p.state !== 'yard' && p.state !== 'home'
      );
      if (pieces.length > 0) {
        const piece = pieces[Math.floor(Math.random() * pieces.length)];
        piece.state = 'yard';
        piece.position = -1;
      }
      this.consecutiveSixes = 0;
      this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
      while (this.players[this.currentPlayer].finished) {
        this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
      }
    }
  }

  /**
   * Get game status
   */
  getStatus() {
    return {
      currentPlayer: this.currentPlayer,
      currentPlayerColor: this.players[this.currentPlayer].color,
      gameOver: this.gameOver,
      ranking: this.ranking.map((idx) => ({
        rank: this.ranking.indexOf(idx) + 1,
        player: idx,
        color: this.players[idx].color,
      })),
      consecutiveSixes: this.consecutiveSixes,
    };
  }
}

export default LudoEngine;
