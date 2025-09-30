// 2048 Game UI Controller
class Game2048UI {
    constructor() {
        this.gameContainer = document.querySelector('.game-container');
        this.scoreContainer = document.getElementById('score');
        this.gameMessageContainer = document.getElementById('game-message');
        this.restartButton = document.getElementById('restart-btn'); // Will be null, that's ok
        this.retryButton = document.getElementById('retry-btn');
        this.keepPlayingButton = document.getElementById('keep-playing-btn');
        
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlaying = false;
        
        this.tileContainer = document.getElementById('tile-container');
        this.tiles = [];
        
        this.bindEvents();
        this.updateDisplay();
        this.showStartingTiles();
    }

    bindEvents() {
        // Restart game (only if button exists)
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => this.restart());
        }
        this.retryButton.addEventListener('click', () => this.restart());
        
        // Keep playing after winning
        this.keepPlayingButton.addEventListener('click', () => this.keepPlaying());
        
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (this.over && !this.keepPlaying) return;
            
            switch(event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.simulateMove('up');
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.simulateMove('down');
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.simulateMove('left');
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.simulateMove('right');
                    break;
            }
        });

        // Touch controls for mobile
        let startX, startY;
        
        this.gameContainer.addEventListener('touchstart', (event) => {
            if (this.over && !this.keepPlaying) return;
            
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            event.preventDefault();
        });
        
        this.gameContainer.addEventListener('touchend', (event) => {
            if (this.over && !this.keepPlaying) return;
            
            const touch = event.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            
            const dx = endX - startX;
            const dy = endY - startY;
            
            const minSwipeDistance = 30;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > minSwipeDistance) {
                    if (dx > 0) {
                        this.simulateMove('right');
                    } else {
                        this.simulateMove('left');
                    }
                }
            } else {
                if (Math.abs(dy) > minSwipeDistance) {
                    if (dy > 0) {
                        this.simulateMove('down');
                    } else {
                        this.simulateMove('up');
                    }
                }
            }
            
            event.preventDefault();
        });
    }

    // Simulate tile movement (this would connect to actual game logic)
    simulateMove(direction) {
        console.log(`Moving ${direction}`);
        
        // This is just UI simulation - in a real game, this would connect to game logic
        // For demo purposes, we'll just add a random tile
        this.addRandomTile();
        
        // Simulate score increase
        this.updateScore(Math.floor(Math.random() * 10) * 4);
        
        // Randomly show win/lose messages for demo
        if (Math.random() < 0.01) {
            this.showGameWon();
        } else if (Math.random() < 0.01) {
            this.showGameOver();
        }
    }

    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        
        this.createTile(randomCell.row, randomCell.col, value, true);
    }

    getEmptyCells() {
        const emptyCells = [];
        for (let row = 1; row <= 4; row++) {
            for (let col = 1; col <= 4; col++) {
                if (!this.isCellOccupied(row, col)) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }

    isCellOccupied(row, col) {
        return this.tiles.some(tile => 
            tile.row === row && tile.col === col && !tile.merged
        );
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
        const tileData = { element: tile, row, col, value, merged: false };
        this.tiles.push(tileData);
        
        return tileData;
    }

    showStartingTiles() {
        // Clear existing tiles
        this.clearTiles();
        
        // Add two starting tiles
        this.addRandomTile();
        this.addRandomTile();
    }

    clearTiles() {
        this.tileContainer.innerHTML = '';
        this.tiles = [];
    }

    updateScore(points) {
        this.score += points;
        this.scoreContainer.textContent = this.score;
    }

    updateDisplay() {
        this.scoreContainer.textContent = this.score;
    }

    showGameWon() {
        this.won = true;
        this.gameMessageContainer.classList.add('game-won');
        this.gameMessageContainer.querySelector('p').textContent = 'You Win!';
        this.gameMessageContainer.style.display = 'block';
    }

    showGameOver() {
        this.over = true;
        this.gameMessageContainer.classList.add('game-over');
        this.gameMessageContainer.querySelector('p').textContent = 'Game Over!';
        this.gameMessageContainer.style.display = 'block';
    }

    hideGameMessage() {
        this.gameMessageContainer.style.display = 'none';
        this.gameMessageContainer.classList.remove('game-won', 'game-over');
    }

    keepPlaying() {
        this.keepPlaying = true;
        this.hideGameMessage();
    }

    restart() {
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlaying = false;
        
        this.hideGameMessage();
        this.updateDisplay();
        this.showStartingTiles();
    }

}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048UI();
});

// Additional utility functions for tile animations
function animateTile(tile, fromPos, toPos, callback) {
    tile.style.transform = `translate(${toPos.x}px, ${toPos.y}px)`;
    
    setTimeout(() => {
        if (callback) callback();
    }, 150);
}

function addScoreAnimation(points, element) {
    const scoreAdd = document.createElement('div');
    scoreAdd.className = 'score-addition';
    scoreAdd.textContent = `+${points}`;
    
    element.appendChild(scoreAdd);
    
    setTimeout(() => {
        element.removeChild(scoreAdd);
    }, 600);
}

// Export for potential use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game2048UI;
}