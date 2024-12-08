const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');

let score = 0;
let direction = 'right';
let snakeBody = [{ x: 0, y: 0 }];
let gameRunning = false;
let gameInterval;
let specialPowerActive = false;
let isPaused = false;
let gapSize = 0;

// Calculate the segment size dynamically based on the container size and the grid size (16x16)
const calculateSegmentSize = () => {
    return Math.min(gameContainer.clientWidth, gameContainer.clientHeight) / 16;
};

let foodElement = null;
let specialPowerTimer = null;

let touchStartX, touchStartY;


function renderSnake() {
    gameContainer.innerHTML = ''; // Clear previous render

    // Calculate the segment size based on container size and grid size (16x16)
    const segmentSize = Math.min(gameContainer.clientWidth, gameContainer.clientHeight) / 16;

    snakeBody.forEach((segment, index) => {
        const snakeSegment = document.createElement('div');
        snakeSegment.className = 'snake';

        // Apply specific styling for the head and tail
        if (index === 0) {
            snakeSegment.classList.add('snake-head');
        } else if (index === snakeBody.length - 1) {
            snakeSegment.classList.add('snake-tail');
            if (snakeBody.length > 1) {
                const prevSegment = snakeBody[index - 1];
                const angle = Math.atan2(segment.y - prevSegment.y, segment.x - prevSegment.x) * (180 / Math.PI);
                snakeSegment.style.transform = `rotate(${angle}deg)`; // Rotate tail based on direction
            }
        }

        // Position the snake segment
        snakeSegment.style.left = `${segment.x * segmentSize}px`;
        snakeSegment.style.top = `${segment.y * segmentSize}px`;
        snakeSegment.style.width = `${segmentSize}px`;
        snakeSegment.style.height = `${segmentSize}px`;

        // Add color to the snake (head, body, and tail)
        if (index === 0) {
            snakeSegment.style.backgroundColor = 'brown';
        } else if (index === snakeBody.length - 1) {
            snakeSegment.style.backgroundColor = 'yellow';
        } else {
            snakeSegment.style.backgroundColor = 'green';
        }

        gameContainer.appendChild(snakeSegment);
    });

    // Render food if present
    if (foodElement) {
        gameContainer.appendChild(foodElement);
    }
}

function moveSnake() {
    if (isPaused || !gameRunning) return;

    const segmentSize = Math.min(gameContainer.clientWidth, gameContainer.clientHeight) / 16;

    const head = { ...snakeBody[0] };

    switch (direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }

    // Prevent snake from going out of bounds when special power is not active
    if (!specialPowerActive) {
        if (head.x < 0 || head.x >= 16 || head.y < 0 || head.y >= 16) {
            gameOver();
            return;
        }
    } else {
        if (head.x < 0) head.x = 15;
        if (head.x >= 16) head.x = 0;
        if (head.y < 0) head.y = 15;
        if (head.y >= 16) head.y = 0;
    }

    snakeBody.unshift(head);

    // Check if food is eaten
    if (foodElement && head.x === foodElement.offsetLeft / segmentSize && head.y === foodElement.offsetTop / segmentSize) {
        if (foodElement.classList.contains('heart-food')) {
            activateSpecialPower();
        }
        increaseScore();
        generateFood();
    } else {
        snakeBody.pop();
    }

    renderSnake();
    checkCollision();
}

function generateFood() {
    if (isPaused) return;

    if (foodElement) {
        foodElement.remove();
    }

    const segmentSize = Math.min(gameContainer.clientWidth, gameContainer.clientHeight) / 16;
    const maxX = Math.floor(gameContainer.clientWidth / segmentSize) - 1;
    const maxY = Math.floor(gameContainer.clientHeight / segmentSize) - 1;

    let randomX, randomY, isOnSnake;
    let foodType = Math.random() < 0.1 ? 'heart-food' : 'food';

    do {
        randomX = Math.floor(Math.random() * (maxX + 1));
        randomY = Math.floor(Math.random() * (maxY + 1));

        isOnSnake = snakeBody.some(segment => segment.x === randomX && segment.y === randomY);
    } while (isOnSnake);

    foodElement = document.createElement('div');
    foodElement.className = foodType;

    if (foodType === 'heart-food') {
        foodElement.style.backgroundColor = 'blue';
    } else {
        foodElement.style.backgroundColor = 'red';
    }

    foodElement.style.left = `${randomX * segmentSize}px`;
    foodElement.style.top = `${randomY * segmentSize}px`;
    foodElement.style.width = `${segmentSize}px`;
    foodElement.style.height = `${segmentSize}px`;

    gameContainer.appendChild(foodElement);
}


