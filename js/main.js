let moveDelay = 500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runGameLoop() {
  const gameUi = new Game2048UI();
  
  while (true) {
    if (gameUi.isGameOver() && !gameUi.restartRequested) {
      console.log('Game over. Restarting in 1 second...');
      await sleep(1000);
      continue;
    }

    const nextMove = getNextMove(gameUi.getGrid(), gameUi.getScore());
    gameUi.makeMove(nextMove);
    await sleep(moveDelay);
  }
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
