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

    getGrid() {
        return this.gameLogic.getGrid();
    }

    getScore() {
        return this.gameLogic.getScore();
    }

    isGameOver() {
        return this.gameLogic.isGameOver();
    }

    bindEvents() {
        this.retryButton.addEventListener('click', () => this.restart());
        this.keepPlayingButton.addEventListener('click', () => this.continueGame());
        
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (this.gameLogic.isGameOver() && !this.keepPlaying) return;
            
            switch(event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.makeMove('up');
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.makeMove('down');
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.makeMove('left');
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.makeMove('right');
                    break;
            }
        });

        // Touch controls for mobile
        let startX, startY;
        
        this.gameContainer.addEventListener('touchstart', (event) => {
            if (this.gameLogic.isGameOver() && !this.keepPlaying) return;
            
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            event.preventDefault();
        });
        
        this.gameContainer.addEventListener('touchend', (event) => {
            if (this.gameLogic.isGameOver() && !this.keepPlaying) return;
            
            const touch = event.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            
            const dx = endX - startX;
            const dy = endY - startY;
            
            const minSwipeDistance = 30;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > minSwipeDistance) {
                    if (dx > 0) {
                        this.makeMove('right');
                    } else {
                        this.makeMove('left');
                    }
                }
            } else {
                if (Math.abs(dy) > minSwipeDistance) {
                    if (dy > 0) {
                        this.makeMove('down');
                    } else {
                        this.makeMove('up');
                    }
                }
            }
            
            event.preventDefault();
        });
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
        tile.className = `tile tile-${value} tile-position-${row}-${col}`;
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
