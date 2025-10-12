const BEAM_WIDTH = 3; // Number of nodes evaluated at each level
const BRANCHING_FACTOR = 4; // Number of possible moves: up, down, left, right
const BEAM_DEPTH = 5; // Depth of the search tree
const validMoves = ['up', 'down', 'left', 'right'];

let moveDelay = 500;

function beamSearch(grid) {
  let beam = [{
    grid: grid,
    firstMove: null
  }];

  for (let depth = 0; depth < BEAM_DEPTH; depth++) {
    const candidates = [];

    for (const node of beam) {
      for (let bf = 0; bf < BRANCHING_FACTOR; bf++) {
        const newMove = validMoves[bf];
        const gameLogic = new Game2048Logic(node.grid, node.grid.score);
        const moved = gameLogic.makeMove(newMove);
        if (!moved) {
          continue;
        }

        candidates.push({
          grid: gameLogic.getGrid(),
          firstMove: node.firstMove ?? newMove
        });
      }
    }

    if (candidates.length === 0) {
      continue;
    }

    candidates.sort((a, b) => calculateGoodness(b.grid) - calculateGoodness(a.grid));
    beam = candidates.slice(0, BEAM_WIDTH);
  }

  const bestNode = beam[0];
  console.log('Next Move:', bestNode.firstMove);

  return bestNode.firstMove;
}

/**
 * Evaluates the heuristic goodness of the current grid state based on:
 * 1. Free tiles -> The more empty tiles there are, the better the state is.
 * 2. Monotonicity -> Ensure the tiles have a monotonic trend in both the horizontal and vertical directions.
 *    If 0: Perfectly monotonic
 *    If matrix size: Not monotonic
 *    Else: Partially monotonic
 * 3. Smoothness -> Measures the value difference between neighboring tiles, trying to minimize this count.
 * 
 * @param {number[][]} grid - The 2D grid representing the game state
 * @returns {number} Grid state goodness score
 */
function calculateGoodness(grid) {
  let freeTiles = 0;
  let smoothness = 0;
  let monotonicity = grid.length * grid.length;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j] === 0) {
        freeTiles += 1;
        continue;
      }

      // In Rows
      if (j < grid.length - 1 && grid[i][j + 1] !== 0) {
        smoothness += Math.abs(grid[i][j] - grid[i][j + 1]);
        if (grid[i][j] >= grid[i][j + 1]) {
          monotonicity--;
        }
      }

      // In Columns
      if (i < grid.length - 1 && grid[i + 1][j] !== 0) {
        smoothness += Math.abs(grid[i][j] - grid[i + 1][j]);
        if (grid[i][j] >= grid[i + 1][j]) {
          monotonicity--;
        }
      }
    }
  }

  return freeTiles + monotonicity - smoothness;
}

function validateBeamSearchParameters() {
  if (BEAM_WIDTH <= 0 || BRANCHING_FACTOR <= 0 || BEAM_DEPTH <= 0) {
    throw new Error('Invalid beam search parameters');
  }
  if (BRANCHING_FACTOR > validMoves.length) {
    throw new Error('Branching factor exceeds number of valid moves');
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
  validateBeamSearchParameters();

  const gameUi = new Game2048UI();
  
  const moveSpeedSlider = document.getElementById('move-speed');
  const speedValue = document.getElementById('speed-value');
  moveSpeedSlider.addEventListener('input', (e) => {
    moveDelay = parseInt(e.target.value);
    speedValue.textContent = `${moveDelay}ms`;
  });

  while (!gameUi.isGameOver()) {
    const nextMove = beamSearch(gameUi.getGrid());
    if (nextMove) {
      gameUi.makeMove(nextMove);
    }
    
    await sleep(moveDelay);
  }

  console.log('Game Over! Final score:', gameUi.getScore());
}

init();