// Increase score when food is eaten
function increaseScore() {
    score++;
    scoreDisplay.innerText = `${score}`;
}

// Activate special power when the snake eats heart-shaped food
function activateSpecialPower() {
    if (specialPowerActive) return;
    specialPowerActive = true;
    blinkSnake();

    gameContainer.classList.add('blink-border');

    if (specialPowerTimer) clearTimeout(specialPowerTimer);
    specialPowerTimer = setTimeout(() => {
        specialPowerActive = false;
        renderSnake();
        gameContainer.classList.remove('blink-border');
    }, 10000);
}

// Make the snake blink while the special power is active
function blinkSnake() {
    let blinkInterval = setInterval(() => {
        document.querySelectorAll('.snake').forEach((segment) => {
            segment.classList.toggle('transparent');
        });
    }, 500);

    setTimeout(() => {
        clearInterval(blinkInterval);
        renderSnake();
    }, 5000);
}

// Check for collisions with the snake's body
function checkCollision() {
    for (let i = 1; i < snakeBody.length; i++) {
        if (snakeBody[0].x === snakeBody[i].x && snakeBody[0].y === snakeBody[i].y) {
            if (!specialPowerActive) {
                gameOver();
            }
        }
    }
}

// Start the game when the screen is touched or clicked anywhere
document.addEventListener('touchstart', startGameOnTouch);
document.addEventListener('click', startGameOnTouch);

function startGameOnTouch() {
    // Prevent starting the game multiple times
    if (!gameRunning) {
        startGame(); // Start the game if it's not already running
    }
}

// Reset the game to its initial state
function resetGame() {
    score = 0;
    direction = 'right';
    snakeBody = [{ x: 0, y: 0 }];
    specialPowerActive = false;
    isPaused = false;
    clearTimeout(specialPowerTimer);

    if (foodElement) foodElement.remove();

    renderSnake();
    generateFood();
    scoreDisplay.innerText = '0';

    gameRunning = false;
    gameInterval = null;
}

// Start the game when it begins
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        isPaused = false;
        score = 0;
        scoreDisplay.innerText = `${score}`;
        generateFood();
        renderSnake();
        gameInterval = setInterval(moveSnake, 200);

        document.getElementById('pause-btn').style.display = 'block';
    }
}

// Pause button event listener
document.getElementById('pause-btn').addEventListener('click', () => {
    isPaused = !isPaused;
    const pauseBtnIcon = document.querySelector('#pause-btn i');

    if (isPaused) {
        clearInterval(gameInterval);
        pauseBtnIcon.classList.remove('fa-pause');
        pauseBtnIcon.classList.add('fa-play');
    } else {
        gameInterval = setInterval(moveSnake, 200);
        pauseBtnIcon.classList.remove('fa-play');
        pauseBtnIcon.classList.add('fa-pause');
    }
});

// Handle game over scenario
function gameOver() {
    clearInterval(gameInterval);
    alert('Game Over!');
    resetGame();

    document.getElementById('pause-btn').style.display = 'none';
}

// Drawer functions
function openDrawer() {
    document.getElementById("tableDrawer").style.width = "24vw";
    document.getElementById("mainBtn").classList.add("rotate-icon");
}

function closeDrawer() {
    document.getElementById("tableDrawer").style.width = "0";
    document.getElementById("mainBtn").classList.remove("rotate-icon");
}

