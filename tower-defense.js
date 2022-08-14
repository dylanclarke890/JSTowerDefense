const canvas = document.getElementById("play-area");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

/***********************************************************
 *              G L O B A L  V A R I A B L E S
 */

const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
let enemiesInterval = 600;
let currentFrame = 0;
let playerResources = 300;
let gameOver = false;

const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
};
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", () => {
  mouse.x = undefined;
  mouse.y = undefined;
});

/***********************************************************
 *              G A M E  B O A R D
 */

const controlsBar = {
  width: canvas.width,
  height: cellSize,
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }

  draw() {
    if (mouse.x && mouse.y && isColliding(this, mouse)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

(function createGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize)
    for (let x = 0; x < canvas.width; x += cellSize)
      gameGrid.push(new Cell(x, y));
})();

function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) gameGrid[i].draw();
}

/***********************************************************
 *              P R O J E C T I L E S
 */

/***********************************************************
 *              D E F E N D E R S
 */

class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.shooting = false;
    this.health = 100;
    this.projectiles = [];
    this.timer = 0;
  }

  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "gold";
    ctx.font = "20px Arial";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
}

canvas.addEventListener("click", () => {
  const gridX = mouse.x - (mouse.x % cellSize);
  const gridY = mouse.y - (mouse.y % cellSize);
  if (gridY < cellSize) return;
  if (defenders.some((def) => def.x === gridX && def.y === gridY)) return;
  let defenderCost = 100;
  if (defenderCost <= playerResources) {
    defenders.push(new Defender(gridX, gridY));
    playerResources -= defenderCost;
  }
});

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) defenders[i].draw();
}

/***********************************************************
 *              E N E M I E S
 */

class Enemy {
  constructor(positionY) {
    this.x = canvas.width;
    this.y = positionY;
    this.width = cellSize;
    this.height = cellSize;
    this.speed = Math.random() * 0.2 + 0.4;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
  }
  update() {
    this.x -= this.movement;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
  }
}

function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    enemy.update();
    enemy.draw();
    if (enemy.x < 0) gameOver = true;
  }
  if (currentFrame % enemiesInterval === 0) {
    let yPos = Math.floor(Math.random() * 5 + 1) * cellSize;
    enemies.push(new Enemy(yPos));
    enemyPositions.push(yPos);
    if (enemiesInterval > 100) enemiesInterval -= 25;
  }
}

/***********************************************************
 *              R E S O U R C E S
 */

/***********************************************************
 *              U T I L I T I E S
 */

function handleGameStatus() {
  ctx.fillStyle = "gold";
  ctx.font = "30px Arial";
  ctx.fillText(`Resources: ${playerResources}`, 50, 50);
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "90px Arial";
    ctx.fillText("GAME OVER", 125, 330);
  }
}

(function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
  handleGameGrid();
  handleDefenders();
  handleEnemies();
  handleGameStatus();
  currentFrame++;
  if (!gameOver) requestAnimationFrame(animate);
})();

function isColliding(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
  return false;
}
