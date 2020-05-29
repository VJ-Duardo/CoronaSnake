var gameArea = document.getElementById("gameArea");
gameArea.width = 1440;
gameArea.height = 720;

var context = gameArea.getContext("2d");
document.getElementById("content").appendChild(gameArea);


var caseDisplay = document.getElementById("cases");
caseDisplay.innerHTML = 0;

var dayDisplay = document.getElementById("day");
dayDisplay.innerHTML = "-";

var overlay = document.getElementById("overlay");
var startButton = document.getElementById("startButton");
var loadingMessage = document.getElementById("loading");
var gameOverScreen = document.getElementById("gameOver");
var winMessage = document.getElementById("winMessage");

var daySelection = document.getElementById("daySelection");

var dateStrings;



document.addEventListener("keydown", function(event) {
    processInput(event.key);
});


getData()
    .then((days) => {
        loadingMessage.style.display = "none";
        startButton.style.display = "block";
        dateStrings = days;
        dateStrings.forEach(function(date) {
            let opt = document.createElement('option');
            opt.innerHTML = date;
            opt.value = date;
            daySelection.appendChild(opt);
    });
});


function start(){
    setUpGUI();
    setUpGame(gameArea.width, gameArea.height, daySelection.value, dateStrings);
}


function setUpGUI(){
    context.clearRect(0, 0, gameArea.width, gameArea.height);
    startButton.style.display = "none";
    winMessage.style.display = "none";
    overlay.style.display = "none";
    gameOverScreen.style.display = "none";
    caseDisplay.innerHTML = 0;
    dayDisplay.innerHTML = "-";
}



var showGameOver = function(){
    overlay.style.display = "block";
    gameOverScreen.style.display = "block";
};

var showGameWon = function(){
    overlay.style.display = "block";
    startButton.style.display = "block";
    winMessage.style.display = "block";
}

var setDate = function(day){
    dayDisplay.innerHTML = day;
};

var addCases = function(cases){
    caseDisplay.innerHTML = parseInt(caseDisplay.innerHTML) + cases;
};

var setCases = function(cases){
    caseDisplay.innerHTML = cases;
};

var drawCircle = function(x, y, r, color){
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 0.1;
    context.stroke();
};

var drawRect = function(x, y, width, height, color){
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
};

var clearRectCell = function(x, y, width, height){
    context.clearRect(x, y, width, height);
};

setGUIInterfaces(showGameOver, setDate, addCases, setCases, drawCircle, drawRect, clearRectCell, showGameWon);