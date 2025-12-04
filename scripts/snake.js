//Define HTML elements
const canvas = document.getElementById('container');

console.log(canvas)

//Define game variables
let snake = [{x: 10, y: 10}];

//Draw game map, snake, food

function draw () {
    canvas.innerHTML = '';
    drawSnake();
}

//Draw Snake
function drawSnake() {
    snake.forEach((segment) => {
        const snakeElement = createGameElement('div' , 'snake');
    });
}