class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.restartBtn = document.getElementById('restart-btn');

        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameSpeed = 150;
        this.gameLoop = null;
        this.isPaused = false;
        this.isGameOver = false;

        this.initialize();
        this.setupEventListeners();
    }

    initialize() {
        // Initialize snake at center
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];

        this.generateFood();
        this.score = 0;
        this.dx = 1;
        this.dy = 0;
        this.isGameOver = false;
        this.updateScore();
        this.draw();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (this.dx === 0) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (this.dx === 0) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case ' ':
                    this.togglePause();
                    break;
            }
        });

        // Button controls
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
    }

    startGame() {
        if (this.gameLoop) return;
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.isPaused = false;
        
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    togglePause() {
        if (this.isGameOver) return;

        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            this.pauseBtn.textContent = 'Resume';
        } else {
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            this.pauseBtn.textContent = 'Pause';
        }
    }

    restartGame() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
        this.isPaused = false;
        this.initialize();
    }

    update() {
        if (this.isPaused || this.isGameOver) return;

        const head = { 
            x: this.snake[0].x + this.dx, 
            y: this.snake[0].y + this.dy 
        };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                this.gameOver();
                return;
            }
        }

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
            // Don't remove tail when eating food (snake grows)
        } else {
            // Remove tail if not eating
            this.snake.pop();
        }

        // Add new head
        this.snake.unshift(head);

        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw food
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize, 
            this.gridSize
        );

        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#4CAF50';
            } else {
                // Body
                this.ctx.fillStyle = '#8BC34A';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize, 
                this.gridSize
            );

            // Add eyes to head
            if (index === 0) {
                this.ctx.fillStyle = 'white';
                // Left eye
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize * 0.3,
                    segment.y * this.gridSize + this.gridSize * 0.3,
                    this.gridSize * 0.15,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                
                // Right eye
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize * 0.7,
                    segment.y * this.gridSize + this.gridSize * 0.3,
                    this.gridSize * 0.15,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });

        // Draw grid lines (optional)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    generateFood() {
        let food;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            
            // Check if food is on snake
            for (let segment of this.snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        this.food = food;
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        // Draw game over message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText('Click Restart to play again', this.canvas.width / 2, this.canvas.height / 2 + 40);
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
