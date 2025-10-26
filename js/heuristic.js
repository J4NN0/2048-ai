let MAX_DEPTH = 6;
let CHANCE_EMPTY_CELLS_THRESHOLD = 8;
let CHANCE_SAMPLES = 5;

const VALID_MOVES = ['up', 'down', 'left', 'right'];

let totMoves = 0;

function getNextMove(currentGameState) {
  totMoves = 0;
  const { 
    move: bestMove, 
    value: bestValue 
  } = expectimax(currentGameState, MAX_DEPTH, false);

  console.log(`Evaluated ${totMoves} moves. Chosen move: ${bestMove} with value ${bestValue.toFixed(2)}`);

  return bestMove;
}

function expectimax(currentGameState, depth, chanceLayer) {
  if (depth === 0 || currentGameState.isGameOver()) {
    return { move: null, value: calculateGoodness(currentGameState) };
  }
  totMoves++;

  if (!chanceLayer) {
    let bestValue = -Infinity;
    let bestMove = null;

    for (const move of VALID_MOVES) {
      const newGameState = cloneState(currentGameState);
      const moved = newGameState.makeMove(move);
      if (!moved) {
        continue;
      }

      const { value: childValue } = expectimax(newGameState, depth - 1, true);
      if (childValue > bestValue) {
        bestValue = childValue;
        bestMove = move;
      }
    }

    if (bestMove === null) {
      // No legal moves from this node: treat as terminal and return heuristic
      return { move: null, value: calculateGoodness(currentGameState) };
    }
    return { move: bestMove, value: bestValue };
  }

  if (chanceLayer) {
    const emptyCells = currentGameState.getEmptyCells();
    if (emptyCells.length === 0) {
      return { move: null, value: calculateGoodness(currentGameState) };
    }
    
    let cellsToConsider = emptyCells;
    let rescale = 1.0;
    if (emptyCells.length > CHANCE_EMPTY_CELLS_THRESHOLD) {
      cellsToConsider = sampleEmptyCells(emptyCells, Math.min(CHANCE_SAMPLES, emptyCells.length));
      rescale = emptyCells.length / cellsToConsider.length;
    }

    const pCell = 1 / emptyCells.length;
    let expectedValue = 0;
    for (const cell of cellsToConsider) {
      const gameStateWith2 = generateGameStateWithNewTile(currentGameState, cell, 2);
      expectedValue += 0.9 * pCell * expectimax(gameStateWith2, depth - 1, false).value;

      const gameStateWith4 = generateGameStateWithNewTile(currentGameState, cell, 4);
      expectedValue += 0.1 * pCell * expectimax(gameStateWith4, depth - 1, false).value;
    }

    return { move: null, value: expectedValue * rescale };
  }
}

function cloneState(state) {
  return new Game2048Logic(structuredClone(state.getGrid()), state.getScore());
}

function sampleEmptyCells(emptyCells, sampleSize) {
  const tmpEmptyCells = emptyCells.slice();
  const sampledEmptyCells = [];

  for (let i = 0; i < sampleSize; i++) {
    const rndIdx = Math.floor(Math.random() * tmpEmptyCells.length);
    sampledEmptyCells.push(tmpEmptyCells[rndIdx]);
    tmpEmptyCells.splice(rndIdx, 1);
  }
  
  return sampledEmptyCells;
}

function generateGameStateWithNewTile(gameState, cell, value) {
  const newGrid = structuredClone(gameState.getGrid());
  newGrid[cell.row][cell.col] = value;
  return new Game2048Logic(newGrid, gameState.getScore());
}

function calculateGoodness(gameState) {
  if (gameState.isGameOver()) {
    return -Infinity;
  }

  const grid = gameState.getGrid();

  let freeTiles = 0;
  let borderPenalty = 0;
  let smoothness = 0;
  let mergeOpportunities = 0;

  const rowIncPenalty = [0, 0, 0, 0];
  const rowDecPenalty = [0, 0, 0, 0];
  const colIncPenalty = [0, 0, 0, 0];
  const colDecPenalty = [0, 0, 0, 0];

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      const current = grid[i][j];

      if (current === 0) {
        freeTiles++;
      }

      if (current !== 0) {
        const distToRowBorder = Math.min(i, 3 - i);
        const distToColBorder = Math.min(j, 3 - j);
        const distToBorder = Math.min(distToRowBorder, distToColBorder);

        const tileRank = Math.log2(current);
        borderPenalty += distToBorder * tileRank * tileRank;
      }

      // In Rows
      if (j < grid.length - 1) {
        const right = grid[i][j + 1];

        if (current !== 0 && right !== 0) {
          smoothness += Math.abs(Math.log2(current) - Math.log2(right));
        }

        if (current !== 0 && current === right) {
          mergeOpportunities++;
        }

        if (current !== 0 && right !== 0) {
          if (current < right) {
            rowDecPenalty[i] += Math.log2(right);
          }
          if (current > right) {
            rowIncPenalty[i] += Math.log2(current);
          }
        }
      }

      // In Columns
      if (i < grid.length - 1) {
        const bottom = grid[i + 1][j];

        if (current !== 0 && bottom !== 0) {
          smoothness += Math.abs(Math.log2(current) - Math.log2(bottom));
        }

        if (current !== 0 && current === bottom) {
          mergeOpportunities++;
        }

        if (current !== 0 && bottom !== 0) {
          if (current < bottom) {
            colDecPenalty[j] += Math.log2(bottom);
          }
          if (current > bottom) {
            colIncPenalty[j] += Math.log2(current);
          }
        }
      }
    }
  }

  let monotonicityPenalty = 0;
  for (let i = 0; i < 4; i++) {
    const rowPenalty = Math.min(rowIncPenalty[i], rowDecPenalty[i]);
    const colPenalty = Math.min(colIncPenalty[i], colDecPenalty[i]);

    monotonicityPenalty += rowPenalty;
    monotonicityPenalty += colPenalty;

    // Extra penalty for chaotic rows/columns (having both directions with violations)
    if (rowIncPenalty[i] > 0 && rowDecPenalty[i] > 0) {
      monotonicityPenalty += rowIncPenalty[i] * rowDecPenalty[i] / 10;
    }

    if (colIncPenalty[i] > 0 && colDecPenalty[i] > 0) {
      monotonicityPenalty += colIncPenalty[i] * colDecPenalty[i] / 10;
    }
  }

  const WEIGHT_FREE = 15.0;
  const WEIGHT_MONOTONICITY = -5.0;
  const WEIGHT_SMOOTHNESS = -0.5;
  const WEIGHT_MERGE = 20.0;
  const WEIGHT_BORDER = -4.0;

  const score = (
    WEIGHT_FREE * freeTiles +
    WEIGHT_MONOTONICITY * monotonicityPenalty +
    WEIGHT_SMOOTHNESS * smoothness +
    WEIGHT_MERGE * mergeOpportunities +
    WEIGHT_BORDER * borderPenalty
  );

  return score;
}
