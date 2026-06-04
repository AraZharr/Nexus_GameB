/**
 * Snakes and Ladders Game Engine
 * Manages game state and rules for a 2-4 player Snakes & Ladders game
 */

class SnakesEngine {
  constructor(playerCount = 2, customBoard = null) {
    if (playerCount < 2 || playerCount > 4) {
      throw new Error('Snakes & Ladders must have 2-4 players');
    }

    this.playerCount = playerCount;
    this.players = [];
    this.currentPlayer = 0;
    this.gameOver = false;
    this.ranking = [];
    this.consecutiveSixes = 0;
    this.gameHistory = [];

    // Initialize snakes and ladders
    this.snakes = customBoard?.snakes || {
      17: 7,
      54: 34,
      62: 19,
      64: 60,
      87: 24,
      93: 73,
      95: 75,
      99: 78,
    };

    this.ladders = customBoard?.ladders || {
      4: 14,
      9: 31,
      20: 38,
      28: 84,
      40: 59,
      51: 67,
      63: 81,
      71: 91,
    };

    // Initialize players
    for (let i = 0; i < playerCount; i++) {
      this.players.push({
        id: i,
        color: ['red', 'green', 'yellow', 'blue'][i],
        position: 0,
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
        position: p.position,
        finished: p.finished,
      })),
      snakes: this.snakes,
      ladders: this.ladders,
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
   * Move player with given dice value
   */
  movePlayer(playerIdx, diceValue) {
    const player = this.players[playerIdx];
    const oldPosition = player.position;

    let newPosition = player.position + diceValue;

    // Check for overshoot (must land exactly on 100)
    if (newPosition > 100) {
      newPosition = 200 - newPosition; // Bounce back
    }

    let climbedLadder = false;
    let slidSnake = false;

    // Check for ladder
    if (this.ladders[newPosition]) {
      newPosition = this.ladders[newPosition];
      climbedLadder = true;
    }
    // Check for snake
    else if (this.snakes[newPosition]) {
      newPosition = this.snakes[newPosition];
      slidSnake = true;
    }

    player.position = newPosition;

    const result = {
      climbedLadder,
      slidSnake,
      extraTurn: diceValue === 6,
      position: newPosition,
      from: oldPosition,
      won: false,
    };

    // Check if player won
    if (newPosition === 100) {
      player.finished = true;
      this.ranking.push(playerIdx);
      result.won = true;

      if (this.ranking.length === this.playerCount - 1) {
        this.gameOver = true;
      }
    }

    this.gameHistory.push({
      player: playerIdx,
      dice: diceValue,
      from: oldPosition,
      to: newPosition,
      result,
    });

    return result;
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
   * Get AI move (snakes & ladders has no choice, just move)
   */
  getAIMove(playerIdx, diceValue) {
    // In snakes & ladders, there's only one possible move
    return {
      player: playerIdx,
      dice: diceValue,
    };
  }

  /**
   * Get snake positions
   */
  getSnakePositions() {
    return {
      snakes: this.snakes,
      ladders: this.ladders,
    };
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

    // Three 6s in a row = forfeit turn
    if (this.consecutiveSixes === 3) {
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

  /**
   * Calculate distance to finish
   */
  getDistanceToFinish(playerIdx) {
    return 100 - this.players[playerIdx].position;
  }

  /**
   * Get board cell info
   */
  getCellInfo(cellNumber) {
    const info = {
      number: cellNumber,
      type: 'normal',
      connectedTo: null,
    };

    if (this.ladders[cellNumber]) {
      info.type = 'ladder_bottom';
      info.connectedTo = this.ladders[cellNumber];
    } else if (this.snakes[cellNumber]) {
      info.type = 'snake_head';
      info.connectedTo = this.snakes[cellNumber];
    } else if (Object.values(this.ladders).includes(cellNumber)) {
      info.type = 'ladder_top';
    } else if (Object.values(this.snakes).includes(cellNumber)) {
      info.type = 'snake_tail';
    }

    return info;
  }
}

export default SnakesEngine;
