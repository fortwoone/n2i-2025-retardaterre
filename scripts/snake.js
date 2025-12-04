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
        setPosition(snakeElement, segment);
        canvas.appendChild(snakeElement);
    });
}

//Create game element (snake and food)

function createGameElement(tag, className) {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

//Set the position of game elements
function setPosition(element, position) {
    element.style.gridColumn = position.x;
    element.style.gridRow = position.y;

}

//test
draw();