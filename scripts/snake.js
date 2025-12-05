const MVTDIR_UP = 0;
const MVTDIR_DOWN = 1;
const MVTDIR_LEFT = 2;
const MVTDIR_RIGHT = 3;

// Utility to check where one should turn.
function checkTurn(enumA, enumB){
    if (enumA === enumB){
        return {
            needsTurn: false,
            angle: 0
        }
    }
    if (enumA === MVTDIR_UP && enumB === MVTDIR_LEFT || enumB === MVTDIR_UP && enumA === MVTDIR_LEFT){
        return {
            needsTurn: true,
            angle: 90
        }
    }
    if (enumA === MVTDIR_UP && enumB === MVTDIR_RIGHT || enumB === MVTDIR_UP && enumA === MVTDIR_RIGHT){
        return {
            needsTurn: true,
            angle: 180
        }
    }
    if (enumA === MVTDIR_DOWN && enumB === MVTDIR_RIGHT || enumB === MVTDIR_DOWN && enumA === MVTDIR_RIGHT){
        return {
            needsTurn: true,
            angle: -90
        }
    }
    if (enumA === MVTDIR_DOWN && enumB === MVTDIR_LEFT || enumB === MVTDIR_DOWN && enumA === MVTDIR_LEFT){
        return {
            needsTurn: true,
            angle: 0
        }
    }
}

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

const TO_RADIANS = Math.PI/180;

let started = false
let loopHandle

let snakeHead = new Image(30, 30);
snakeHead.src = "../assets/img/snake/head.png"
let snakeBodyS = new Image(30, 30);
snakeBodyS.src = "../assets/img/snake/straight_body.png"
let snakeBodyUndulate1 = new Image(30, 30);
snakeBodyUndulate1.src = "../assets/img/snake/undulate1.png"
let snakeBodyUndulate2 = new Image(30, 30);
snakeBodyUndulate2.src = "../assets/img/snake/undulate2.png"
let snakeBodyTail1 = new Image(30, 30);
snakeBodyTail1.src = "../assets/img/snake/tail1.png"
let snakeBodyTail2 = new Image(30, 30);
snakeBodyTail2.src = "../assets/img/snake/tail2.png"
let snakeBodyTail3 = new Image(30, 30);
snakeBodyTail3.src = "../assets/img/snake/tail3.png"
let snakeBodyTurn = new Image(30, 30);
snakeBodyTurn.src = "../assets/img/snake/turn.png"
let apple = new Image(30, 30);
apple.src = "../assets/img/apple.png"
let pear = new Image(30, 30);
pear.src = "../assets/img/pear.png"

function drawImg(context, img, x, y, hflip, vflip){
    const storedTransform = context.getTransform();
    context.translate(
        x + (hflip ? img.width : 0),
        y + (vflip ? img.height : 0)
    )
    context.scale(
        hflip ? -1 : 1,
        vflip ? -1 : 1
    )
    context.drawImage(0, 0)
    context.setTransform(storedTransform);
}

