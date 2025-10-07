/**
 * Evaluates the heuristic goodness of the current grid state based on:
 * 1. Free tiles -> The more empty tiles there are, the better the state is.
 * 2. Monotonicity -> Ensure the tiles have a monotonic trend in both the horizontal and vertical directions.
 *    If 0: Perfectly monotonic
 *    If matrix size: Not monotonic
 *    Else: Partially monotonic
 * 3. Smoothness -> Measures the value difference between neighboring tiles, trying to minimize this count.
 * 
 * @param {number[][]} grid - The 2D grid representing the game state
 * @returns {number} Grid state goodness score
 */
function calculateGoodness(grid) {
  let freeTiles = 0;
  let smoothness = 0;
  let monotonicity = this.GRID_SIZE * this.GRID_SIZE;

  for (let i = 0; i < this.GRID_SIZE; i++) {
    for (let j = 0; j < this.GRID_SIZE; j++) {
      if (grid[i][j] === 0) {
        freeTiles += 1;
      }

      if (j !== this.GRID_SIZE - 1) {
        // In Rows
        smoothness += Math.abs(grid[i][j] - grid[i][j + 1]);
        if (grid[i][j] >= grid[i][j + 1]) {
          monotonicity -= 1;
        }

        // In Columns
        smoothness += Math.abs(grid[j][i] - grid[j + 1][i]);
        if (grid[j][i] >= grid[j + 1][i]) {
          monotonicity -= 1;
        }
      }
    }
  }

  return freeTiles + monotonicity + smoothness;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game2048Heuristics;
}