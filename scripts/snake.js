function rotateArrayRight(arr, newStart){
    let result = arr;
    result.reverse();
    result.shift();
    result.reverse();
    result.unshift(newStart);
    return result;
}

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
        for (let i = 0; i < this.nbSegments; ++i){
            let dirSwitch = this.directionSwitches[i];
            this.snakeSegments[i].x += (dirSwitch === MVTDIR_LEFT ? -1 : (dirSwitch === MVTDIR_RIGHT ? 1 : 0));
            this.snakeSegments[i].y += (dirSwitch === MVTDIR_UP ? -1 : (dirSwitch === MVTDIR_DOWN? 1 : 0));
        }
        this.directionSwitches = rotateArrayRight(this.directionSwitches, this.direction);
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

    // Game settings
    const settings = {
        gridSize: 15,
        tileSize: 20,
        speedMs: 200
    }

    // Game state
    let canvas, ctx
    let snake = []
    let score = 0
    let started = false

    function loop() {
        requestAnimationFrame(loop)
        canvas = document.getElementById('game-canvas')
        if (!canvas) {
            console.error('Canvas not found')
            return
        }

        ctx = canvas.getContext('2d')
        
        // Initialize snake with 4 segments
        // snake = [
        //     { x: 7, y: 7 },
        //     { x: 6, y: 7 },
        //     { x: 5, y: 7 },
        //     { x: 4, y: 7 }
        // ]

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

    snake = new Snake(7, 7, MVTDIR_RIGHT, 4)
    // Initialize on page load
    loop()
    window.onkeydown = (e) => {
        if (!started && e.code === "Space"){
            started = true;
            setInterval(
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
