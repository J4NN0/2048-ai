const validMoves = ['up', 'down', 'left', 'right'];

function beamSearch(grid) {
  const nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];
  console.log('Next Move:', nextMove);

  return nextMove;
}

function init() {
  const gameUi = new Game2048UI();

  while (!gameUi.isGameOver()) {
    const nextMove = beamSearch(gameUi.getGrid());
    gameUi.makeMove(nextMove);
  }

  console.log('Game Over! Final score:', gameUi.getScore());
}

init();