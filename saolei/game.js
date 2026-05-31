class Minesweeper {
    constructor() {
        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 16, cols: 30, mines: 99 }
        };

        this.currentDifficulty = 'easy';
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;

        this.initializeDOM();
        this.failureEffect = new FailureEffect();
        this.initializeGame();
    }

    initializeDOM() {
        this.gameBoard = document.getElementById('gameBoard');
        this.mineCountDisplay = document.getElementById('mineCount');
        this.timerDisplay = document.getElementById('timer');
        this.restartBtn = document.getElementById('restartBtn');
        this.modal = document.getElementById('gameOverModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalRestartBtn = document.getElementById('modalRestartBtn');

        // 难度按钮
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = e.target.dataset.level;
                this.initializeGame();
            });
        });

        // 重新开始按钮
        this.restartBtn.addEventListener('click', () => this.initializeGame());
        this.modalRestartBtn.addEventListener('click', () => {
            this.modal.classList.remove('show');
            this.initializeGame();
        });
    }

    initializeGame() {
        if (this.failureEffect) {
            this.failureEffect.stop();
        }
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerDisplay.textContent = '0';

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const config = this.difficulties[this.currentDifficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.mineCount = config.mines;
        this.mineCountDisplay.textContent = this.mineCount;

        this.createBoard();
        this.renderBoard();
    }

    createBoard() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.revealed = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
    }

    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);

            // 避免在第一次点击的位置和周围放置雷
            const isNearFirstClick = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;

            if (this.board[row][col] !== -1 && !isNearFirstClick) {
                this.board[row][col] = -1;
                minesPlaced++;
            }
        }

        // 计算每个格子周围的雷数
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] !== -1) {
                    this.board[row][col] = this.countAdjacentMines(row, col);
                }
            }
        }
    }

    countAdjacentMines(row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol] === -1) {
                    count++;
                }
            }
        }
        return count;
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        this.gameBoard.style.gridTemplateRows = `repeat(${this.rows}, 30px)`;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                cell.addEventListener('click', () => this.handleCellClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(row, col);
                });

                this.updateCell(cell, row, col);
                this.gameBoard.appendChild(cell);
            }
        }
    }

    updateCell(cell, row, col) {
        if (this.flagged[row][col]) {
            cell.classList.add('flagged');
        } else {
            cell.classList.remove('flagged');
        }

        if (this.revealed[row][col]) {
            cell.classList.add('revealed');
            if (this.board[row][col] === -1) {
                cell.classList.add('mine');
            } else if (this.board[row][col] > 0) {
                cell.textContent = this.board[row][col];
                cell.classList.add(`number-${this.board[row][col]}`);
            }
        }
    }

    handleCellClick(row, col) {
        if (this.gameOver || this.gameWon) return;
        if (this.revealed[row][col] || this.flagged[row][col]) return;

        // 第一次点击时生成雷区
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }

        // 踩到雷
        if (this.board[row][col] === -1) {
            this.revealCell(row, col);
            const cell = this.gameBoard.children[row * this.cols + col];
            cell.classList.add('mine-hit');
            this.endGame(false);
            return;
        }

        // 展开格子
        this.revealCell(row, col);

        // 如果是空格，自动展开周围
        if (this.board[row][col] === 0) {
            this.revealAdjacentCells(row, col);
        }

        this.checkWin();
    }

    handleRightClick(row, col) {
        if (this.gameOver || this.gameWon) return;
        if (this.revealed[row][col]) return;

        this.flagged[row][col] = !this.flagged[row][col];

        // 更新剩余雷数显示
        const flaggedCount = this.flagged.flat().filter(f => f).length;
        this.mineCountDisplay.textContent = this.mineCount - flaggedCount;

        const cell = this.gameBoard.children[row * this.cols + col];
        this.updateCell(cell, row, col);
    }

    revealCell(row, col) {
        if (!this.isValidCell(row, col) || this.revealed[row][col]) return;

        this.revealed[row][col] = true;
        const cell = this.gameBoard.children[row * this.cols + col];
        this.updateCell(cell, row, col);
    }

    revealAdjacentCells(row, col) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;

                if (this.isValidCell(newRow, newCol) &&
                    !this.revealed[newRow][newCol] &&
                    !this.flagged[newRow][newCol]) {
                    this.revealCell(newRow, newCol);

                    if (this.board[newRow][newCol] === 0) {
                        this.revealAdjacentCells(newRow, newCol);
                    }
                }
            }
        }
    }

    checkWin() {
        let revealedCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.revealed[row][col]) revealedCount++;
            }
        }

        const totalCells = this.rows * this.cols;
        if (revealedCount === totalCells - this.mineCount) {
            this.endGame(true);
        }
    }

    endGame(won) {
        this.gameOver = !won;
        this.gameWon = won;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        if (!won) {
            this.failureEffect.start();
            // 显示所有雷
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.board[row][col] === -1) {
                        this.revealCell(row, col);
                    }
                }
            }
        }

        // 显示结果弹窗
        setTimeout(() => {
            this.modalTitle.textContent = won ? '恭喜你赢了！' : '游戏结束';
            this.modalMessage.textContent = won
                ? `用时：${this.timer}秒`
                : '很遗憾，你踩到雷了！';
            this.modal.classList.add('show');
        }, 500);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = this.timer;
        }, 1000);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});
