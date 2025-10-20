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

        return moved;
    }

    moveUp() {
        this.moved = false;
        this.merged = false;
        let scoreIncrease = 0;

        for (let col = 0; col < this.GRID_SIZE; col++) {
            // Collect non-zero tiles top->bottom
            let vals = [];
            for (let row = 0; row < this.GRID_SIZE; row++) {
                if (this.grid[row][col] !== 0) vals.push(this.grid[row][col]);
            }

            // Merge: each tile may merge at most once
            let mergedCol = [];
            for (let i = 0; i < vals.length; i++) {
                if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
                    const mergedVal = vals[i] * 2;
                    mergedCol.push(mergedVal);
                    scoreIncrease += mergedVal;
                    i++; // skip the next since it was merged
                    this.merged = true;
                } else {
                    mergedCol.push(vals[i]);
                }
            }

            // Pad with zeros
            while (mergedCol.length < this.GRID_SIZE) mergedCol.push(0);

            // Write back and detect movement
            for (let row = 0; row < this.GRID_SIZE; row++) {
                if (this.grid[row][col] !== mergedCol[row]) this.moved = true;
                this.grid[row][col] = mergedCol[row];
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
            // Collect non-zero tiles bottom->top
            let vals = [];
            for (let row = this.GRID_SIZE - 1; row >= 0; row--) {
                if (this.grid[row][col] !== 0) vals.push(this.grid[row][col]);
            }

            // Merge (on the reversed list), each tile may merge at most once
            let mergedCol = [];
            for (let i = 0; i < vals.length; i++) {
                if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
                    const mergedVal = vals[i] * 2;
                    mergedCol.push(mergedVal);
                    scoreIncrease += mergedVal;
                    i++; // skip next
                    this.merged = true;
                } else {
                    mergedCol.push(vals[i]);
                }
            }

            // Pad and write back bottom-up
            while (mergedCol.length < this.GRID_SIZE) mergedCol.push(0);
            for (let i = 0; i < mergedCol.length; i++) {
                const row = this.GRID_SIZE - 1 - i;
                if (this.grid[row][col] !== mergedCol[i]) this.moved = true;
                this.grid[row][col] = mergedCol[i];
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
            // Collect non-zero tiles left->right
            let vals = [];
            for (let col = 0; col < this.GRID_SIZE; col++) {
                if (this.grid[row][col] !== 0) vals.push(this.grid[row][col]);
            }

            // Merge
            let mergedRow = [];
            for (let i = 0; i < vals.length; i++) {
                if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
                    const mergedVal = vals[i] * 2;
                    mergedRow.push(mergedVal);
                    scoreIncrease += mergedVal;
                    i++; // skip next
                    this.merged = true;
                } else {
                    mergedRow.push(vals[i]);
                }
            }

            while (mergedRow.length < this.GRID_SIZE) mergedRow.push(0);

            for (let col = 0; col < this.GRID_SIZE; col++) {
                if (this.grid[row][col] !== mergedRow[col]) this.moved = true;
                this.grid[row][col] = mergedRow[col];
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
            // Collect non-zero tiles right->left
            let vals = [];
            for (let col = this.GRID_SIZE - 1; col >= 0; col--) {
                if (this.grid[row][col] !== 0) vals.push(this.grid[row][col]);
            }

            // Merge on reversed list
            let mergedRow = [];
            for (let i = 0; i < vals.length; i++) {
                if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
                    const mergedVal = vals[i] * 2;
                    mergedRow.push(mergedVal);
                    scoreIncrease += mergedVal;
                    i++; // skip next
                    this.merged = true;
                } else {
                    mergedRow.push(vals[i]);
                }
            }

            while (mergedRow.length < this.GRID_SIZE) mergedRow.push(0);

            for (let i = 0; i < mergedRow.length; i++) {
                const col = this.GRID_SIZE - 1 - i;
                if (this.grid[row][col] !== mergedRow[i]) this.moved = true;
                this.grid[row][col] = mergedRow[i];
            }
        }

        this.score += scoreIncrease;
        return this.moved || this.merged;
    }

    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return null;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;

        this.grid[randomCell.row][randomCell.col] = value;
        return { row: randomCell.row, col: randomCell.col, value };
    }

    isGameOver() {
        if (!this.isGridFull()) {
            return false;
        }

        // Check if any adjacent tiles can be merged
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const currentValue = this.grid[row][col];

                // Check row
                if (col < this.GRID_SIZE - 1 && this.grid[row][col + 1] === currentValue) {
                    return false;
                }

                // Check column
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
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game2048Logic;
}