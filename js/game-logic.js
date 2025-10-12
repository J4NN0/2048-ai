class Game2048Logic {
    constructor(grid = null, score = 0) {
        this.GRID_SIZE = 4;
        this.grid = grid ? grid.map(row => [...row]) : this.initializeGrid();
        this.score = score;
        this.moved = false;
        this.merged = false;
    }

    initializeGrid() {
        return Array(this.GRID_SIZE).fill().map(() => Array(this.GRID_SIZE).fill(0));
    }

    getGrid() {
        return this.grid.map(row => [...row]);
    }

    getScore() {
        return this.score;
    }

    isGridFull() {
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }

    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return null;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        
        this.grid[randomCell.row][randomCell.col] = value;
        return { row: randomCell.row, col: randomCell.col, value };
    }

    moveUp() {
        this.moved = false;
        this.merged = false;
        let scoreIncrease = 0;

        for (let col = 0; col < this.GRID_SIZE; col++) {
            // Compress: move all non-zero tiles up
            let compressedCol = [];
            for (let row = 0; row < this.GRID_SIZE; row++) {
                if (this.grid[row][col] !== 0) {
                    compressedCol.push(this.grid[row][col]);
                }
            }

            // Merge adjacent identical tiles
            for (let i = 0; i < compressedCol.length - 1; i++) {
                if (compressedCol[i] === compressedCol[i + 1]) {
                    compressedCol[i] *= 2;
                    scoreIncrease += compressedCol[i];
                    compressedCol.splice(i + 1, 1); // Remove the merged tile
                    this.merged = true;
                }
            }

            // Fill the column back with compressed values
            let newCol = [...compressedCol];
            while (newCol.length < this.GRID_SIZE) {
                newCol.push(0);
            }

            // Check if anything changed
            for (let row = 0; row < this.GRID_SIZE; row++) {
                if (this.grid[row][col] !== newCol[row]) {
                    this.moved = true;
                }
                this.grid[row][col] = newCol[row];
            }
        }

        this.score += scoreIncrease;
        return this.moved || this.merged;
    }

    moveDown() {
        this.moved = false;
        this.merged = false;
        let scoreIncrease = 0;

        for (let col = 0; col < this.GRID_SIZE; col++) {
            // Compress: collect all non-zero tiles
            let compressedCol = [];
            for (let row = this.GRID_SIZE - 1; row >= 0; row--) {
                if (this.grid[row][col] !== 0) {
                    compressedCol.push(this.grid[row][col]);
                }
            }

            // Merge adjacent identical tiles
            for (let i = 0; i < compressedCol.length - 1; i++) {
                if (compressedCol[i] === compressedCol[i + 1]) {
                    compressedCol[i] *= 2;
                    scoreIncrease += compressedCol[i];
                    compressedCol.splice(i + 1, 1); // Remove the merged tile
                    this.merged = true;
                }
            }

            // Fill the column back (from bottom up)
            let newCol = Array(this.GRID_SIZE).fill(0);
            for (let i = 0; i < compressedCol.length; i++) {
                newCol[this.GRID_SIZE - 1 - i] = compressedCol[i];
            }

            // Check if anything changed
            for (let row = 0; row < this.GRID_SIZE; row++) {
                if (this.grid[row][col] !== newCol[row]) {
                    this.moved = true;
                }
                this.grid[row][col] = newCol[row];
            }
        }

        this.score += scoreIncrease;
        return this.moved || this.merged;
    }

    moveLeft() {
        this.moved = false;
        this.merged = false;
        let scoreIncrease = 0;

        for (let row = 0; row < this.GRID_SIZE; row++) {
            // Compress: collect all non-zero tiles
            let compressedRow = [];
            for (let col = 0; col < this.GRID_SIZE; col++) {
                if (this.grid[row][col] !== 0) {
                    compressedRow.push(this.grid[row][col]);
                }
            }

            // Merge adjacent identical tiles
            for (let i = 0; i < compressedRow.length - 1; i++) {
                if (compressedRow[i] === compressedRow[i + 1]) {
                    compressedRow[i] *= 2;
                    scoreIncrease += compressedRow[i];
                    compressedRow.splice(i + 1, 1); // Remove the merged tile
                    this.merged = true;
                }
            }

            // Fill the row back with compressed values
            let newRow = [...compressedRow];
            while (newRow.length < this.GRID_SIZE) {
                newRow.push(0);
            }

            // Check if anything changed
            for (let col = 0; col < this.GRID_SIZE; col++) {
                if (this.grid[row][col] !== newRow[col]) {
                    this.moved = true;
                }
                this.grid[row][col] = newRow[col];
            }
        }

        this.score += scoreIncrease;
        return this.moved || this.merged;
    }

    moveRight() {
        this.moved = false;
        this.merged = false;
        let scoreIncrease = 0;

        for (let row = 0; row < this.GRID_SIZE; row++) {
            // Compress: collect all non-zero tiles (from right to left)
            let compressedRow = [];
            for (let col = this.GRID_SIZE - 1; col >= 0; col--) {
                if (this.grid[row][col] !== 0) {
                    compressedRow.push(this.grid[row][col]);
                }
            }

            // Merge adjacent identical tiles
            for (let i = 0; i < compressedRow.length - 1; i++) {
                if (compressedRow[i] === compressedRow[i + 1]) {
                    compressedRow[i] *= 2;
                    scoreIncrease += compressedRow[i];
                    compressedRow.splice(i + 1, 1); // Remove the merged tile
                    this.merged = true;
                }
            }

            // Fill the row back (from right to left)
            let newRow = Array(this.GRID_SIZE).fill(0);
            for (let i = 0; i < compressedRow.length; i++) {
                newRow[this.GRID_SIZE - 1 - i] = compressedRow[i];
            }

            // Check if anything changed
            for (let col = 0; col < this.GRID_SIZE; col++) {
                if (this.grid[row][col] !== newRow[col]) {
                    this.moved = true;
                }
                this.grid[row][col] = newRow[col];
            }
        }

        this.score += scoreIncrease;
        return this.moved || this.merged;
    }

    isGameOver() {
        if (!this.isGridFull()) {
            return false;
        }

        // Check if any adjacent tiles can be merged
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const currentValue = this.grid[row][col];
                
                // Check right neighbor
                if (col < this.GRID_SIZE - 1 && this.grid[row][col + 1] === currentValue) {
                    return false;
                }
                
                // Check bottom neighbor
                if (row < this.GRID_SIZE - 1 && this.grid[row + 1][col] === currentValue) {
                    return false;
                }
            }
        }

        return true;
    }

    reset() {
        this.grid = this.initializeGrid();
        this.score = 0;
        this.moved = false;
        this.merged = false;
    }

    startNewGame() {
        this.reset();
        this.addRandomTile();
        this.addRandomTile();
    }

    makeMove(direction) {
        let moved = false;

        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.addRandomTile();
        }

        return moved;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game2048Logic;
}