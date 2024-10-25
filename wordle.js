var height = 6;
var width = 5;
var row = 0;
var col = 0;
var gameOver = false;
var word = "";
var apiUrl = "https://random-word-api.herokuapp.com/word?number=1&length=5";


var score = 0;
var timeElapsed = 0;
var timerInterval;

async function fetchWord() {
    try {
        let response = await fetch(apiUrl);
        let data = await response.json();
        word = data[0].toUpperCase();
        console.log(word);
    } catch (error) {
        console.error("Error al obtener la palabra:", error);
        word = "ERROR";
    }
}

window.onload = function () {
    fetchWord().then(() => {
        initialize();
        startTimer();
    });
}

function initialize() {
    // Crear el tablero
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            let tile = document.createElement("span");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.innerText = "";
            document.getElementById("board").appendChild(tile);
        }
    }

    // Crear el teclado
    let keyboard = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
        ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
    ];

    for (let i = 0; i < keyboard.length; i++) {
        let currRow = keyboard[i];
        let keyboardRow = document.createElement("div");
        keyboardRow.classList.add("keyboard-row");

        for (let j = 0; j < currRow.length; j++) {
            let keyTile = document.createElement("div");
            let key = currRow[j];
            keyTile.innerText = key;
            keyTile.id = key === "Enter" ? "Enter" : (key === "⌫" ? "Backspace" : "Key" + key);
            keyTile.addEventListener("click", processKey);
            keyTile.classList.add(key === "Enter" ? "enter-key-tile" : "key-tile");
            keyboardRow.appendChild(keyTile);
        }
        document.body.appendChild(keyboardRow);
    }

    document.addEventListener("keyup", processInput);
}

function processKey() {
    let e = { "code": this.id };
    processInput(e);
}

function processInput(e) {
    if (gameOver) return;

    if (e.code.startsWith("Key") && col < width) {
        let currTile = document.getElementById(row.toString() + '-' + col.toString());
        if (currTile.innerText === "") {
            currTile.innerText = e.code[3];
            col++;
        }
    } else if (e.code === "Backspace" && col > 0) {
        col--;
        let currTile = document.getElementById(row.toString() + '-' + col.toString());
        currTile.innerText = "";
    } else if (e.code === "Enter") {
        if (col === width) {
            update();
        }
    }

    if (!gameOver && row === height) {
        gameOver = true;
        document.getElementById("answer").innerText = word;
        stopTimer();
        setTimeout(resetGame, 3000);
    }
}

function update() {
    let guess = "";
    document.getElementById("answer").innerText = "";

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;
        guess += letter;
    }

    if (guess.length !== width) return;

    guess = guess.toUpperCase();

    let correct = 0;
    let letterCount = {};

    for (let i = 0; i < word.length; i++) {
        let letter = word[i];
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        if (word[c] === letter) {
            currTile.classList.add("correct");
            letterCount[letter]--;
            correct++;
        }
    }

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        if (!currTile.classList.contains("correct")) {
            if (word.includes(letter) && letterCount[letter] > 0) {
                currTile.classList.add("present");
                letterCount[letter]--;
            } else {
                currTile.classList.add("absent");
            }
        }
    }

    row++;
    col = 0;

    if (correct === width) {
        gameOver = true;
        score++;
        document.getElementById("score").innerText = "Puntuación: " + score;
        document.getElementById("answer").innerText = "¡Ganaste!";
        stopTimer();
        setTimeout(resetGame, 3000);
    } else if (row === height) {
        gameOver = true;
        document.getElementById("answer").innerText = word;
        stopTimer();
        setTimeout(resetGame, 3000);
    }
}

function resetGame() {
    row = 0;
    col = 0;
    gameOver = false;
    timeElapsed = 0;
    document.getElementById("answer").innerText = "";
    document.getElementById("timer").innerText = "Tiempo: 0s";

    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            let currTile = document.getElementById(r.toString() + '-' + c.toString());
            currTile.innerText = "";
            currTile.classList.remove("correct", "present", "absent");
        }
    }

    fetchWord().then(() => {
        startTimer();
        console.log("Nuevo juego iniciado con la palabra: ", word);
    });
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeElapsed++;
        document.getElementById("timer").innerText = "Tiempo: " + timeElapsed + "s";
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}
