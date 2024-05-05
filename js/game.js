// script.js
'use strict';

const MINE = '💣';
const EMPTY = '';
const FLAG = '🚩';

var gBoard;
var gLives;
var gSafeClicks;
var gGameStates; // Stack to store game states for Undo

// Initialize the game
function onInit() {
    gLives = 3;
    gSafeClicks = 3; // Initialize Safe-Clicks
    gGameStates = []; // Initialize game states stack
    const initialState = JSON.stringify(buildBoard()); // Save initial state
    gGameStates.push(initialState);
    gBoard = JSON.parse(initialState); // Deep copy initial state
    setRandomMines(gBoard, 2); // Set 2 random mines
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    renderLives();
    renderSafeClicks();
}

// Build the game board
function buildBoard() {
    const size = 4;
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                clickCount: 0 // Add click count for each cell
            };
        }
    }
    return board;
}

// Set random mines on the board
function setRandomMines(board, numOfMines) {
    const size = board.length;
    let minesCount = 0;
    while (minesCount < numOfMines) {
        const randomRow = Math.floor(Math.random() * size);
        const randomCol = Math.floor(Math.random() * size);
        if (!board[randomRow][randomCol].isMine) {
            board[randomRow][randomCol].isMine = true;
            minesCount++;
        }
    }
}

// Render the game board
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            const cell = board[i][j];
            const className = `cell cell-${i}-${j}`;
            if (cell.isShown) {
                if (cell.isMine) {
                    strHTML += `<td class="${className}">${MINE}</td>`;
                } else {
                    strHTML += `<td class="${className}">${cell.minesAroundCount}</td>`;
                }
            } else {
                if (cell.isMarked) {
                    strHTML += `<td class="${className}">${FLAG}</td>`;
                } else {
                    strHTML += `<td class="${className}">${EMPTY}</td>`;
                }
            }
        }
        strHTML += '</tr>';
    }
    const elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;

    // Add event listeners for left and right click
    elBoard.addEventListener('click', cellClicked);
    elBoard.addEventListener('contextmenu', cellRightClicked);
}

// Set mines negs count
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = countNeighbors(board, i, j);
            }
        }
    }
}

// Count neighbors
function countNeighbors(board, row, col) {
    var count = 0;
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < board.length && j >= 0 && j < board[i].length && !(i === row && j === col)) {
                if (board[i][j].isMine) count++;
            }
        }
    }
    return count;
}

// Handle right click on a cell
function cellRightClicked(event) {
    event.preventDefault();
    const cell = event.target;
    const classList = cell.classList;
    const coords = classList[1].split('-');
    const row = +coords[1];
    const col = +coords[2];
    const currCell = gBoard[row][col];
    if (!currCell.isShown) {
        currCell.isMarked = !currCell.isMarked;
        renderBoard(gBoard); // Render the board again to update the flag display
    }
}

// Handle left click on a cell
function cellClicked(event) {
    var cell = event.target;
    var cellCoords = getCellCoords(cell);
    var row = cellCoords.row;
    var col = cellCoords.col;
    var currCell = gBoard[row][col];
    if (currCell.isMine) {
        handleMineClick(currCell);
        return;
    }
    if (!currCell.isShown) {
        currCell.isShown = true;
        if (currCell.minesAroundCount === 0) {
            expandShown(row, col);
        }
    }
    saveGameState(); // Save game state before rendering
    renderBoard(gBoard);
    checkGameWin();
}

// Handle mine click
function handleMineClick(cell) {
    gLives--;
    cell.clickCount++; // Increment click count for this mine cell
    if (gLives === 0) {
        console.log('GAME OVER: You lost all your lives!');
        revealAllMines();
        setTimeout(onInit, 2000); // Restart the game after 2 seconds
    } else if (cell.clickCount === 3) {
        console.log('Mine exploded!');
        cell.isShown = true; // Show the mine cell after 3 clicks
        renderBoard(gBoard);
    } else {
        renderLives();
        console.log(`Oops! You clicked on a mine. Lives left: ${gLives}`);
    }
}

// Render the lives counter
function renderLives() {
    const elLives = document.querySelector('.lives');
    elLives.innerText = `Lives: ${gLives}`;
}

// Expand shown cells
function expandShown(row, col) {
    // Implementation for expanding shown cells (unchanged)
}

// Utility function to get cell coordinates
function getCellCoords(cell) {
    var classList = cell.classList;
    var coords = classList[1].split('-');
    return { row: +coords[1], col: +coords[2] };
}

// Check if all cells on the board are either shown or marked
function checkBoardFull(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const cell = board[i][j];
            if (!cell.isShown && !cell.isMarked) {
                return false; // If any cell is not shown or marked, return false
            }
        }
    }
    return true; // If all cells are shown or marked, return true
}


// Check if the game is won
function checkGameWin() {
    if (checkBoardFull(gBoard)) {
        console.log('WIN: Congratulations! You won the game!');
        alert('Congratulations! You won the game!'); // Display an alert to notify the user
        // You can also modify this to display a message on the page instead of using alert
        // Additional logic for winning the game can be added here
    }
}


// Reveal all mines when the game is lost
function revealAllMines() {
    // Implementation for revealing all mines (unchanged)
}

// Check if the game is lost
function checkGameLost() {
    // Implementation for checking game lost (unchanged)
}

// Additional helper functions can be added here if needed

// Use Safe-Click function
function useSafeClick() {
    if (gSafeClicks > 0) {
        const coveredCells = getCoveredCells(gBoard);
        if (coveredCells.length > 0) {
            const randomCellIndex = Math.floor(Math.random() * coveredCells.length);
            const randomCell = coveredCells[randomCellIndex];
            randomCell.isMarked = true;
            renderBoard(gBoard);
            gSafeClicks--;
            renderSafeClicks();
            setTimeout(unmarkCell, 2000, randomCell); // Unmark the cell after 2 seconds
        }
    }
}

// Get an array of covered cells
function getCoveredCells(board) {
    const coveredCells = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const cell = board[i][j];
            if (!cell.isShown && !cell.isMarked) {
                coveredCells.push(cell);
            }
        }
    }
    return coveredCells;
}

// Unmark a cell
function unmarkCell(cell) {
    cell.isMarked = false;
    renderBoard(gBoard);
}

// Save current game state
function saveGameState() {
    const currentState = JSON.stringify(gBoard);
    gGameStates.push(currentState);
}

// Undo last move
function undoMove() {
    if (gGameStates.length > 1) { // Ensure there's a state to undo to
        gGameStates.pop(); // Remove current state
        const prevState = gGameStates[gGameStates.length - 1]; // Get previous state
        gBoard = JSON.parse(prevState); // Restore previous state
        renderBoard(gBoard); // Render the board
    }
}
