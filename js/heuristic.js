const MAX_DEPTH = 10; // Depth of the search tree
const MAX_WIDTH = 15; // Number of nodes evaluated at each level
const VALID_MOVES = ['up', 'down', 'left', 'right'];

function getNextMove(currentGrid, currentScore = 0) {
  let states = [{
    grid: currentGrid,
    score: currentScore,
    firstMove: null
  }];
  let totEvaluated = 0;

  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const candidates = [];

    for (const node of states) {
      for (const move of VALID_MOVES) {
        const newState = new Game2048Logic(node.grid, node.score);

        const moved = newState.makeMove(move);
        if (!moved) {
          continue;
        }

        let expectedHeuristic = 0;
        let emptyCells = newState.getEmptyCells();
        if (emptyCells.length === 0) {
          expectedHeuristic = calculateGoodness(newState);
        } else {
          for (const cell of emptyCells) {
            const gameStateWith2 = generateGameStateWithNewTile(newState, cell, 2);
            expectedHeuristic += (0.9 / emptyCells.length) * calculateGoodness(gameStateWith2);

            const gameStateWith4 = generateGameStateWithNewTile(newState, cell, 4);
            expectedHeuristic += (0.1 / emptyCells.length) * calculateGoodness(gameStateWith4);
          }
        }

        newState.addRandomTile();
        candidates.push({
          grid: newState.getGrid(),
          score: newState.getScore(),
          firstMove: node.firstMove ?? move,
          heuristicGoodness: expectedHeuristic
        });
      }
    }

    if (candidates.length === 0) {
      continue;
    }
    candidates.sort((a, b) => b.heuristicGoodness - a.heuristicGoodness);
    
    states = candidates.slice(0, MAX_WIDTH);
    totEvaluated += states.length;
  }

  const bestNode = states[0];
  console.log(`Evaluated ${totEvaluated} candidates. Chosen move: ${bestNode.firstMove} with expected goodness ${bestNode.heuristicGoodness}`);

  return bestNode.firstMove;
}

function generateGameStateWithNewTile(gameState, cell, value) {
  const newGrid = structuredClone(gameState.getGrid());
  newGrid[cell.row][cell.col] = value;

  const newGameState = new Game2048Logic(newGrid, gameState.getScore());

  return newGameState;
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
  let maxValue = -1;
  let maxPosition = { row: -1, col: -1 };

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

      if (current > maxValue) {
        maxValue = current;
        maxPosition = { row: i, col: j };
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
    monotonicityPenalty += Math.min(rowIncPenalty[i], rowDecPenalty[i]);
    monotonicityPenalty += Math.min(colIncPenalty[i], colDecPenalty[i]);
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
