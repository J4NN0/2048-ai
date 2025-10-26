class Game2048Test {
    constructor() {
        this.gameUi = null;
    }

    initGame() {
        if (!this.gameUi) {
            this.gameUi = new Game2048UI();
        }
        return this.gameUi;
    }

    setTile(row, col, value) {
        const gameUi = this.initGame();
        const gameState = gameUi.gameState;
        
        gameUi.clearTiles();
        gameState.grid[row - 1][col - 1] = value;
        gameUi.updateUI();
        
        console.log(`Set tile at position (${row}, ${col}) to value ${value}`);
    }

    initBoard(gridArray) {
        const gameUi = this.initGame();
        const gameState = gameUi.gameState;
        
        if (!Array.isArray(gridArray) || gridArray.length !== 4) {
            console.error('Grid must be a 4x4 array');
            return;
        }
        
        for (let i = 0; i < 4; i++) {
            if (!Array.isArray(gridArray[i]) || gridArray[i].length !== 4) {
                console.error('Each row must be an array of 4 elements');
                return;
            }
        }
        
        gameUi.clearTiles();
        gameState.grid = JSON.parse(JSON.stringify(gridArray));
        gameUi.updateUI();
        
        console.log('Board initialized with custom grid:', gridArray);
    }

    testHighValueTiles() {
        const testGrid = [
            [4096, 8192, 16384, 32768],
            [65536, 131072, 262144, 524288],
            [1048576, 2097152, 4194304, 8388608],
            [16777216, 33554432, 67108864, 134217728]
        ];
        this.initBoard(testGrid);
        console.log('Initialized board with high value tiles for testing');
    }

    testNearWin() {
        const testGrid = [
            [1024, 1024, 0, 0],
            [512, 512, 0, 0],
            [256, 256, 0, 0],
            [0, 0, 0, 2]
        ];
        this.initBoard(testGrid);
        console.log('Initialized board with near-win scenario');
    }

    testGameOver() {
        const testGrid = [
            [2, 4, 2, 4],
            [4, 2, 4, 2],
            [2, 4, 2, 4],
            [4, 2, 4, 2]
        ];
        this.initBoard(testGrid);
        console.log('Initialized board with game over scenario');
    }

    testEmpty() {
        const testGrid = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        this.initBoard(testGrid);
        console.log('Initialized empty board');
    }

    getCurrentBoard() {
        if (!this.gameUi) {
            console.log('Game not initialized');
            return null;
        }

        const grid = this.gameUi.gameState.grid;
        console.log('Current board state:');
        console.table(grid);
        return grid;
    }

    clearBoard() {
        this.testEmpty();
    }

    addRandomTiles(count = 2) {
        const gameUi = this.initGame();
        
        for (let i = 0; i < count; i++) {
            gameUi.gameState.addRandomTile();
        }
        
        gameUi.updateUI();
        console.log(`Added ${count} random tiles`);
    }

    moveUp() {
        const gameUi = this.initGame();
        console.log('Making move: up');

        const beforeScore = gameUi.gameState.score;
        const moved = gameUi.makeMove('up');
        
        if (moved) {
            const afterScore = gameUi.gameState.score;
            const scoreGain = afterScore - beforeScore;
            console.log(`Move successful! Score: ${beforeScore} → ${afterScore} (+${scoreGain})`);
            this.getCurrentBoard();
        } else {
            console.log('Move not possible in that direction');
        }
        
        return moved;
    }

    moveDown() {
        const gameUi = this.initGame();
        console.log('Making move: down');

        const beforeScore = gameUi.gameState.score;
        const moved = gameUi.makeMove('down');
        
        if (moved) {
            const afterScore = gameUi.gameState.score;
            const scoreGain = afterScore - beforeScore;
            console.log(`Move successful! Score: ${beforeScore} → ${afterScore} (+${scoreGain})`);
            this.getCurrentBoard();
        } else {
            console.log('Move not possible in that direction');
        }
        
        return moved;
    }

    moveLeft() {
        const gameUi = this.initGame();
        console.log('Making move: left');

        const beforeScore = gameUi.gameState.score;
        const moved = gameUi.makeMove('left');
        
        if (moved) {
            const afterScore = gameUi.gameState.score;
            const scoreGain = afterScore - beforeScore;
            console.log(`Move successful! Score: ${beforeScore} → ${afterScore} (+${scoreGain})`);
            this.getCurrentBoard();
        } else {
            console.log('Move not possible in that direction');
        }
        
        return moved;
    }

    moveRight() {
        const gameUi = this.initGame();
        console.log('Making move: right');

        const beforeScore = gameUi.gameState.score;
        const moved = gameUi.makeMove('right');
        
        if (moved) {
            const afterScore = gameUi.gameState.score;
            const scoreGain = afterScore - beforeScore;
            console.log(`Move successful! Score: ${beforeScore} → ${afterScore} (+${scoreGain})`);
            this.getCurrentBoard();
        } else {
            console.log('Move not possible in that direction');
        }
        
        return moved;
    }
}

const game2048Test = new Game2048Test();

function setTile(row, col, value) {
    game2048Test.setTile(row, col, value);
}

function initBoard(gridArray) {
    game2048Test.initBoard(gridArray);
}

function testHighValues() {
    game2048Test.testHighValueTiles();
}

function testNearWin() {
    game2048Test.testNearWin();
}

function testGameOver() {
    game2048Test.testGameOver();
}

function clearBoard() {
    game2048Test.clearBoard();
}

function getCurrentBoard() {
    return game2048Test.getCurrentBoard();
}

function moveUp() {
    return game2048Test.moveUp();
}

function moveDown() {
    return game2048Test.moveDown();
}

function moveLeft() {
    return game2048Test.moveLeft();
}

function moveRight() {
    return game2048Test.moveRight();
}

console.log(`
2048 Test Utilities Loaded!

Available functions:
- setTile(row, col, value) - Set a specific tile (1-4 based indexing)
- initBoard(gridArray) - Initialize with a 4x4 array
- testHighValues() - Load board with high value tiles
- testNearWin() - Load near-win scenario
- testGameOver() - Load game over scenario  
- clearBoard() - Clear the board
- getCurrentBoard() - Display current board state
- moveUp(), moveDown(), moveLeft(), moveRight() - Make moves in specific directions

Examples:
setTile(1, 1, 4096);  // Set top-left to 4096
initBoard([
    [2048, 1024, 512, 256],
    [128, 64, 32, 16],
    [8, 4, 2, 0],
    [0, 0, 0, 0]
]);
testHighValues();
moveUp();    // Move up
moveLeft();  // Move left
`);
