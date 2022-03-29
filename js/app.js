const WALL = "WALL";
const FLOOR = "FLOOR";
const BALL = "BALL";
const GAMER = "GAMER";
const GLUE = "GLUE";

const GAMER_IMG = '<img src="img/gamer.png" />';
const BALL_IMG = '<img src="img/ball.png" />';
const GLUE_IMG =
  '<img class = "glue" src="img/glue1.png" style = "width : 45px"/>';

var gBoard;
var gGamerPos;
var gEmptyPos;
var gIntervalBall;
var gIntervalGlue;
var gBallCollected;
var gBalls;
var gIsGlued;

function initGame() {
  gBallCollected = 0;
  gBalls = 0;
  gGamerPos = { i: 2, j: 9 };
  gBoard = buildBoard();
  gEmptyPos = buildarrEmptyPos();
  renderBoard(gBoard);
}
function restartGame() {
  initGame();
  gIsGlued = false;
  hide(".playGame");
  hide(".restart");
  hide(".text1");
  hide(".text2");
  gIntervalBall = setInterval(addBallToRandomCell, 5000);
  gIntervalGlue = setInterval(addglueToRandomCell, 3000);
}
function addBallToRandomCell() {
  if (!gEmptyPos.length) return;
  var idx = getRandomInt(0, gEmptyPos.length);
  var coordCell = gEmptyPos[idx];
  gEmptyPos.splice(idx, 1);

  gBoard[coordCell.i][coordCell.j].gameElement = BALL;
  renderCell(coordCell, BALL_IMG);
  gBalls++;
}
function addglueToRandomCell() {
  if (!gEmptyPos.length) return;
  var idx = getRandomInt(0, gEmptyPos.length - 1);
  var coordCell = gEmptyPos[idx];
  gEmptyPos.splice(idx, 1);
  gBoard[coordCell.i][coordCell.j].gameElement = GLUE;
  renderCell(coordCell, GLUE_IMG);
  setTimeout(clearGlue, 3000, coordCell);
}
function clearGlue(coordCell) {
  if (gBoard[coordCell.i][coordCell.j].gameElement !== GAMER) {
    gBoard[coordCell.i][coordCell.j].gameElement = null;
    renderCell(coordCell, "");
  }
}

function buildBoard() {
  // Create the Matrix
  var board = createMat(11, 11);

  // Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      // Put FLOOR in a regular cell
      var cell = { type: FLOOR, gameElement: null };

      // Place Walls at edges
      if (
        i === 0 ||
        i === board.length - 1 ||
        j === 0 ||
        j === board[0].length - 1
      ) {
        cell.type = WALL;
      }

      // Add created cell to The game board
      board[i][j] = cell;
    }
  }
  board[0][5].type = FLOOR;
  board[board.length - 1][5].type = FLOOR;
  board[5][0].type = FLOOR;
  board[5][board[0].length - 1].type = FLOOR;

  // Place the gamer at selected position
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

  // Place the Balls (currently randomly chosen positions)
  board[3][8].gameElement = BALL;
  gBalls++;
  board[7][4].gameElement = BALL;
  gBalls++;

  return board;
}
function buildarrEmptyPos() {
  var res = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].type === FLOOR && gBoard[i][j].gameElement === null) {
        res.push({ i: i, j: j });
      }
    }
  }
  return res;
}
function chackVictory() {
  if (gBalls === gBallCollected) Victory();
}
// Render the board to an HTML table
function renderBoard(board) {
  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j });

      cellClass += currCell.type === FLOOR ? " floor" : " wall";

      strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">\n`;

      // TODO - change to switch case statement
      if (currCell.gameElement === GAMER) strHTML += GAMER_IMG;
      else if (currCell.gameElement === BALL) strHTML += BALL_IMG;

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }

  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
  console.log("object :>> ", gIsGlued);
  if (gIsGlued === true || gIsGlued === undefined) return;
  if (i === -1) i = gBoard.length - 1;
  else if (i === gBoard.length) i = 0;
  else if (j === -1) j = gBoard[0].length - 1;
  else if (j === gBoard[0].length) j = 0;

  var targetCell = gBoard[i][j];
  if (targetCell.type === WALL) return;

  // Calculate distance to make sure we are moving to a neighbor cell
  var iAbsDiff = Math.abs(i - gGamerPos.i);
  var jAbsDiff = Math.abs(j - gGamerPos.j);

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) ||
    iAbsDiff === gBoard.length - 1 ||
    jAbsDiff === gBoard[0].length - 1
  ) {
    if (targetCell.gameElement === BALL) {
      console.log("Collecting!");
      playSound();
      gBallCollected++;
      if (gBallCollected === 1) show(".text1");

      document.querySelector("span").innerText = gBallCollected;
      chackVictory();
    } else if (targetCell.gameElement === GLUE) {
      gIsGlued = true;

      setTimeout(function () {
        gIsGlued = false;
      }, 3000);
    }

    // MOVING from current position
    // Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // update from gEmptyPos
    gEmptyPos.push({ i: gGamerPos.i, j: gGamerPos.j });

    // Dom:
    renderCell(gGamerPos, "");

    // MOVING to selected position
    // Model:
    gGamerPos.i = i;
    gGamerPos.j = j;
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

    const index = gEmptyPos.findIndex(
      (x) => x.i === gGamerPos.i && x.j === gGamerPos.j
    );
    if (index > -1) {
      gEmptyPos.splice(index, 1);
      //   console.log(gEmptyPos);
    }
    // DOM:
    renderCell(gGamerPos, GAMER_IMG);
  } // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

function playSound() {
  var sound = new Audio("sound/s.wav");
  sound.play();
}
function Victory() {
  clearInterval(gIntervalGlue);
  clearInterval(gIntervalBall);
  show(".text2");
  show(".restart");
  gIsGlued = true;
}
// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  var cellSelector = "." + getClassName(location);
  var elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
  var i = gGamerPos.i;
  var j = gGamerPos.j;

  switch (event.key) {
    case "ArrowLeft":
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
      moveTo(i + 1, j);
      break;
  }
}

// Returns the class name for a specific cell
function getClassName(location) {
  var cellClass = "cell-" + location.i + "-" + location.j;
  return cellClass;
}
function hide(selector) {
  document.querySelector(selector).classList.add("hide");
}
function show(selector) {
  document.querySelector(selector).classList.remove("hide");
}
