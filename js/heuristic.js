const MAX_DEPTH = 8; // Depth of the search tree
const MAX_WIDTH = 20; // Number of nodes evaluated at each level
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

        let emptyCells = newState.getEmptyCells();
        //TODO: optimize by not generating all possible new tiles
        for (const cell of emptyCells) {
          const [gameStateWith2, expectedHeuristicWith2] = generateGameStateWithNewTile(newState, cell, 2, emptyCells.length);
          candidates.push({
            grid: gameStateWith2.getGrid(),
            score: gameStateWith2.getScore(),
            firstMove: node.firstMove ?? move,
            heuristicGoodness: expectedHeuristicWith2
          });

          const [gameStateWith4, expectedHeuristicWith4] = generateGameStateWithNewTile(newState, cell, 4, emptyCells.length);
          candidates.push({
            grid: gameStateWith4.getGrid(),
            score: gameStateWith4.getScore(),
            firstMove: node.firstMove ?? move,
            heuristicGoodness: expectedHeuristicWith4
          });
        }
      }
    }

    if (candidates.length === 0) {
      continue;
    }
    totEvaluated += candidates.length;
    
    candidates.sort((a, b) => b.heuristicGoodness - a.heuristicGoodness);
    states = candidates.slice(0, MAX_WIDTH);
  }

  const bestNode = states[0];
  console.log(`Evaluated ${totEvaluated} candidates. Chosen move: ${bestNode.firstMove} with expected goodness ${bestNode.heuristicGoodness}`);

  return bestNode.firstMove;
}

function generateGameStateWithNewTile(gameState, cell, value, totEmptyCells) {
  const newGrid = structuredClone(gameState.getGrid());
  newGrid[cell.row][cell.col] = value;

  const newGameState = new Game2048Logic(newGrid, gameState.getScore());

  return [newGameState, calculateGoodness(newGameState)];
}

function calculateGoodness(gameState) {
  if (gameState.isGameOver()) {
    return -Infinity;
  }

  const grid = gameState.getGrid();

  let freeTiles = 0;
  let smoothness = 0;
  let monoRowInc = 0, monoRowDec = 0;
  let monoColInc = 0, monoColDec = 0;
  let mergeOpportunities = 0;
  let maxValue = -1;
  let maxPosition = { row: -1, col: -1 };

  const snakeWeights = [
    [15, 14, 13, 12],
    [8, 9, 10, 11],
    [7, 6, 5, 4],
    [0, 1, 2, 3]
  ];

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

      // In Rows
      if (j < grid.length - 1) {
        const right = grid[i][j + 1];

        if (current !== 0 && right !== 0) {
          smoothness += Math.abs(Math.log2(current) - Math.log2(right));
        }

        if (current !== 0 && current === right) {
          mergeOpportunities++;
        }

        if (current > right) {
          monoRowDec++;
        }
        else if (current < right) {
          monoRowInc++;
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

        if (current > bottom) {
          monoColDec++;
        }
        else if (current < bottom) {
          monoColInc++;
        }
      }
    }
  }

  const monotonicity = Math.max(monoRowDec, monoRowInc) + Math.max(monoColDec, monoColInc);

  const cornerPositions = [[0, 0], [0, 3], [3, 0], [3, 3]];
  const maxInCorner = cornerPositions.some(([row, col]) =>
    maxPosition.row === row && maxPosition.col === col
  );

  let positionalScore = 0;
  if (maxInCorner) {
    positionalScore += 1000;

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid.length; j++) {
        if (grid[i][j] !== 0) {
          let wi = i, wj = j;
          if (maxPosition.row === 0 && maxPosition.col === 3) {
            // top-right: flip horizontally
            wj = 3 - j;
          }
          else if (maxPosition.row === 3 && maxPosition.col === 0) {
            // bottom-left: flip vertically
            wi = 3 - i;
          }
          else if (maxPosition.row === 3 && maxPosition.col === 3) {
            // bottom-right: flip both
            wi = 3 - i;
            wj = 3 - j;
          }

          positionalScore += grid[i][j] * snakeWeights[wi][wj];
        }
      }
    }
  }

  const WEIGHT_FREE = 2.7;
  const WEIGHT_MONOTONICITY = 1.0;
  const WEIGHT_SMOOTHNESS = -0.1;
  const WEIGHT_MERGE = 2.0;
  const WEIGHT_POSITION = 1.0;

  const score = (
    WEIGHT_FREE * freeTiles +
    WEIGHT_MONOTONICITY * monotonicity +
    WEIGHT_SMOOTHNESS * smoothness +
    WEIGHT_MERGE * mergeOpportunities +
    WEIGHT_POSITION * positionalScore
  );

  return score;
}
