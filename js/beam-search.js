const BEAM_WIDTH = 3; // Number of nodes evaluated at each level
const BRANCHING_FACTOR = 4; // Number of possible moves: up, down, left, right
const BEAM_DEPTH = 8; // Depth of the search tree
const validMoves = ['up', 'down', 'left', 'right'];

let moveDelay = 500;

function beamSearch(currentGrid, currentScore = 0) {
  let beam = [{
    grid: currentGrid,
    score: currentScore,
    firstMove: null
  }];

  for (let depth = 0; depth < BEAM_DEPTH; depth++) {
    const candidates = [];

    for (const node of beam) {
      for (let bf = 0; bf < BRANCHING_FACTOR; bf++) {
        const newMove = validMoves[bf];
        const newState = new Game2048Logic(node.grid, node.score);

        const moved = newState.makeMove(newMove);
        if (!moved) {
          continue;
        }

        candidates.push({
          grid: newState.getGrid(),
          score: newState.getScore(),
          firstMove: node.firstMove ?? newMove,
          heuristicGoodness: calculateGoodness(newState.getGrid())
        });
      }
    }

    if (candidates.length === 0) {
      continue;
    }

    candidates.sort((a, b) => b.heuristicGoodness - a.heuristicGoodness);
    beam = candidates.slice(0, BEAM_WIDTH);
  }

  const bestNode = beam[0];
  console.log(`Next move: ${bestNode.firstMove} (goodness: ${bestNode.heuristicGoodness.toFixed(2)})`);

  return bestNode.firstMove;
}

/**
 * Evaluates the heuristic goodness of the current grid state based on:
 * 1. Free tiles -> The more empty tiles there are, the better the state is.
 * 2. Positional strategy -> Reward keeping max tile in corner with snake pattern.
 * 3. Smoothness -> Measures log-based value difference between neighboring tiles.
 * 4. Merge potential -> Reward adjacent equal tiles.
 *
 * @param {number[][]} grid - The 2D grid representing the game state
 * @returns {number} Grid state goodness score
 */
function calculateGoodness(grid) {
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

          positionalScore += Math.log2(grid[i][j]) * snakeWeights[wi][wj];
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

function validateBeamSearchParameters() {
  if (BEAM_WIDTH <= 0 || BRANCHING_FACTOR <= 0 || BEAM_DEPTH <= 0) {
    throw new Error('Invalid beam search parameters');
  }
  if (BRANCHING_FACTOR > validMoves.length) {
    throw new Error('Branching factor exceeds number of valid moves');
  }
}

async function runGameLoop() {
  validateBeamSearchParameters();

  const gameUi = new Game2048UI();
  while (true) {
    if (gameUi.isGameOver() && !gameUi.restartRequested) {
      console.log('Game over. Restarting in 1 second...');
      await sleep(1000);
      continue;
    }

    const nextMove = beamSearch(gameUi.getGrid(), gameUi.getScore());
    gameUi.makeMove(nextMove);
    await sleep(moveDelay);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
  const moveSpeedSlider = document.getElementById('move-speed');
  const speedValue = document.getElementById('speed-value');

  moveSpeedSlider.addEventListener('input', (e) => {
    moveDelay = parseInt(e.target.value);
    speedValue.textContent = `${moveDelay}ms`;
  });

  runGameLoop();
}

init();
