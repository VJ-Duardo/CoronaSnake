var fieldWidth;
var fieldHeight;
var dates;
var currentDayIndex;
var apples;
var snake;
        
var elemWidth = 6;
var elemHeight = 6;

var turnDone = false;
var updateInterval;

var gui;



class Cell{
    constructor(x, y, width, height, color){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    
    drawCell(){
        gui.drawRect(this.x, this.y, this.width, this.height, this.color);
    }
}


class Apple extends Cell{
    constructor(x, y, width, height, color, points){
        super(x, y, width, height, color);
        this.points = points;
    }
    
    hitApple(cellsArray){
        let hitCell = cellsArray.find((cell) => cell.x === this.x && cell.y === this.y);
        if (typeof hitCell !== 'undefined'){
            gui.addCases(this.points);
            delete apples[[hitCell.x, hitCell.y]];
            delete this;
            return true;
        } else {
            return false;
        }
    }
    
    drawCell(){
         gui.drawCircle(this.x+(elemWidth/2), this.y+(elemHeight/2), Math.floor(this.width/2), this.color);
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
        
        this.head = new Cell(fieldWidth/2, fieldHeight/2, elemWidth, elemHeight, this.headColor);
        this.body = [this.head];       
    }
    
    drawSnake(){
        for (const cell of this.body){
            cell.drawCell();
        }
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
        this.head.color = this.getNextColor();
        let newHead = new Cell(x, y, elemWidth, elemHeight, this.headColor);
        this.head = newHead;
        this.body.unshift(newHead);
    }
    
    popTail(){
        delete this.body[this.body.length-1];
        this.body.pop();
    }
    
    isCellTaken(x, y){
        let cell = this.body.slice(1).find(elem => elem.x === x && elem.y === y);
        return (typeof cell !== 'undefined');
    }
    
    isOutOfBounds(x, y){
        return (this.head.x >= x || this.head.x < 0 
            || this.head.y >= y || this.head.y < 0);
    }
}


class GUI{
    constructor(showGameOver, setDate, addCases, setCases, drawCircle, drawRect, clearField, showGameWon){
        this.showGameOver = showGameOver;
        this.setDate = setDate;
        this.addCases = addCases;
        this.setCases = setCases;
        this.drawCircle = drawCircle;
        this.drawRect = drawRect;
        this.clearField = clearField;
        this.showGameWon = showGameWon;
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
    
    if (checkGameOver()){
       gameOver();
       return;
    }
    
    gui.clearField(0, 0, fieldWidth, fieldHeight);
    
    if (Object.values(apples).length <= 0){
        setUpRound();
    }
    
    let found = false;
    for (let apple of Object.values(apples)){
        if (apple.hitApple(snake.body)){
            found = true;
        } else {
            apple.drawCell();
        }
    }
    
    if (!found)
        snake.popTail();
    
    snake.drawSnake();
}



function createCasePoints(lat, long, cases){
    if (isNaN(lat) || isNaN(long))
        return;
    let x = Math.round((Math.abs(-180-long)*(fieldWidth/360))/elemWidth)*elemWidth;
    let y = Math.round(((90-lat)*(fieldHeight/180))/elemHeight)*elemHeight;
    
    if (apples.hasOwnProperty([x, y])){
        apples[[x, y]].points+= cases; 
    } else {
        apples[[x, y]] = (new Apple(x, y, elemWidth, elemHeight, "red", cases)); 
    }
}



function setUpRound(){
    if (currentDayIndex >= dates.length){
        clearInterval(updateInterval);
        gui.showGameWon();
        return;
    }
    if (currentDayIndex === 0){
        gui.setCases(0); 
    } else {
        gui.setCases(getCaseNumberAtDate(dates[currentDayIndex-1]));
    }
    gui.setDate(dates[currentDayIndex]);
    let locations = getLocationsFromDay(dates[currentDayIndex]);
    locations.forEach(function(location){
        createCasePoints(location.lat, location.long, location.cases[dates[currentDayIndex]].difference);
    });
    currentDayIndex++;
}



function checkGameOver(){
    return (snake.isOutOfBounds(fieldWidth, fieldHeight)
            || snake.isCellTaken(snake.head.x, snake.head.y));
}


function gameOver(){
    gui.showGameOver();
    clearInterval(updateInterval);
}



function setUpGame(width, height, dayIndex, dateStrings){
    fieldWidth = width;
    fieldHeight = height;
    dates = dateStrings;
    currentDayIndex = dates.findIndex((date) => date === dayIndex);
    apples = {};
    snake = new Snake("yellow");
    updateInterval = setInterval(update, 50);
}


function setGUIInterfaces(showGameOver, setDate, addCases, setCases, drawCircle, drawRect, clearField, showGameWon){
   gui = new GUI(showGameOver, setDate, addCases, setCases, drawCircle, drawRect, clearField, showGameWon);
}