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
  let monotonicity = 0;
  let maxValue = -1;
  let maxInCorner = false;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      const current = grid[i][j];
      if (current === 0) {
        freeTiles++;
      }

      if (current > maxValue) {
        maxValue = current;
        maxInCorner = (i === 0 || i === grid.length - 1) && (j === 0 || j === grid.length - 1);
      }

      // In Rows
      if (j < grid.length - 1) {
        const next = grid[i][j + 1];
        smoothness += Math.abs(current - next);

        // Penalize mixed directions
        if (current < next) monotonicity += 1;
        if (current > next) monotonicity -= 1;
      }

      // In Columns
      if (i < grid.length - 1) {
        const next = grid[i + 1][j];
        smoothness += Math.abs(current - next);

        // Penalize mixed directions
        if (current < next) monotonicity += 1;
        if (current > next) monotonicity -= 1;
      }
    }
  }

  const cornerBonus = maxInCorner ? 20 : 0;

  const WEIGHT_FREE = 1.5;
  const WEIGHT_MONOTONICITY = 2.0;
  const WEIGHT_SMOOTHNESS = -3.0;
  const WEIGHT_CORNER = 1.0;

  const score = (
    WEIGHT_FREE * freeTiles +
    WEIGHT_MONOTONICITY * monotonicity +
    WEIGHT_SMOOTHNESS * smoothness +
    WEIGHT_CORNER * cornerBonus
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
