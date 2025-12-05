function rotateArrayRight(arr, newStart){
    let result = arr;
    result.reverse();
    result.shift();
    result.reverse();
    result.unshift(newStart);
    return result;
}

function clone (src) {
    return JSON.parse(JSON.stringify(src));
}

// Game settings
const settings = {
    gridSize: 10,
    tileSize: 30,
    speedMs: 200
}
let started = false
let loopHandle


const MVTDIR_UP = 0;
const MVTDIR_DOWN = 1;
const MVTDIR_LEFT = 2;
const MVTDIR_RIGHT = 3;

class SnakeSegment{
    x; y;

    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Snake{
    snakeSegments;
    nbSegments;
    directionSwitches;

    constructor(headX, headY, direction, nbSegments){
        this.nbSegments = nbSegments;
        this.snakeSegments = [];
        this.directionSwitches = [];
        this.direction = direction;
        this.snakeSegments.push(new SnakeSegment(headX, headY));
        for (let i = 0; i < nbSegments - 1; ++i){
            this.snakeSegments.push(
                new SnakeSegment(
                    headX + (direction === MVTDIR_LEFT ? (i + 1) : (direction === MVTDIR_RIGHT ? -(i + 1) : 0)),
                    headY + (direction === MVTDIR_UP ? (i + 1) : (direction === MVTDIR_DOWN? -(i + 1) : 0))
                )
            );
        }
        for (let i = 0; i < nbSegments; ++i){
            this.directionSwitches.push(direction);
        }
    }

    move(){
        const oldPositions = clone(this.snakeSegments);
        for (let i = 0; i < this.nbSegments; ++i){
            let dirSwitch = this.directionSwitches[i];
            this.snakeSegments[i].x += (dirSwitch === MVTDIR_LEFT ? -1 : (dirSwitch === MVTDIR_RIGHT ? 1 : 0));
            this.snakeSegments[i].y += (dirSwitch === MVTDIR_UP ? -1 : (dirSwitch === MVTDIR_DOWN? 1 : 0));
        }
        this.directionSwitches = rotateArrayRight(this.directionSwitches, this.direction);

        for (let i = 0; i < this.nbSegments; ++i){
            if (oldPositions[i].x === this.snakeSegments[0].x && oldPositions[i].y === this.snakeSegments[0].y){
                started = false;
                clearInterval(loopHandle);
            }
        }

        if (
            this.snakeSegments[0].x < 0
            || this.snakeSegments[0].x >= settings.gridSize
            || this.snakeSegments[0].y < 0
            || this.snakeSegments[0].y >= settings.gridSize
        ){
            started = false;
            clearInterval(loopHandle);
        }
    }

    changeDirection(keyCode){
        if (keyCode === "ArrowLeft"){
            if (this.direction !== MVTDIR_RIGHT) {
                this.direction = MVTDIR_LEFT;
            }
        }
        else if (keyCode === "ArrowRight"){
            if (this.direction !== MVTDIR_LEFT) {
                this.direction = MVTDIR_RIGHT;
            }
        }
        else if (keyCode === "ArrowUp"){
            if (this.direction !== MVTDIR_DOWN) {
                this.direction = MVTDIR_UP;
            }
        }
        else if (keyCode === "ArrowDown"){
            if (this.direction !== MVTDIR_UP) {
                this.direction = MVTDIR_DOWN;
            }
        }
    }
}

(function () {
    'use strict'

    let bg = new Image(300, 300);
    bg.src = "../assets/img/background.png"

    // Game state
    let canvas, ctx
    let snake = []
    let score = 0

    function loop() {
        requestAnimationFrame(loop)
        canvas = document.getElementById('game-canvas')
        if (!canvas) {
            console.error('Canvas not found')
            return
        }

        ctx = canvas.getContext('2d')

        score = 0
        updateScore()
        draw()
    }

    function updateScore() {
        const scoreEl = document.getElementById('score')
        if (scoreEl) scoreEl.textContent = String(score).padStart(3, '0')
    }

    function draw() {
        if (!ctx) return

        // Clear canvas (white background)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(bg, 0, 0)

        // Draw grid
        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 1
        for (let i = 0; i <= settings.gridSize; i++) {
            const pos = i * settings.tileSize
            ctx.beginPath()
            ctx.moveTo(pos, 0)
            ctx.lineTo(pos, canvas.height)
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(0, pos)
            ctx.lineTo(canvas.width, pos)
            ctx.stroke()
        }

        // Draw snake
        snake.snakeSegments.forEach((segment, index) => {
            const x = segment.x * settings.tileSize
            const y = segment.y * settings.tileSize
            const color = index === 0 ? '#9ef4c9' : '#41d17b' // head is lighter

            ctx.fillStyle = color
            ctx.fillRect(x + 1, y + 1, settings.tileSize - 2, settings.tileSize - 2)
        })
    }

    snake = new Snake(5, 5, MVTDIR_RIGHT, 5)
    // Initialize on page load
    loop()
    window.onkeydown = (e) => {
        if (!started && e.code === "Space"){
            started = true;
            snake = new Snake(5, 5, MVTDIR_RIGHT, 5);
            loopHandle = setInterval(
                () => {
                    snake.move();
                    draw();
                },
                400
            )
        }
        if (started){
            snake.changeDirection(e.code);
        }
    };
})()
