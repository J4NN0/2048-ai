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
      let value = parseInt(this.value);
      if (value < 1) {
        value = 1;
        this.value = value;
      } else if (value > 20) {
        value = 20;
        this.value = value;
      }
      MAX_DEPTH = value;
      console.log('Search depth updated to:', MAX_DEPTH);
    });
  }

  if (maxWidthInput) {
    maxWidthInput.addEventListener('input', function() {
      let value = parseInt(this.value);
      if (value < 1) {
        value = 1;
        this.value = value;
      } else if (value > 50) {
        value = 50;
        this.value = value;
      }
      MAX_WIDTH = value;
      console.log('Search width updated to:', MAX_WIDTH);
    });
  }

  runGameLoop();
}

init();
