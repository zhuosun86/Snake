class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        // Grid size
        this.gridSize = 20;
        
        // Initial snake position and body
        this.snake = [{x: 5, y: 5}]; // Start with head only
        
        // Initial direction (right)
        this.direction = {x: 1, y: 0};
        
        // Initial food position
        this.food = this.generateFood();
        
        // Score
        this.score = 0;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        
        // Difficulty settings
        this.difficulty = 'Easy'; // Default difficulty
        this.speed = 200; // Default speed

        // Bind keyboard controls
        this.setupControls();
        
        // Create start button and difficulty buttons
        this.createStartButton();
        this.createDifficultyButtons();
        
        // Create game over modal
        this.createGameOverModal();
        
        // Set initial background
        this.drawBackground();
        
        // Set default difficulty button style
        this.updateDifficultyButtons();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y !== 1) {
                        this.direction = {x: 0, y: -1};
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction.y !== -1) {
                        this.direction = {x: 0, y: 1};
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction.x !== 1) {
                        this.direction = {x: -1, y: 0};
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction.x !== -1) {
                        this.direction = {x: 1, y: 0};
                    }
                    break;
                case ' ':
                    if (this.isRunning) {
                        this.togglePause();
                    } else if (!this.isRunning && this.modal.style.display === 'block') {
                        // Do nothing when game is over
                    } else {
                        this.startGame();
                    }
                    break;
            }
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            clearTimeout(this.gameLoopTimeout);
            this.startButton.textContent = 'Resume'; // Change to Resume when paused
        } else {
            this.gameLoop();
            this.startButton.textContent = 'Pause'; // Change to Pause when running
        }
    }

    setDifficulty(level) {
        if (this.isRunning) return; // Prevent changing difficulty during the game
        this.difficulty = level;
        switch (level) {
            case 'Super Easy':
                this.speed = 300;
                break;
            case 'Easy':
                this.speed = 200;
                break;
            case 'Mid':
                this.speed = 150;
                break;
            case 'Hard':
                this.speed = 100;
                break;
        }
        this.updateDifficultyButtons();
    }

    updateDifficultyButtons() {
        const buttons = document.querySelectorAll('.difficulty-button');
        buttons.forEach(button => {
            button.style.backgroundColor = 'lightgray'; // Default background
            button.style.color = 'black'; // Default text color
            if (button.textContent === this.difficulty) {
                button.style.backgroundColor = '#4CAF50'; // Green background for selected
                button.style.color = 'white'; // White text for selected
            }
        });
    }

    generateFood() {
        return {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)),
            image: this.createAppleImage() // Generate apple image
        };
    }

    createAppleImage() {
        const appleCanvas = document.createElement('canvas');
        const appleCtx = appleCanvas.getContext('2d');
        appleCanvas.width = 20;
        appleCanvas.height = 20;

        // Draw a simple apple shape
        appleCtx.fillStyle = 'red';
        appleCtx.beginPath();
        appleCtx.arc(10, 10, 10, 0, Math.PI * 2, true);
        appleCtx.fill();

        // Draw a simple leaf
        appleCtx.fillStyle = 'green';
        appleCtx.beginPath();
        appleCtx.moveTo(10, 5);
        appleCtx.lineTo(15, 0);
        appleCtx.lineTo(10, 5);
        appleCtx.fill();

        return appleCanvas;
    }

    update() {
        if (this.isPaused) return;

        // Calculate new head position
        const newHead = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Check for collisions with walls
        if (newHead.x < 0 || 
            newHead.x >= this.canvas.width / this.gridSize ||
            newHead.y < 0 || 
            newHead.y >= this.canvas.height / this.gridSize) {
            this.gameOver();
            return;
        }

        // Check for collision with self
        for (let segment of this.snake) {
            if (newHead.x === segment.x && newHead.y === segment.y) {
                this.gameOver();
                return;
            }
        }

        // Add new head
        this.snake.unshift(newHead);

        // Check if food is eaten
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            document.getElementById('scoreValue').textContent = this.score;
            this.food = this.generateFood();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
    }

    draw() {
        // Clear canvas with static light/mid green mosaic background
        this.ctx.fillStyle = this.createMosaic();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.save();
                this.ctx.translate(segment.x * this.gridSize + this.gridSize / 2, segment.y * this.gridSize + this.gridSize / 2);
                this.ctx.rotate(Math.atan2(this.direction.y, this.direction.x));
                const snakeHeadImage = new Image();
                snakeHeadImage.src = 'simple-snake-head.png'; // Use provided image
                this.ctx.drawImage(snakeHeadImage, -this.gridSize / 2, -this.gridSize / 2, this.gridSize, this.gridSize);
                this.ctx.restore();
            } else {
                this.ctx.fillStyle = 'darkviolet';
                this.ctx.fillRect(
                    segment.x * this.gridSize,
                    segment.y * this.gridSize,
                    this.gridSize - 1,
                    this.gridSize - 1
                );
            }
        });

        // Draw food (apple)
        this.ctx.drawImage(this.food.image, this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize, this.gridSize);
    }

    createMosaic() {
        const mosaicCanvas = document.createElement('canvas');
        mosaicCanvas.width = 20;
        mosaicCanvas.height = 20;
        const ctx = mosaicCanvas.getContext('2d');

        // Draw a simple static light/mid green mosaic pattern
        for (let i = 0; i < 20; i += 5) {
            for (let j = 0; j < 20; j += 5) {
                ctx.fillStyle = (Math.random() > 0.5) ? '#90EE90' : '#98FB98'; // Light green shades
                ctx.fillRect(i, j, 5, 5);
            }
        }
        return ctx.createPattern(mosaicCanvas, 'repeat');
    }

    createStartButton() {
        this.startButton = document.createElement('button');
        this.startButton.textContent = 'Start Game';
        this.startButton.style.marginTop = '10px';
        this.startButton.style.padding = '10px 20px';
        this.startButton.style.fontSize = '16px';
        document.querySelector('.game-container').appendChild(this.startButton);

        this.startButton.addEventListener('click', () => {
            if (!this.isRunning) {
                this.startGame();
                this.startButton.textContent = 'Pause'; // Change to Pause when game starts
            }
        });
    }

    createDifficultyButtons() {
        const difficultyContainer = document.createElement('div');
        difficultyContainer.style.marginTop = '10px';
        difficultyContainer.style.textAlign = 'center';

        ['Super Easy', 'Easy', 'Mid', 'Hard'].forEach(level => {
            const button = document.createElement('button');
            button.textContent = level;
            button.classList.add('difficulty-button');
            button.style.margin = '5px';
            button.style.padding = '10px 20px';
            button.style.fontSize = '16px';
            button.style.backgroundColor = 'lightgray'; // Default background
            button.style.color = 'black'; // Default text color
            button.style.border = '2px solid transparent'; // Add border for better visibility
            button.style.borderRadius = '5px'; // Rounded corners
            button.addEventListener('click', () => this.setDifficulty(level));
            difficultyContainer.appendChild(button);
        });

        document.querySelector('.game-container').appendChild(difficultyContainer);
    }

    createGameOverModal() {
        this.modal = document.createElement('div');
        this.modal.style.display = 'none';
        this.modal.style.position = 'fixed';
        this.modal.style.top = '50%';
        this.modal.style.left = '50%';
        this.modal.style.transform = 'translate(-50%, -50%)';
        this.modal.style.backgroundColor = 'white';
        this.modal.style.borderRadius = '10px';
        this.modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        this.modal.style.padding = '20px';
        this.modal.style.zIndex = '1000';

        this.modalContent = document.createElement('div');
        this.modalContent.innerHTML = `<h2>Game Over</h2><p>Your Score: <strong id="finalScore">0</strong></p>`;
        this.modal.appendChild(this.modalContent);

        this.playAgainButton = document.createElement('button');
        this.playAgainButton.textContent = 'Play Again';
        this.playAgainButton.style.marginTop = '10px';
        this.playAgainButton.style.padding = '10px 20px';
        this.playAgainButton.style.fontSize = '16px';
        this.playAgainButton.addEventListener('click', () => this.resetGame());
        this.modal.appendChild(this.playAgainButton);

        document.body.appendChild(this.modal);
    }

    resetGame() {
        this.modal.style.display = 'none';
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.startButton.textContent = 'Start Game'; // Reset button text to Start Game
        document.getElementById('scoreValue').textContent = this.score;
        this.snake = [{x: 5, y: 5}];
        this.direction = {x: 1, y: 0};
        this.food = this.generateFood();
        this.updateDifficultyButtons();
    }

    gameOver() {
        this.isRunning = false;
        this.isPaused = false;
        document.getElementById('finalScore').textContent = this.score;
        this.modal.style.display = 'block';
        this.startButton.textContent = 'Start Game'; // Reset button text to Start Game
    }

    gameLoop() {
        if (!this.isRunning) return;

        this.update();
        this.draw();
        this.gameLoopTimeout = setTimeout(() => this.gameLoop(), this.speed);
    }

    startGame() {
        this.isRunning = true;
        this.snake = [{x: 5, y: 5}];
        this.direction = {x: 1, y: 0};
        this.score = 0;
        document.getElementById('scoreValue').textContent = this.score;
        this.food = this.generateFood();
        this.startButton.textContent = 'Pause'; // Change to Pause when game starts
        this.gameLoop();
    }
}

// Start the game when the page loads
window.onload = () => {
    new SnakeGame();
};