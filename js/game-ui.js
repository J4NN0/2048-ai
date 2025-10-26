class Game2048UI {
    constructor() {
        this.gameContainer = document.querySelector('.game-container');
        this.scoreContainer = document.getElementById('score');
        this.gameMessageContainer = document.getElementById('game-message');
        this.retryButton = document.getElementById('retry-btn');
        this.keepPlayingButton = document.getElementById('keep-playing-btn');
        this.tileContainer = document.getElementById('tile-container');
        this.tiles = [];

        this.gameLogic = new Game2048Logic();
        this.keepPlaying = false;
        this.restartRequested = false;

        this.bindEvents();
        this.startNewGame();
    }

    getState() {
        return this.gameLogic;
    }

    isGameOver() {
        return this.gameLogic.isGameOver();
    }

    bindEvents() {  
        this.retryButton.addEventListener('click', () => this.restart());
        this.keepPlayingButton.addEventListener('click', () => this.continueGame());
    }

    makeMove(direction) {
        const moved = this.gameLogic.makeMove(direction);

        if (moved) {
            this.gameLogic.addRandomTile();
            this.updateUI();

            if (this.gameLogic.isGameOver()) {
                this.showGameOver();
            }
        }

        return moved;
    }

    updateUI() {
        this.clearTiles();
        const grid = this.gameLogic.getGrid();

        // Create tiles for non-zero values
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = grid[row][col];
                if (value !== 0) {
                    this.createTile(row + 1, col + 1, value);
                }
            }
        }

        this.scoreContainer.textContent = this.gameLogic.getScore();
    }

    startNewGame() {
        this.gameLogic.startNewGame();
        this.keepPlaying = false;
        this.hideGameOver();
        this.updateUI();
        this.restartRequested = true;
    }

    createTile(row, col, value, isNew = false) {
        const tile = document.createElement('div');

        const tileClass = value >= 4096 ? 'tile-super' : `tile-${value}`;
        tile.className = `tile ${tileClass} tile-position-${row}-${col}`;

        if (value >= 4096) {
            tile.setAttribute('data-length', value.toString().length);
        }

        if (isNew) {
            tile.classList.add('tile-new');
        }
        tile.textContent = value;

        this.tileContainer.appendChild(tile);

        // Store tile data
        const tileData = { element: tile, row, col, value };
        this.tiles.push(tileData);

        return tileData;
    }

    clearTiles() {
        this.tileContainer.innerHTML = '';
        this.tiles = [];
    }

    showGameOver() {
        this.restartRequested = false;
        this.gameMessageContainer.classList.add('game-over');
        this.gameMessageContainer.querySelector('p').textContent = 'Game Over!';
        this.gameMessageContainer.style.display = 'block';
    }

    hideGameOver() {
        this.gameMessageContainer.style.display = 'none';
        this.gameMessageContainer.classList.remove('game-over');
    }

    continueGame() {
        this.keepPlaying = true;
        this.hideGameOver();
    }

    restart() {
        this.startNewGame();
    }
}

// Export for potential use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game2048UI;
}
