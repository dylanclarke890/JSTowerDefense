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
const projectiles = [];
const enemyPositions = [];
let enemiesInterval = 600;
let currentFrame = 0;
const resources = [];
let playerResources = 300;
let score = 0;
const winningScore = 50;
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

class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.power = 20;
    this.speed = 5;
  }

  update() {
    this.x += this.speed;
  }

  draw() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
  }
}

function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();

    for (let j = 0; j < enemies.length; j++) {
      if (
        enemies[j] &&
        projectiles[i] &&
        isColliding(projectiles[i], enemies[j])
      ) {
        enemies[j].health -= projectiles[i].power;
        projectiles.splice(i, 1);
        i--;
      }
    }

    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

/***********************************************************
 *              D E F E N D E R S
 */

class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.shooting = false;
    this.health = 100;
    this.timer = 0;
  }

  update() {
    if (this.shooting) {
      this.timer++;
      if (this.timer % 100 === 0) {
        projectiles.push(new Projectile(this.x + 70, this.y + 50));
      }
    } else this.timer = 0;
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
  const gridX = mouse.x - (mouse.x % cellSize) + cellGap;
  const gridY = mouse.y - (mouse.y % cellSize) + cellGap;
  if (gridY < cellSize) return;
  if (defenders.some((def) => def.x === gridX && def.y === gridY)) return;
  let defenderCost = 100;
  if (defenderCost <= playerResources) {
    defenders.push(new Defender(gridX, gridY));
    playerResources -= defenderCost;
  }
});

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].update();
    defenders[i].draw();
    if (enemyPositions.indexOf(defenders[i].y) !== -1) {
      defenders[i].shooting = true;
    } else {
      defenders[i].shooting = false;
    }
    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && isColliding(defenders[i], enemies[j])) {
        enemies[j].movement = 0;
        defenders[i].health -= 0.5;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
}

/***********************************************************
 *              E N E M I E S
 */

class Enemy {
  constructor(positionY) {
    this.x = canvas.width;
    this.y = positionY;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.speed = Math.random() * 0.8 + 0.4;
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
    enemies[i].update();
    enemies[i].draw();
    if (enemies[i] && enemies[i].x < 0) gameOver = true;
    if (enemies[i] && enemies[i].health <= 0) {
      const resourcesGained = enemies[i].maxHealth / 10;
      playerResources += resourcesGained;
      score += resourcesGained;
      enemyPositions.splice(enemyPositions.indexOf(enemies[i].y), 1);
      enemies.splice(i, 1);
      i--;
    }
  }
  if (currentFrame % enemiesInterval === 0 && score < winningScore) {
    let yPos = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
    enemyPositions.push(yPos);
    enemies.push(new Enemy(yPos));
    if (enemiesInterval > 100) enemiesInterval -= 25;
  }
}

/***********************************************************
 *              R E S O U R C E S
 */

const amounts = [20, 30, 40];

class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = (Math.floor(Math.random() * 5) + 1) * (cellSize + 25);
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(this.amount, this.x + 15, this.y + 25);
  }
}

function handleResources() {
  if (currentFrame % 500 === 0 && score < winningScore) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw();
    if (
      resources[i] &&
      mouse.x &&
      mouse.y &&
      isColliding(resources[i], mouse)
    ) {
      playerResources += resources[i].amount;
      resources.splice(i, 1);
      i--;
    }
  }
}

/***********************************************************
 *              U T I L I T I E S
 */

function handleGameStatus() {
  ctx.fillStyle = "gold";
  ctx.font = "30px Arial";
  ctx.fillText(`Score: ${score}`, 20, 40);
  ctx.fillText(`Resources: ${playerResources}`, 20, 80);
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "90px Arial";
    ctx.fillText("GAME OVER", 125, 330);
  }
  if (score >= winningScore && enemies.length === 0) {
    ctx.fillStyle = "black";
    ctx.font = "60px Arial";
    ctx.fillText("LEVEL COMPLETE", 130, 300);
    ctx.font = "30px Arial";
    ctx.fillText(`You win with ${score} points!`, 134, 340);
  }
}

(function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
  handleGameGrid();
  handleDefenders();
  handleResources();
  handleProjectiles();
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

window.addEventListener("resize", () => {
  canvasPosition = canvas.getBoundingClientRect();
});