function drawRotatedImg(context, image, angleInRad, positionX, positionY, axisX, axisY) {
    let storedTransform = context.getTransform();
    context.translate(positionX, positionY);
    context.rotate(angleInRad);
    context.drawImage(image, -axisX, -axisY);
    context.setTransform(storedTransform);
}

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

    draw(context){
        for (let i = 0; i < this.nbSegments; ++i){
            if (i === 0){
                let rotated = 0.0;
                switch(this.directionSwitches[0]){
                    case MVTDIR_UP:
                        rotated = 0;
                        break;
                    case MVTDIR_DOWN:
                        rotated = 180;
                        break;
                    case MVTDIR_LEFT:
                        rotated = -90;
                        break;
                    case MVTDIR_RIGHT:
                        rotated = 90;
                        break;
                }
                drawRotatedImg(
                    context,
                    snakeHead,
                    TO_RADIANS * rotated,
                    this.snakeSegments[0].x * settings.tileSize + 15,
                    this.snakeSegments[0].y * settings.tileSize + 15,
                    snakeHead.width / 2,
                    snakeHead.height / 2
                )
                continue;
            }
            if (i === this.nbSegments - 1){
                let rotated = 0.0;
                switch(this.directionSwitches[this.nbSegments - 1]){
                    case MVTDIR_UP:
                        rotated = 180;
                        break;
                    case MVTDIR_DOWN:
                        rotated = 0;
                        break;
                    case MVTDIR_LEFT:
                        rotated = 90;
                        break;
                    case MVTDIR_RIGHT:
                        rotated = -90;
                        break;
                }
                drawRotatedImg(
                    context,
                    snakeBodyTail1,
                    TO_RADIANS * rotated,
                    this.snakeSegments[this.nbSegments - 1].x * settings.tileSize + 15,
                    this.snakeSegments[this.nbSegments - 1].y * settings.tileSize + 15,
                    snakeHead.width / 2,
                    snakeHead.height / 2
                )
                continue;
            }
            const previousSegDir = this.directionSwitches[i - 1];
            const currentSegDir = this.directionSwitches[i];

            let turnProperties = checkTurn(previousSegDir, currentSegDir);
            if (!turnProperties.needsTurn){
                let rotated = 0.0;
                switch(currentSegDir){
                    case MVTDIR_UP:
                        rotated = 0;
                        break;
                    case MVTDIR_DOWN:
                        rotated = 180;
                        break;
                    case MVTDIR_LEFT:
                        rotated = 90;
                        break;
                    case MVTDIR_RIGHT:
                        rotated = -90;
                        break;
                }
                drawRotatedImg(
                    context,
                    snakeBodyUndulate1,
                    TO_RADIANS * rotated,
                    this.snakeSegments[i].x * settings.tileSize + 15,
                    this.snakeSegments[i].y * settings.tileSize + 15,
                    snakeBodyUndulate1.width / 2,
                    snakeBodyUndulate1.height / 2
                )
                continue
            }
            drawRotatedImg(
                context,
                snakeBodyTurn,
                turnProperties.angle * TO_RADIANS,
                this.snakeSegments[i].x * settings.tileSize + 15,
                this.snakeSegments[i].y * settings.tileSize + 15,
                snakeBodyTurn.width / 2,
                snakeBodyTurn.height / 2
            )
        }
    }
}

class Fruit{
    type;
    x;
    y;
    constructor(type, x, y){
        this.type = type;
        this.y = y;
        this.x = x;
    }

    draw(context){
        let posX = settings.tileSize * this.x;
        let posY = settings.tileSize * this.y;

        context.drawImage(
            this.type ? pear : apple,
            posX,
            posY
        )
    }
}

(function () {
    'use strict'

    let bg = new Image(300, 300);
    bg.src = "../assets/img/background.png"

    // Game state
    let canvas, ctx
    let snake
    let fruit
    let score = 0

    function loop() {
        requestAnimationFrame(loop)
        canvas = document.getElementById('game-canvas')
        if (!canvas) {
            console.error('Canvas not found')
            return
        }

        ctx = canvas.getContext('2d')

        // score = 0
        updateScore()
        // draw()
    }

    function updateScore() {
        const scoreEl = document.getElementById('score')
        if (scoreEl) scoreEl.textContent = String(score).padStart(3, score.toString())
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
             // head is lighter
            ctx.fillStyle = index === 0 ? '#9ef4c9' : '#41d17b'
            ctx.fillRect(x + 1, y + 1, settings.tileSize - 2, settings.tileSize - 2)
        })
        snake.draw(ctx);

        fruit.draw(ctx);
    }

    snake = new Snake(5, 5, MVTDIR_RIGHT, 5)

    function spawnFruit(){
        let spawnedFruit = Math.random();


        let posX = Math.random() * (settings.tileSize - 1);
        let posY = Math.random() * (settings.tileSize - 1);
        while (
            snake.snakeSegments.some((segment, index) => {return segment.x === posX && segment.y === posY })
            ){
            posX = Math.random() * (settings.tileSize - 1);
            posY = Math.random() * (settings.tileSize - 1);
        }

        let created = new Fruit(true, posX, posY);
        return created
    }

    fruit = spawnFruit()

    // Initialize on page load
    loop()
    window.onkeydown = (e) => {
        if (!started && e.code === "Space"){
            started = true;
            snake = new Snake(5, 5, MVTDIR_RIGHT, 5);
            loopHandle = setInterval(
                () => {
                    snake.move();
                    if (snake.snakeSegments[0].x === fruit.x && snake.snakeSegments[0].y === fruit.y){
                        score += 5 * (fruit.type ? 3 : 1);
                        fruit = spawnFruit();
                    }
                    updateScore();
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
