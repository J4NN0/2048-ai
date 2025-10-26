function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let isGameRunning = true;

async function runGameLoop() {  
  const gameUi = new Game2048UI();

  while (true) {
    if (!isGameRunning) {
      await sleep(100);
      continue;
    }
    
    if (gameUi.isGameOver() && !gameUi.restartRequested) {
      console.log('Game over. Waiting for restart...');
      await sleep(1000);
      continue;
    }

    const nextMove = getNextMove(gameUi.getState());
    gameUi.makeMove(nextMove);
    await sleep(10);
  }
}

function addListeners() {
  const maxDepthInput = document.getElementById('max-depth');
  const chanceEmptyCellsThresholdInput = document.getElementById('chance-empty-cells-threshold');
  const chanceSamplesInput = document.getElementById('chance-samples');
  const aiToggleButton = document.getElementById('ai-toggle');

  if (aiToggleButton) {
    aiToggleButton.addEventListener('click', function() {
      isGameRunning = !isGameRunning;
      updateToggleButton();
      console.log(isGameRunning ? 'AI resumed' : 'AI paused');
    });
  }

  if (maxDepthInput) {
    maxDepthInput.addEventListener('input', function() {
      let value = parseInt(this.value);
      if (isNaN(value) || value < 1) {
        value = 1;
        this.value = value;
      } else if (value > 8) {
        value = 8;
        this.value = value;
      }
      MAX_DEPTH = value;
      console.log('Max depth updated to:', MAX_DEPTH);
    });
  }

  if (chanceEmptyCellsThresholdInput) {
    chanceEmptyCellsThresholdInput.addEventListener('input', function() {
      let value = parseInt(this.value);
      if (isNaN(value) || value < 1) {
        value = 1;
        this.value = value;
      } else if (value > 12) {
        value = 12;
        this.value = value;
      }
      CHANCE_EMPTY_CELLS_THRESHOLD = value;
      console.log('Empty cells threshold updated to:', CHANCE_EMPTY_CELLS_THRESHOLD);
    });
  }

  if (chanceSamplesInput) {
    chanceSamplesInput.addEventListener('input', function() {
      let value = parseInt(this.value);
      if (isNaN(value) || value < 1) {
        value = 1;
        this.value = value;
      } else if (value > 10) {
        value = 10;
        this.value = value;
      }
      CHANCE_SAMPLES = value;
      console.log('Chance samples updated to:', CHANCE_SAMPLES);
    });
  }
}

function updateToggleButton() {
  const aiToggleContainer = document.getElementById('ai-toggle');
  const aiStatusElement = aiToggleContainer?.querySelector('.ai-status');
  
  if (aiToggleContainer && aiStatusElement) {
    if (isGameRunning) {
      aiStatusElement.textContent = 'Stop';
      aiToggleContainer.classList.add('running');
    } else {
      aiStatusElement.textContent = 'Start';
      aiToggleContainer.classList.remove('running');
    }
  }
}

function init() {
  updateToggleButton();
  addListeners();
  
  runGameLoop();
}

init();
