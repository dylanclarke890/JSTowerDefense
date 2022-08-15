const canvas = document.getElementById("play-area");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

/***********************************************************
 *              G L O B A L  V A R I A B L E S
 */

const player = {
  projectiles: [],
  resources: 300,
  score: 0,
  selectedUnit: 0, // the index of the unit type to place next.
  units: [],
};

const enemy = {
  frequency: 600, // how often in frames to spawn a new enemy
  positions: [],
  units: [],
};

const gameState = {
  frame: 0,
  messages: [],
  over: false,
  pickups: [],
  winningScore: 50,
};

const board = {
  cell: {
    gap: 3,
    size: 100,
  },
  grid: [],
};

const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
  clicked: false,
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
canvas.addEventListener("mousedown", () => {
  mouse.clicked = true;
});
canvas.addEventListener("mouseup", () => {
  mouse.clicked = false;
});

/***********************************************************
 *              G A M E  B O A R D
 */

const controlsBar = {
  width: canvas.width,
  height: board.cell.size,
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = board.cell.size;
    this.height = board.cell.size;
  }

  draw() {
    if (mouse.x && mouse.y && isColliding(this, mouse)) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

(function createGrid() {
  for (let y = board.cell.size; y < canvas.height; y += board.cell.size)
    for (let x = 0; x < canvas.width; x += board.cell.size)
      board.grid.push(new Cell(x, y));
})();

function handleGameGrid() {
  for (let i = 0; i < board.grid.length; i++) board.grid[i].draw();
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
  for (let i = 0; i < player.projectiles.length; i++) {
    player.projectiles[i].update();
    player.projectiles[i].draw();

    for (let j = 0; j < enemy.units.length; j++) {
      if (
        enemy.units[j] &&
        player.projectiles[i] &&
        isColliding(player.projectiles[i], enemy.units[j])
      ) {
        enemy.units[j].health -= player.projectiles[i].power;
        player.projectiles.splice(i, 1);
        i--;
      }
    }

    if (
      player.projectiles[i] &&
      player.projectiles[i].x > canvas.width - board.cell.size
    ) {
      player.projectiles.splice(i, 1);
      i--;
    }
  }
}

/***********************************************************
 *              B A S E  C L A S S E S
 */

class BaseUnit {
  constructor(
    x,
    y,
    width,
    height,
    health,
    minFrame,
    maxFrame,
    spriteWidth,
    spriteHeight
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.health = health;
    this.maxHealth = health;
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = minFrame;
    this.maxFrame = maxFrame;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
  }

  get unitHealth() {
    return Math.floor(this.health);
  }
}

/***********************************************************
 *              D E F E N D E R S
 */

const plant = new Image();
plant.src = "sprites/plant.png";
const defenderTypes = [
  {
    x: 10,
    y: 10,
    width: 70,
    height: 85,
    image: plant,
  },
  {
    x: 90,
    y: 10,
    width: 70,
    height: 85,
    image: plant,
  },
];
const idleUnitStroke = "black";
const selectedUnitStroke = "gold";

class Defender extends BaseUnit {
  constructor(x, y) {
    const width = board.cell.size - board.cell.gap * 2;
    const height = board.cell.size - board.cell.gap * 2;
    super(x, y, width, height, 100, 0, 1, 167, 256);
    this.shooting = false;
    this.shootNow = false;
    this.timer = 0;
    this.typeIndex = player.selectedUnit;
  }

  update() {
    if (gameState.frame % 8 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
      if (this.frameX === 1) this.shootNow = true;
    }
    if (this.shooting && this.shootNow) {
      player.projectiles.push(new Projectile(this.x + 70, this.y + 50));
      this.shootNow = false;
    }
  }

  draw() {
    // ctx.fillStyle = "blue";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      defenderTypes[this.typeIndex].image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    ctx.fillStyle = "gold";
    ctx.font = "20px Arial";
    ctx.fillText(this.unitHealth, this.x + 15, this.y + 30);
  }
}

function handleDefenders() {
  for (let i = 0; i < player.units.length; i++) {
    player.units[i].update();
    player.units[i].draw();
    if (enemy.positions.indexOf(player.units[i].y) !== -1) {
      player.units[i].shooting = true;
    } else {
      player.units[i].shooting = false;
    }
    for (let j = 0; j < enemy.units.length; j++) {
      if (player.units[i] && isColliding(player.units[i], enemy.units[j])) {
        enemy.units[j].movement = 0;
        player.units[i].health -= 0.5;
      }
      if (player.units[i] && player.units[i].health <= 0) {
        player.units.splice(i, 1);
        i--;
        enemy.units[j].movement = enemy.units[j].speed;
      }
    }
  }
}

function chooseDefender() {
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  let currentX = 20;
  let currentY = 15;
  defenderTypes.forEach((uc, i) => {
    ctx.drawImage(
      uc.image,
      0,
      0,
      167,
      256,
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (isColliding(mouse, uc) && mouse.clicked) player.selectedUnit = i;
    ctx.fillRect(uc.x, uc.y, uc.width, uc.height);
    ctx.drawImage(uc.image, 0, 0, 167, 256, currentX, currentY, 50, 80);
    ctx.strokeStyle =
      player.selectedUnit === i ? selectedUnitStroke : idleUnitStroke;
    ctx.strokeRect(uc.x, uc.y, uc.width, uc.height);
    currentX += 80;
  });
}

/***********************************************************
 *              E N E M I E S
 */
const zombie = new Image();
zombie.src = "sprites/zombie.png";
const enemyTypes = [zombie];

class Enemy extends BaseUnit {
  constructor(yPos) {
    const width = board.cell.size - board.cell.gap * 2;
    const height = board.cell.size - board.cell.gap * 2;
    super(canvas.width, yPos, width, height, 100, 0, 7, 290, 420);
    this.speed = Math.random() * 0.8 + 0.4;
    this.movement = this.speed;
    this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  }

  update() {
    this.x -= this.movement;
    if (gameState.frame % 2 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }

  draw() {
    // ctx.fillStyle = "red";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(this.unitHealth, this.x + 15, this.y + 30);
    ctx.drawImage(
      this.enemyType,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

function handleEnemies() {
  for (let i = 0; i < enemy.units.length; i++) {
    enemy.units[i].update();
    enemy.units[i].draw();
    if (enemy.units[i] && enemy.units[i].x < 0) gameState.over = true;
    if (enemy.units[i] && enemy.units[i].health <= 0) {
      const resourcesGained = enemy.units[i].maxHealth / 10;
      gameState.messages.push(
        new FloatingMessage(`+${resourcesGained}`, 250, 50, 30, "gold")
      );
      gameState.messages.push(
        new FloatingMessage(
          `+${resourcesGained}`,
          enemy.units[i].x,
          enemy.units[i].y,
          30,
          "black"
        )
      );
      player.resources += resourcesGained;
      player.score += resourcesGained;
      enemy.positions.splice(enemy.positions.indexOf(enemy.units[i].y), 1);
      enemy.units.splice(i, 1);
      i--;
    }
  }
  if (
    gameState.frame % enemy.frequency === 0 &&
    player.score < gameState.winningScore
  ) {
    let yPos =
      Math.floor(Math.random() * 5 + 1) * board.cell.size + board.cell.gap;
    enemy.positions.push(yPos);
    enemy.units.push(new Enemy(yPos));
    if (enemy.frequency > 100) enemy.frequency -= 25;
  }
}

/***********************************************************
 *              F L O A T I N G  M E S S A G E S
 */
class FloatingMessage {
  constructor(value, x, y, size, color) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifeSpan = 0;
    this.color = color;
    this.opacity = 1;
  }

  update() {
    this.y -= 0.3;
    this.lifeSpan++;
    if (this.opacity > 0.03) this.opacity -= 0.03;
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.font = `${this.size}px Arial`;
    ctx.fillText(this.value, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

function handleFloatingMessages() {
  for (let i = 0; i < gameState.messages.length; i++) {
    gameState.messages[i].update();
    gameState.messages[i].draw();
    if (gameState.messages[i].lifeSpan > 50) {
      gameState.messages.splice(i, 1);
      i--;
    }
  }
}

/***********************************************************
 *              R E S O U R C E S
 */

const amounts = [20, 30, 40];

class Resource {
  constructor() {
    this.x = Math.random() * (canvas.width - board.cell.size);
    this.y = (Math.floor(Math.random() * 5) + 1) * (board.cell.size + 25);
    this.width = board.cell.size * 0.6;
    this.height = board.cell.size * 0.6;
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
  if (gameState.frame % 500 === 0 && player.score < gameState.winningScore) {
    gameState.pickups.push(new Resource());
  }
  for (let i = 0; i < gameState.pickups.length; i++) {
    gameState.pickups[i].draw();
    if (
      gameState.pickups[i] &&
      mouse.x &&
      mouse.y &&
      isColliding(gameState.pickups[i], mouse)
    ) {
      player.resources += gameState.pickups[i].amount;
      gameState.messages.push(
        new FloatingMessage(
          `+${gameState.pickups[i].amount}`,
          gameState.pickups[i].x,
          gameState.pickups[i].y,
          30,
          "black"
        )
      );
      gameState.messages.push(
        new FloatingMessage(
          `+${gameState.pickups[i].amount}`,
          250,
          50,
          30,
          "gold"
        )
      );
      gameState.pickups.splice(i, 1);
      i--;
    }
  }
}

/***********************************************************
 *              U T I L I T I E S
 */

window.addEventListener("resize", () => {
  canvasPosition = canvas.getBoundingClientRect();
});

canvas.addEventListener("click", () => {
  const gridX = mouse.x - (mouse.x % board.cell.size) + board.cell.gap;
  const gridY = mouse.y - (mouse.y % board.cell.size) + board.cell.gap;
  if (gridY < board.cell.size) return;
  if (player.units.some((def) => def.x === gridX && def.y === gridY)) return;
  let defenderCost = 100;
  if (defenderCost <= player.resources) {
    player.units.push(new Defender(gridX, gridY));
    player.resources -= defenderCost;
  } else {
    gameState.messages.push(
      new FloatingMessage("Missing resources", mouse.x, mouse.y, 20, "red")
    );
  }
});

function handleGameStatus() {
  ctx.fillStyle = "gold";
  ctx.font = "30px Arial";
  ctx.fillText(`Score: ${player.score}`, 180, 40);
  ctx.fillText(`Resources: ${player.resources}`, 180, 80);
  if (gameState.over) {
    ctx.fillStyle = "black";
    ctx.font = "90px Arial";
    ctx.fillText("GAME OVER", 125, 330);
  }
  if (player.score >= gameState.winningScore && enemy.units.length === 0) {
    ctx.fillStyle = "black";
    ctx.font = "60px Arial";
    ctx.fillText("LEVEL COMPLETE", 130, 300);
    ctx.font = "30px Arial";
    ctx.fillText(`You win with ${player.score} points!`, 134, 340);
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
  chooseDefender();
  handleGameStatus();
  handleFloatingMessages();
  gameState.frame++;
  if (!gameState.over) requestAnimationFrame(animate);
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
