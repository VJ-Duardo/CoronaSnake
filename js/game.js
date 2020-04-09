var gameArea = document.getElementById("gameArea");
gameArea.width = 1440;
gameArea.height = 720;

var points = document.getElementById("cases");
points.innerHTML = 0;

var day = document.getElementById("day");
day.innerHTML = "-";

var context = gameArea.getContext("2d");
document.getElementById("content").appendChild(gameArea);

var startScreen = document.getElementById("start");
var startButton = document.getElementById("startButton");
var loadingMessage = document.getElementById("loading");
var gameOverScreen = document.getElementById("gameOver");


var elemWidth = 6;
var elemHeight = 6;

var dates;
var currentDayIndex = 0;

var snake = null;
var apples;

var updateInterval;

var turnDone = false;


getData()
    .then((days) => {
        loadingMessage.style.display = "none";
        startButton.style.display = "block";
        dates = days;
});


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
            points.innerHTML = parseInt(points.innerHTML) + this.points;
            delete apples[[x, y]];
            delete this;
            return true;
        } else {
            return false;
        }
    }
    
    colorCell(color){
        context.beginPath();
        context.arc(this.x+(elemWidth/2), this.y+(elemHeight/2), Math.floor(this.width/2), 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 0.1;
        context.stroke();
    }
}


class Snake{
    constructor(headColor){
        this.bodyColor = {
            color: [0, 0, 0],
            currIndex: 1,
            end: 255,
            step: 1
        };
        this.headColor = headColor;
        this.direction = "east";
        
        this.head = new Cell(gameArea.width/2, gameArea.height/2, elemWidth, elemHeight, this.headColor);
        this.body = [this.head];       
    }
    
    getNextColor(){
        let colorObj = this.bodyColor;
        if (colorObj.color[colorObj.currIndex] === colorObj.end){
            colorObj.currIndex = Math.floor(Math.random() * colorObj.color.length);
            colorObj.end = (colorObj.color[colorObj.currIndex] === 0) ? 255 : 0;
            colorObj.step = (colorObj.color[colorObj.currIndex] === 0) ? 1 : -1;
        } else {
            colorObj.color[colorObj.currIndex]+= colorObj.step;
        }
        
        let resultColor = '#';
        colorObj.color.map(function(colVal){
            let colHex = colVal.toString(16);
            resultColor += (colHex.length < 2) ? '0'+colHex : colHex;
        });
        return resultColor;
    }
    
    insertNewHead(x, y){
        this.head.colorCell(this.getNextColor());
        let newHead = new Cell(x, y, elemWidth, elemHeight, this.headColor);
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
       gameOver();
       return;
    }
    
    if (Object.values(apples).length <= 0){
        setUpRound();
    }
    
    let found = false;
    for (let apple of Object.values(apples)){
        for (let bodyPart of snake.body){
            if (apple.hitApple(bodyPart.x, bodyPart.y)){
                found = true;
            }
        }
    }
    
    if (!found)
        snake.popTail();
}



function manageCasePoints(lat, long, cases){
    let x = Math.round((Math.abs(-180-long)*(gameArea.width/360))/elemWidth)*elemWidth;
    let y = Math.round(((90-lat)*(gameArea.height/180))/elemHeight)*elemHeight;
    
    apples[[x, y]] = (new Apple(x, y, elemWidth, elemHeight, "red", cases));
}



function setUpRound(){
    if (currentDayIndex >= dates.length){
        console.log("you won");
        clearInterval(updateInterval);
        return;
    } else {
        currentDayIndex++;
    }
    day.innerHTML = dates[currentDayIndex];
    let locations = getLocationsFromDay(dates[currentDayIndex]);
    locations.forEach(function(location){
        manageCasePoints(location.lat, location.long, location.cases[dates[currentDayIndex]]);
    });
}



function gameOver(){
    gameOverScreen.style.display = "block";
    clearInterval(updateInterval);
}



function setUpGame(){
    clearInterval(updateInterval);
    context.clearRect(0, 0, gameArea.width, gameArea.height);
    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";
    points.innerHTML = 0;
    day.innerHTML = "-";
    currentDayIndex = 0;
    apples = {};
    snake = new Snake("yellow");
    updateInterval = setInterval(update, 50);
}