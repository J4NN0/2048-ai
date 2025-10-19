function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runGameLoop() {
  const gameUi = new Game2048UI();
  
  while (true) {
    if (gameUi.isGameOver() && !gameUi.restartRequested) {
      console.log('Game over. Waiting for restart...');
      await sleep(1000);
      continue;
    }

    const nextMove = getNextMove(gameUi.getGrid(), gameUi.getScore());
    gameUi.makeMove(nextMove);
    await sleep(10);
  }
}

async function init() {
  const maxDepthInput = document.getElementById('max-depth');
  const maxWidthInput = document.getElementById('max-width');

  if (maxDepthInput) {
    maxDepthInput.addEventListener('input', function() {
      MAX_DEPTH = parseInt(this.value);
      console.log('Search depth updated to:', MAX_DEPTH);
    });
  }

  if (maxWidthInput) {
    maxWidthInput.addEventListener('input', function() {
      MAX_WIDTH = parseInt(this.value);
      console.log('Search width updated to:', MAX_WIDTH);
    });
  }

  runGameLoop();
}

init();
