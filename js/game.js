var gameArea = document.getElementById("gameArea")
gameArea.style = "border:1px solid #000000;";
gameArea.width = 1500;
gameArea.height = 700;

var points = document.createTextNode(0);
document.getElementById("points").appendChild(points);

var context = gameArea.getContext("2d");
document.getElementById("content").appendChild(gameArea);

var elemWidth = 20;
var elemHeight = 20;

var snake = null;
var apples = {};

var updateInterval;

var turnDone = false;



document.addEventListener("keyup", function(event) {
    processInput(event.keyCode);
});



class Cell{
    constructor(x, y, width, height, color){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.colorCell(this.color);
    }
    
    colorCell(color){
        context.fillStyle = color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    
    clearCell(){
        context.clearRect(this.x, this.y, this.width, this.height);
    }
}


class Apple extends Cell{
    constructor(x, y, width, height, color, points){
        super(x, y, width, height, color);
        this.points = points;
    }
    
    hitApple(x, y){
        if (this.x === x && this.y === y){
            points.textContent = parseInt(points.textContent) + this.points;
            delete apples[[x, y]];
            delete this;
            return true;
        } else {
            return false;
        }
    }
}


class Snake{
    constructor(color){
        this.color = color;
        this.direction = "east";
        
        this.head = new Cell(elemWidth*2, elemHeight*2, elemWidth, elemHeight, this.color);
        this.body = [this.head];       
    }
    
    insertNewHead(x, y){
        let newHead = new Cell(x, y, elemWidth, elemHeight, this.color);
        this.head = newHead;
        this.body.unshift(newHead);
    }
    
    popTail(){
        this.body[this.body.length-1].clearCell();
        delete this.body[this.body.length-1];
        this.body.pop();
    }
    
    isCellTaken(x, y){
        let cell = this.body.slice(1).find(elem => elem.x === x && elem.y === y);
        return (typeof cell !== 'undefined');
    }
}



function processInput(keyCode){
    if (turnDone)
        return;
    
    turnDone = true;
    switch(keyCode){
        case 37:
            if (snake.direction !== "east")
                snake.direction = "west";
            break;
        case 38:
            if (snake.direction !== "south")
                snake.direction = "north";
            break;
        case 39:
            if (snake.direction !== "west")
                snake.direction = "east";
            break;
        case 40:
            if (snake.direction !== "north")
                snake.direction = "south";
            break;
    }
}


function update(){
    turnDone = false;
    let changeX = 0;
    let changeY = 0;
    switch(snake.direction){
        case "north":
            changeY = -elemHeight;
            break;
        case "east":
            changeX = elemWidth;
            break;
        case "south":
            changeY = elemHeight;
            break;
        case "west":
            changeX = -elemWidth;
            break;
    }
    
    snake.insertNewHead(snake.head.x+changeX, snake.head.y+changeY);
    
    if (snake.head.x >= gameArea.width || snake.head.x < 0 
            || snake.head.y >= gameArea.height || snake.head.y < 0
            || snake.isCellTaken(snake.head.x, snake.head.y)){
       clearInterval(updateInterval);
       return;
    }
    
    manageApples();
    
    for (let apple of Object.values(apples)){
        if (apple.hitApple(snake.head.x, snake.head.y)){
            return;
        }
    }
    
    snake.popTail();
}


function manageApples(){
    if (Math.random() >= 0.03 || Object.values(apples).length > 1){
        return;
    }
    
    setApple();
    function setApple(){
        let x = (Math.floor(Math.random() * (gameArea.width/elemWidth))*elemWidth);
        let y = (Math.floor(Math.random() * (gameArea.height/elemHeight))*elemHeight);
        
        if (!snake.isCellTaken(x, y) 
                && snake.head.x !== x && snake.head.y !== y
                && !apples.hasOwnProperty([x, y])){
            apples[[x, y]] = (new Apple(x, y, elemWidth, elemHeight, "red", 1));
        } else {
            setApple();
        }
    }
}



function setUp(){
    snake = new Snake("blue");
    updateInterval = setInterval(update, 80);
}


setUp();