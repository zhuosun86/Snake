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

        // 添加最高分属性
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // 创建最高分显示面板
        this.createScorePanel();

        // 测试食物绘制
        setTimeout(() => {
            this.drawFood();
        }, 1000);
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
            this.updateScore();
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

        // 使用专门的方法绘制食物
        this.drawFood();
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
        this.startButton.style.marginTop = '10px'; // 保持原有的上边距
        this.startButton.style.padding = '10px 20px';
        this.startButton.style.fontSize = '16px';
        this.startButton.style.display = 'block'; // 设置为块级元素
        this.startButton.style.margin = '10px auto'; // 上下10px，左右自动居中
        
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
        this.modalContent.innerHTML = `
            <h2>Game Over</h2>
            <p>Your Score: <strong id="finalScore">0</strong></p>
            <p>Highest Score: <strong id="finalHighScore">${this.highScore}</strong></p>
        `;
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
        this.updateScore();
        this.snake = [{x: 5, y: 5}];
        this.direction = {x: 1, y: 0};
        this.food = this.generateFood();
        this.updateDifficultyButtons();
    }

    gameOver() {
        this.isRunning = false;
        this.isPaused = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHighScore').textContent = this.highScore;
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
        this.updateScore();
        this.food = this.generateFood();
        this.startButton.textContent = 'Pause'; // Change to Pause when game starts
        this.gameLoop();
    }

    // 修改分数面板方法，调整位置
    createScorePanel() {
        // 获取游戏画布的位置信息
        const canvas = document.getElementById('gameCanvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        // 创建分数面板容器
        const scorePanel = document.createElement('div');
        scorePanel.id = 'scorePanel';
        scorePanel.style.position = 'fixed'; // 使用fixed而不是absolute
        scorePanel.style.left = `${canvasRect.right + 20}px`; // 游戏画布右侧20px
        scorePanel.style.top = `${canvasRect.top + 100}px`; // 游戏画布顶部下移100px
        scorePanel.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        scorePanel.style.padding = '15px';
        scorePanel.style.borderRadius = '10px';
        scorePanel.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        scorePanel.style.fontFamily = 'Arial, sans-serif';
        scorePanel.style.width = '150px'; // 固定宽度
        scorePanel.style.zIndex = '100'; // 确保在游戏上方显示
        
        // 创建当前分数显示
        const currentScore = document.createElement('div');
        currentScore.id = 'currentScore';
        currentScore.style.fontSize = '18px';
        currentScore.style.marginBottom = '10px';
        currentScore.textContent = `当前分数: ${this.score}`;
        
        // 创建最高分显示
        const highScore = document.createElement('div');
        highScore.id = 'highScoreDisplay';
        highScore.style.fontSize = '18px';
        highScore.style.fontWeight = 'bold';
        highScore.style.color = '#4CAF50';
        highScore.textContent = `最高分: ${this.highScore}`;
        
        // 添加到面板
        scorePanel.appendChild(currentScore);
        scorePanel.appendChild(highScore);
        
        // 添加到body
        document.body.appendChild(scorePanel);
        
        // 完全移除底部的分数显示
        const oldScoreElement = document.getElementById('score');
        if (oldScoreElement) {
            oldScoreElement.remove();
        }
        
        // 移除分数值显示
        const scoreValueElement = document.getElementById('scoreValue');
        if (scoreValueElement) {
            const parentElement = scoreValueElement.parentElement;
            if (parentElement) {
                parentElement.remove();
            }
        }
        
        // 添加窗口调整大小时更新位置的事件监听器
        window.addEventListener('resize', () => {
            const updatedRect = canvas.getBoundingClientRect();
            scorePanel.style.left = `${updatedRect.right + 20}px`;
            scorePanel.style.top = `${updatedRect.top + 100}px`; // 保持下移100px
        });
    }

    // 修改更新分数的方法
    updateScore() {
        // 检查并更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        // 更新当前分数显示
        const currentScoreElement = document.getElementById('currentScore');
        if (currentScoreElement) {
            currentScoreElement.textContent = `当前分数: ${this.score}`;
        }
        
        // 更新最高分显示
        const highScoreElement = document.getElementById('highScoreDisplay');
        if (highScoreElement) {
            highScoreElement.textContent = `最高分: ${this.highScore}`;
        }
    }

    // 修改绘制食物的方法
    drawFood() {
        const ctx = this.ctx;
        
        // 使用正确的网格坐标 - 乘以网格大小
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 不使用fillRect来绘制背景，直接绘制食物
        // 设置字体大小和样式
        ctx.font = `${this.gridSize}px Arial`;
        ctx.fillStyle = 'red';
        
        // 绘制苹果emoji - 注意y坐标需要调整以正确放置emoji
        ctx.fillText('🍎', x, y + this.gridSize * 0.8);
    }

    // 只添加缺失的 drawBackground 方法，保持原有背景样式
    drawBackground() {
        // 空方法以避免错误
    }

    render() {
        // 空方法
    }
}

// Start the game when the page loads
window.onload = () => {
    new SnakeGame();
};