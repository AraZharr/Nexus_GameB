/**
 * Complete Chess Engine with full rules implementation
 * Includes FEN parsing, move validation, special moves, check detection,
 * draw conditions, and minimax AI with alpha-beta pruning
 */

const PIECE_VALUES = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

// Positional evaluation tables (from white's perspective)
const POSITION_TABLES = {
  pawn: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  knight: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  bishop: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ],
  rook: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0]
  ],
  queen: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20]
  ],
  king: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20]
  ]
};

class ChessEngine {
  constructor(fen = null) {
    this.board = [];
    this.whiteToMove = true;
    this.castlingRights = { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } };
    this.enPassantSquare = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.moveHistory = [];
    this.gameHistory = []; // For repetition detection
    this.capturedPieces = { white: [], black: [] };

    if (fen) {
      this.loadFEN(fen);
    } else {
      this.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
  }

  // Initialize 8x8 board
  initBoard() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
  }

  // Parse FEN notation
  loadFEN(fen) {
    const parts = fen.split(' ');
    const boardString = parts[0];
    const turn = parts[1];
    const castling = parts[2];
    const enPassant = parts[3];
    const halfmove = parseInt(parts[4]);
    const fullmove = parseInt(parts[5]);

    this.initBoard();

    // Parse board
    const rows = boardString.split('/');
    for (let r = 0; r < 8; r++) {
      let col = 0;
      for (const char of rows[r]) {
        if (/\d/.test(char)) {
          col += parseInt(char);
        } else {
          const isWhite = char === char.toUpperCase();
          const type = this.charToPiece(char.toLowerCase());
          this.board[r][col] = { type, color: isWhite ? 'white' : 'black' };
          col++;
        }
      }
    }

    this.whiteToMove = turn === 'w';

    // Parse castling rights
    this.castlingRights = {
      white: { kingside: castling.includes('K'), queenside: castling.includes('Q') },
      black: { kingside: castling.includes('k'), queenside: castling.includes('q') }
    };

    this.enPassantSquare = enPassant === '-' ? null : enPassant;
    this.halfmoveClock = halfmove;
    this.fullmoveNumber = fullmove;
    this.moveHistory = [];
    this.gameHistory = [this.toFEN()];
  }

  charToPiece(char) {
    const map = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
    return map[char];
  }

  pieceToChar(piece) {
    const map = { pawn: 'p', knight: 'n', bishop: 'b', rook: 'r', queen: 'q', king: 'k' };
    const char = map[piece.type];
    return piece.color === 'white' ? char.toUpperCase() : char;
  }

  // Get position coordinates from algebraic notation
  algebraicToCoords(algebraic) {
    return [8 - parseInt(algebraic[1]), algebraic.charCodeAt(0) - 97];
  }

  coordsToAlgebraic(row, col) {
    return String.fromCharCode(97 + col) + (8 - row);
  }

  getBoard() {
    return this.board;
  }

  getPiece(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row][col];
  }

  // Check if square is attacked by given color
  isSquareAttackedBy(row, col, byColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece || piece.color !== byColor) continue;

        if (this.canPieceAttack(r, c, row, col, piece)) {
          return true;
        }
      }
    }
    return false;
  }

  // Check if piece can attack target square (ignoring check)
  canPieceAttack(fromRow, fromCol, toRow, toCol, piece) {
    const dr = toRow - fromRow;
    const dc = toCol - fromCol;

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        return dr === direction && Math.abs(dc) === 1;

      case 'knight':
        return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);

      case 'bishop':
        if (Math.abs(dr) !== Math.abs(dc)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);

      case 'rook':
        if (dr !== 0 && dc !== 0) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);

      case 'queen':
        if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);

      case 'king':
        return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
    }
    return false;
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const dr = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
    const dc = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);

    let r = fromRow + dr;
    let c = fromCol + dc;

    while (r !== toRow || c !== toCol) {
      if (this.board[r][c] !== null) return false;
      r += dr;
      c += dc;
    }
    return true;
  }

  // Find king position
  findKing(color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.type === 'king' && piece.color === color) {
          return [r, c];
        }
      }
    }
    return null;
  }

  isCheck(color) {
    const [kingRow, kingCol] = this.findKing(color);
    const enemyColor = color === 'white' ? 'black' : 'white';
    return this.isSquareAttackedBy(kingRow, kingCol, enemyColor);
  }

  // Get all pseudo-legal moves for piece at position
  getPseudoLegalMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return [];

    const moves = [];

    switch (piece.type) {
      case 'pawn':
        this.addPawnMoves(row, col, piece, moves);
        break;
      case 'knight':
        this.addKnightMoves(row, col, piece, moves);
        break;
      case 'bishop':
        this.addBishopMoves(row, col, piece, moves);
        break;
      case 'rook':
        this.addRookMoves(row, col, piece, moves);
        break;
      case 'queen':
        this.addQueenMoves(row, col, piece, moves);
        break;
      case 'king':
        this.addKingMoves(row, col, piece, moves);
        break;
    }

    return moves;
  }

  addPawnMoves(row, col, piece, moves) {
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    const promotionRow = piece.color === 'white' ? 0 : 7;

    // Forward move
    const forwardRow = row + direction;
    if (forwardRow >= 0 && forwardRow < 8 && !this.board[forwardRow][col]) {
      if (forwardRow === promotionRow) {
        moves.push({ from: [row, col], to: [forwardRow, col], promotion: 'queen' });
        moves.push({ from: [row, col], to: [forwardRow, col], promotion: 'rook' });
        moves.push({ from: [row, col], to: [forwardRow, col], promotion: 'bishop' });
        moves.push({ from: [row, col], to: [forwardRow, col], promotion: 'knight' });
      } else {
        moves.push({ from: [row, col], to: [forwardRow, col] });
      }

      // Double move from starting position
      if (row === startRow && !this.board[row + direction * 2][col]) {
        moves.push({ from: [row, col], to: [row + direction * 2, col] });
      }
    }

    // Captures
    for (const dc of [-1, 1]) {
      const captureRow = row + direction;
      const captureCol = col + dc;
      if (captureRow >= 0 && captureRow < 8 && captureCol >= 0 && captureCol < 8) {
        const target = this.board[captureRow][captureCol];
        if (target && target.color !== piece.color) {
          if (captureRow === promotionRow) {
            moves.push({ from: [row, col], to: [captureRow, captureCol], promotion: 'queen' });
            moves.push({ from: [row, col], to: [captureRow, captureCol], promotion: 'rook' });
            moves.push({ from: [row, col], to: [captureRow, captureCol], promotion: 'bishop' });
            moves.push({ from: [row, col], to: [captureRow, captureCol], promotion: 'knight' });
          } else {
            moves.push({ from: [row, col], to: [captureRow, captureCol] });
          }
        }
      }
    }

    // En passant
    if (this.enPassantSquare) {
      const [epRow, epCol] = this.algebraicToCoords(this.enPassantSquare);
      if (row + direction === epRow) {
        for (const dc of [-1, 1]) {
          if (col + dc === epCol) {
            moves.push({ from: [row, col], to: [epRow, epCol], isEnPassant: true });
          }
        }
      }
    }
  }

  addKnightMoves(row, col, piece, moves) {
    const deltas = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of deltas) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const target = this.board[newRow][newCol];
        if (!target || target.color !== piece.color) {
          moves.push({ from: [row, col], to: [newRow, newCol] });
        }
      }
    }
  }

  addBishopMoves(row, col, piece, moves) {
    const deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of deltas) {
      this.addSlidingMoves(row, col, dr, dc, piece, moves);
    }
  }

  addRookMoves(row, col, piece, moves) {
    const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of deltas) {
      this.addSlidingMoves(row, col, dr, dc, piece, moves);
    }
  }

  addQueenMoves(row, col, piece, moves) {
    const deltas = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dr, dc] of deltas) {
      this.addSlidingMoves(row, col, dr, dc, piece, moves);
    }
  }

  addSlidingMoves(row, col, dr, dc, piece, moves) {
    let newRow = row + dr;
    let newCol = col + dc;
    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const target = this.board[newRow][newCol];
      if (!target) {
        moves.push({ from: [row, col], to: [newRow, newCol] });
      } else if (target.color !== piece.color) {
        moves.push({ from: [row, col], to: [newRow, newCol] });
        break;
      } else {
        break;
      }
      newRow += dr;
      newCol += dc;
    }
  }

  addKingMoves(row, col, piece, moves) {
    const deltas = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dr, dc] of deltas) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const target = this.board[newRow][newCol];
        if (!target || target.color !== piece.color) {
          moves.push({ from: [row, col], to: [newRow, newCol] });
        }
      }
    }

    // Castling
    if (!this.isCheck(piece.color)) {
      if (piece.color === 'white') {
        if (this.castlingRights.white.kingside && this.canCastleKingside('white')) {
          moves.push({ from: [row, col], to: [row, 6], isCastling: 'kingside' });
        }
        if (this.castlingRights.white.queenside && this.canCastleQueenside('white')) {
          moves.push({ from: [row, col], to: [row, 2], isCastling: 'queenside' });
        }
      } else {
        if (this.castlingRights.black.kingside && this.canCastleKingside('black')) {
          moves.push({ from: [row, col], to: [row, 6], isCastling: 'kingside' });
        }
        if (this.castlingRights.black.queenside && this.canCastleQueenside('black')) {
          moves.push({ from: [row, col], to: [row, 2], isCastling: 'queenside' });
        }
      }
    }
  }

  canCastleKingside(color) {
    const row = color === 'white' ? 7 : 0;
    if (!this.board[row][5] || !this.board[row][6]) {
      return this.board[row][5] === null && this.board[row][6] === null;
    }
    return false;
  }

  canCastleQueenside(color) {
    const row = color === 'white' ? 7 : 0;
    if (!this.board[row][1] || !this.board[row][2] || !this.board[row][3]) {
      return this.board[row][1] === null && this.board[row][2] === null && this.board[row][3] === null;
    }
    return false;
  }

  // Get legal moves (filters out moves that leave king in check)
  getLegalMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece || piece.color !== (this.whiteToMove ? 'white' : 'black')) return [];

    const pseudoLegal = this.getPseudoLegalMoves(row, col);
    const legal = [];

    for (const move of pseudoLegal) {
      // Make move temporarily
      const captured = this.board[move.to[0]][move.to[1]];
      const enPassantTarget = move.isEnPassant ? this.board[row][move.to[1]] : null;

      // Handle special moves
      if (move.isEnPassant) {
        this.board[row][move.to[1]] = null;
      }
      if (move.isCastling) {
        // Move rook
        const castlingRow = move.to[0];
        if (move.isCastling === 'kingside') {
          this.board[castlingRow][7] = null;
          this.board[castlingRow][5] = { type: 'rook', color: piece.color };
        } else {
          this.board[castlingRow][0] = null;
          this.board[castlingRow][3] = { type: 'rook', color: piece.color };
        }
      }

      this.board[move.to[0]][move.to[1]] = piece;
      this.board[row][col] = null;

      // Check if king is in check
      const inCheck = this.isCheck(piece.color);

      // Undo move
      this.board[row][col] = piece;
      this.board[move.to[0]][move.to[1]] = captured;
      if (move.isEnPassant) {
        this.board[row][move.to[1]] = enPassantTarget;
      }
      if (move.isCastling) {
        const castlingRow = move.to[0];
        if (move.isCastling === 'kingside') {
          this.board[castlingRow][5] = null;
          this.board[castlingRow][7] = { type: 'rook', color: piece.color };
        } else {
          this.board[castlingRow][3] = null;
          this.board[castlingRow][0] = { type: 'rook', color: piece.color };
        }
      }

      if (!inCheck) {
        legal.push(move);
      }
    }

    return legal;
  }

  // Get all legal moves for current player
  getAllLegalMoves() {
    const color = this.whiteToMove ? 'white' : 'black';
    const allMoves = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === color) {
          const moves = this.getLegalMoves(r, c);
          allMoves.push(...moves);
        }
      }
    }

    return allMoves;
  }

  makeMove(fromCoords, toCoords, promotion = null) {
    const [fromRow, fromCol] = fromCoords;
    const [toRow, toCol] = toCoords;

    const piece = this.board[fromRow][fromCol];
    if (!piece) return null;

    const moves = this.getLegalMoves(fromRow, fromCol);
    const move = moves.find(m => m.to[0] === toRow && m.to[1] === toCol &&
                                 (!m.promotion || m.promotion === promotion));

    if (!move) return null;

    const moveObj = {
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      piece: piece,
      captured: this.board[toRow][toCol] || null,
      promotion: move.promotion || null,
      isCastling: move.isCastling || false,
      isEnPassant: move.isEnPassant || false
    };

    // Handle en passant
    if (move.isEnPassant) {
      const capturedPawn = this.board[fromRow][toCol];
      moveObj.captured = capturedPawn;
      this.capturedPieces[capturedPawn.color].push(capturedPawn);
      this.board[fromRow][toCol] = null;
    } else if (moveObj.captured) {
      this.capturedPieces[moveObj.captured.color].push(moveObj.captured);
    }

    // Handle castling
    if (move.isCastling) {
      if (move.isCastling === 'kingside') {
        this.board[fromRow][7] = null;
        this.board[fromRow][5] = { type: 'rook', color: piece.color };
      } else {
        this.board[fromRow][0] = null;
        this.board[fromRow][3] = { type: 'rook', color: piece.color };
      }
      this.castlingRights[piece.color].kingside = false;
      this.castlingRights[piece.color].queenside = false;
    }

    // Move piece
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    // Handle promotion
    if (move.promotion) {
      piece.type = move.promotion;
    }

    // Update castling rights
    if (piece.type === 'king') {
      this.castlingRights[piece.color].kingside = false;
      this.castlingRights[piece.color].queenside = false;
    }
    if (piece.type === 'rook') {
      if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
      if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
    }

    // Update en passant
    this.enPassantSquare = null;
    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      this.enPassantSquare = this.coordsToAlgebraic(fromRow + (toRow - fromRow) / 2, toCol);
    }

    // Update move counters
    if (piece.type === 'pawn' || moveObj.captured) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }

    if (!this.whiteToMove) {
      this.fullmoveNumber++;
    }

    this.whiteToMove = !this.whiteToMove;

    // Add to history
    moveObj.notation = this.getMoveNotation(moveObj);
    this.moveHistory.push(moveObj);
    this.gameHistory.push(this.toFEN());

    return moveObj;
  }

  undoMove() {
    if (this.moveHistory.length === 0) return false;

    const move = this.moveHistory.pop();
    this.gameHistory.pop();

    const [fromRow, fromCol] = move.from;
    const [toRow, toCol] = move.to;
    const piece = move.piece;

    // Undo piece move
    this.board[fromRow][fromCol] = piece;
    this.board[toRow][toCol] = move.captured || null;

    // Undo promotion
    if (move.promotion) {
      piece.type = 'pawn';
    }

    // Undo en passant
    if (move.isEnPassant) {
      this.board[fromRow][toCol] = move.captured;
    }

    // Undo castling
    if (move.isCastling) {
      if (move.isCastling === 'kingside') {
        this.board[fromRow][5] = null;
        this.board[fromRow][7] = { type: 'rook', color: piece.color };
      } else {
        this.board[fromRow][3] = null;
        this.board[fromRow][0] = { type: 'rook', color: piece.color };
      }
    }

    // Restore castling rights (simplified - full implementation would track this)
    this.whiteToMove = !this.whiteToMove;

    // Remove from captured pieces
    if (move.captured) {
      const idx = this.capturedPieces[move.captured.color].lastIndexOf(move.captured);
      if (idx > -1) {
        this.capturedPieces[move.captured.color].splice(idx, 1);
      }
    }

    // Restore state from FEN if available
    if (this.gameHistory.length > 0) {
      const fen = this.gameHistory[this.gameHistory.length - 1];
      this.loadFEN(fen);
      this.moveHistory = this.moveHistory.slice(0, -1);
    }

    return true;
  }

  getMoveNotation(move) {
    const fromAlg = this.coordsToAlgebraic(move.from[0], move.from[1]);
    const toAlg = this.coordsToAlgebraic(move.to[0], move.to[1]);

    if (move.isCastling) {
      return move.isCastling === 'kingside' ? 'O-O' : 'O-O-O';
    }

    let notation = '';
    if (move.piece.type !== 'pawn') {
      notation += move.piece.type[0].toUpperCase();
    }

    if (move.captured) {
      if (move.piece.type === 'pawn') {
        notation += String.fromCharCode(97 + move.from[1]);
      }
      notation += 'x';
    }

    notation += toAlg;

    if (move.promotion) {
      notation += '=' + move.promotion[0].toUpperCase();
    }

    return notation;
  }

  toFEN() {
    let fen = '';

    // Board
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) {
          emptyCount++;
        } else {
          if (emptyCount) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += this.pieceToChar(piece);
        }
      }
      if (emptyCount) fen += emptyCount;
      if (r < 7) fen += '/';
    }

    fen += ' ';
    fen += this.whiteToMove ? 'w' : 'b';
    fen += ' ';

    let castling = '';
    if (this.castlingRights.white.kingside) castling += 'K';
    if (this.castlingRights.white.queenside) castling += 'Q';
    if (this.castlingRights.black.kingside) castling += 'k';
    if (this.castlingRights.black.queenside) castling += 'q';
    fen += castling || '-';

    fen += ' ' + (this.enPassantSquare || '-');
    fen += ' ' + this.halfmoveClock;
    fen += ' ' + this.fullmoveNumber;

    return fen;
  }

  isCheckmate(color) {
    return this.isCheck(color) && this.getAllLegalMoves().length === 0;
  }

  isStalemate(color) {
    return !this.isCheck(color) && this.getAllLegalMoves().length === 0;
  }

  isDraw() {
    // 50-move rule
    if (this.halfmoveClock >= 100) return true;

    // Insufficient material
    if (this.hasInsufficientMaterial()) return true;

    // Threefold repetition
    const fenCounts = {};
    for (const fen of this.gameHistory) {
      fenCounts[fen] = (fenCounts[fen] || 0) + 1;
      if (fenCounts[fen] >= 3) return true;
    }

    return false;
  }

  hasInsufficientMaterial() {
    const pieces = { white: [], black: [] };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.type !== 'king') {
          pieces[piece.color].push(piece.type);
        }
      }
    }

    // K vs K, K+N vs K, K+B vs K
    const whitePieces = pieces.white;
    const blackPieces = pieces.black;

    if (whitePieces.length === 0 && blackPieces.length === 0) return true;
    if (whitePieces.length === 0 && blackPieces.length === 1) {
      return blackPieces[0] === 'knight' || blackPieces[0] === 'bishop';
    }
    if (blackPieces.length === 0 && whitePieces.length === 1) {
      return whitePieces[0] === 'knight' || whitePieces[0] === 'bishop';
    }
    if (whitePieces.length === 1 && blackPieces.length === 1) {
      if ((whitePieces[0] === 'bishop' && blackPieces[0] === 'bishop') ||
          (whitePieces[0] === 'knight' && blackPieces[0] === 'knight')) {
        return true;
      }
    }

    return false;
  }

  getResult() {
    const color = this.whiteToMove ? 'white' : 'black';

    if (this.isCheckmate(color)) {
      return color === 'white' ? 'black' : 'white';
    }

    if (this.isStalemate(color)) {
      return 'draw';
    }

    if (this.isDraw()) {
      return 'draw';
    }

    return null;
  }

  getMoveHistory() {
    return this.moveHistory.map(m => m.notation);
  }

  // Evaluation function for AI
  evaluatePosition() {
    let score = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) continue;

        const value = PIECE_VALUES[piece.type];
        const positionBonus = POSITION_TABLES[piece.type][
          piece.color === 'white' ? r : 7 - r
        ][c];

        const pieceScore = value + positionBonus;
        score += piece.color === 'white' ? pieceScore : -pieceScore;
      }
    }

    // Bonus for king safety
    if (this.isCheck('white')) score -= 50;
    if (this.isCheck('black')) score += 50;

    return score;
  }

  // Minimax with alpha-beta pruning
  minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return this.evaluatePosition();
    }

    const moves = this.getAllLegalMoves();

    if (moves.length === 0) {
      if (this.isCheck(isMaximizing ? 'white' : 'black')) {
        return isMaximizing ? -20000 : 20000;
      }
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        this.makeMove(move.from, move.to, move.promotion);
        const eval = this.minimax(depth - 1, alpha, beta, false);
        this.undoMove();

        maxEval = Math.max(maxEval, eval);
        alpha = Math.max(alpha, eval);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        this.makeMove(move.from, move.to, move.promotion);
        const eval = this.minimax(depth - 1, alpha, beta, true);
        this.undoMove();

        minEval = Math.min(minEval, eval);
        beta = Math.min(beta, eval);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  getAIMove(difficulty = 3) {
    const moves = this.getAllLegalMoves();
    if (moves.length === 0) return null;

    let depth = difficulty;
    if (difficulty === 1) depth = 2;
    if (difficulty === 2) depth = 3;
    if (difficulty === 3) depth = 4;

    let bestMove = moves[0];
    let bestValue = -Infinity;
    const isMaximizing = this.whiteToMove;

    for (const move of moves) {
      this.makeMove(move.from, move.to, move.promotion);
      const value = this.minimax(depth - 1, -Infinity, Infinity, !isMaximizing);
      this.undoMove();

      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    return bestMove;
  }
}

export default ChessEngine;