document.getElementById("mainBtn").addEventListener("click", () => {
    const drawer = document.getElementById("tableDrawer");
    if (drawer.style.width === "0px" || drawer.style.width === "") {
        openDrawer();
    } else {
        closeDrawer();
    }
});

// Ensure joystick is visible and initialized by default when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Initially, hide arrow controls and show joystick
    document.getElementById("arrowControls").style.display = "none"; // Hide arrow buttons
    document.getElementById("joystick").style.display = "flex"; // Show joystick

    // Initialize joystick functionality
    initJoystick();
});

// Handle showing and hiding arrow controls
document.getElementById("arrowBtn").addEventListener("click", () => {
    // Show arrow controls
    document.getElementById("arrowControls").style.display = "grid"; // Show arrow buttons
    // Hide joystick controls
    document.getElementById("joystick").style.display = "none"; // Hide joystick
    // Close the drawer
    closeDrawer();
});

// Handle showing and hiding joystick controls
document.getElementById("joystickBtn").addEventListener("click", () => {
    // Hide arrow controls
    document.getElementById("arrowControls").style.display = "none"; // Hide arrow buttons
    // Show joystick controls
    document.getElementById("joystick").style.display = "flex"; // Show joystick
    // Close the drawer
    closeDrawer();
});

function initJoystick() {
    const joystickInner = document.getElementById("joystickInner");
    const joystickBall = document.getElementById("joystickBall");
    let isMoving = false;
    const joystickRadius = 50;
    const ballRadius = 15;
    const centerX = joystickRadius;
    const centerY = joystickRadius;
    const sensitivity = 5;

    let lastDirection = 'right';  // Keep track of the last direction

    joystickInner.addEventListener('mousedown', (e) => {
        isMoving = true;
        updateBallPosition(e.clientX, e.clientY);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
    });

    joystickInner.addEventListener('touchstart', (e) => {
        isMoving = true;
        updateBallPosition(e.touches[0].clientX, e.touches[0].clientY);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('touchend', onEnd);
    });

    function onMove(e) {
        if (isMoving) {
            updateBallPosition(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);
        }
    }

    function onEnd() {
        isMoving = false;
        joystickBall.style.left = `${centerX - ballRadius}px`;
        joystickBall.style.top = `${centerY - ballRadius}px`;
    }

    function updateBallPosition(clientX, clientY) {
        const rect = joystickInner.getBoundingClientRect();
        const offsetX = clientX - rect.left - centerX;
        const offsetY = clientY - rect.top - centerY;

        const angle = Math.atan2(offsetY, offsetX);
        const distance = Math.min(joystickRadius, Math.sqrt(offsetX * offsetX + offsetY * offsetY));

        const moveX = distance * Math.cos(angle);
        const moveY = distance * Math.sin(angle);

        joystickBall.style.left = `${centerX + moveX - ballRadius}px`;
        joystickBall.style.top = `${centerY + moveY - ballRadius}px`;

        // Convert joystick movement to game directions, but avoid opposite directions
        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX > 0 && lastDirection !== 'left') {
                direction = 'right';
                lastDirection = 'right';
            } else if (moveX < 0 && lastDirection !== 'right') {
                direction = 'left';
                lastDirection = 'left';
            }
        } else {
            if (moveY > 0 && lastDirection !== 'up') {
                direction = 'down';
                lastDirection = 'down';
            } else if (moveY < 0 && lastDirection !== 'down') {
                direction = 'up';
                lastDirection = 'up';
            }
        }
    }
}

document.getElementById("upArrow").addEventListener("click", () => {
    if (direction !== "down") direction = "up";  // Prevent reversing direction
});

document.getElementById("downArrow").addEventListener("click", () => {
    if (direction !== "up") direction = "down"; // Prevent reversing direction
});

document.getElementById("leftArrow").addEventListener("click", () => {
    if (direction !== "right") direction = "left"; // Prevent reversing direction
});

document.getElementById("rightArrow").addEventListener("click", () => {
    if (direction !== "left") direction = "right"; // Prevent reversing direction
}); 0
