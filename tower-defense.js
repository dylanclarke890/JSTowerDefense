const canvas = document.getElementById("play-area");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

/***********************************************************
 *              B A S E  C L A S S E S
 */

class BaseCanvasModel {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  update() {
    throw new Error("method not implemented");
  }
  draw() {
    throw new Error("method not implemented");
  }
}

class BaseUnit extends BaseCanvasModel {
  constructor(
    type,
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
    super(x, y, width, height);
    this.type = type;
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

  nextSpriteFrame() {
    if (this.frameX < this.maxFrame) this.frameX++;
    else this.frameX = this.minFrame;
  }

  drawHP(fillStyle, font, x, y) {
    ctx.fillStyle = fillStyle;
    ctx.font = font;
    ctx.fillText(this.unitHealth, x, y);
  }

  drawSprite() {
    ctx.drawImage(
      this.type.image,
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
  frequency: 600, // how often in frames to spawn a new enemy.
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

const plant = new Image();
plant.src = "sprites/plant.png";
const zombie = new Image();
zombie.src = "sprites/zombie.png";

const board = {
  cell: {
    gap: 3,
    size: 100,
  },
  grid: [],
  resources: {
    amounts: [20, 30, 40],
  },
  units: {
    player: [
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
    ],
    enemy: [{ image: zombie }],
  },
};

const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
  clicked: false,
};

const actionBar = {
  canvasPosition: canvas.getBoundingClientRect(),
  width: canvas.width,
  height: board.cell.size,
  unitStrokes: {
    normal: "black",
    selected: "gold",
  },
};

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.x - actionBar.canvasPosition.left;
  mouse.y = e.y - actionBar.canvasPosition.top;
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

class Cell extends BaseCanvasModel {
  constructor(x, y) {
    super(x, y, board.cell.size, board.cell.size);
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

class Projectile extends BaseCanvasModel {
  constructor(x, y) {
    super(x, y, 10, 10);
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
 *              D E F E N D E R S
 */

class Defender extends BaseUnit {
  constructor(x, y) {
    const width = board.cell.size - board.cell.gap * 2;
    const height = board.cell.size - board.cell.gap * 2;
    const type = board.units.player[player.selectedUnit];
    super(type, x, y, width, height, 100, 0, 1, 167, 256);
    this.shooting = false;
    this.shootNow = false;
    this.timer = 0;
  }

  update() {
    if (gameState.frame % 8 === 0) {
      this.nextSpriteFrame();
      if (this.frameX === 1) this.shootNow = true;
    }
    if (this.shooting && this.shootNow) {
      player.projectiles.push(new Projectile(this.x + 70, this.y + 50));
      this.shootNow = false;
    }
  }

  draw() {
    this.drawSprite();
    this.drawHP("gold", "20px Arial", this.x + 15, this.y + 30);
  }
}

function handleDefenders() {
  for (let i = 0; i < player.units.length; i++) {
    const unit = player.units[i];
    unit.update();
    unit.draw();
    unit.shooting = enemy.positions.indexOf(unit.y) !== -1;
    for (let j = 0; j < enemy.units.length; j++) {
      const enemyUnit = enemy.units[j];
      if (unit && isColliding(unit, enemyUnit)) {
        unit.health -= 0.5;
        enemyUnit.movement = 0;
      }
      if (unit && unit.health <= 0) {
        player.units.splice(i, 1);
        i--;
        enemyUnit.movement = enemyUnit.speed;
      }
    }
  }
}

function chooseDefender() {
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  let currentX = 20;
  let currentY = 15;
  board.units.player.forEach((uc, i) => {
    if (isColliding(mouse, uc) && mouse.clicked) player.selectedUnit = i;
    ctx.fillRect(uc.x, uc.y, uc.width, uc.height);
    ctx.drawImage(uc.image, 0, 0, 167, 256, currentX, currentY, 50, 80);
    const strokes = actionBar.unitStrokes;
    ctx.strokeStyle =
      player.selectedUnit === i ? strokes.selected : strokes.normal;
    ctx.strokeRect(uc.x, uc.y, uc.width, uc.height);
    currentX += 80;
  });
}

/***********************************************************
 *              E N E M I E S
 */

class Enemy extends BaseUnit {
  constructor(yPos) {
    const type = board.units.enemy[randomUpTo(board.units.enemy.length, true)];
    const width = board.cell.size - board.cell.gap * 2;
    const height = board.cell.size - board.cell.gap * 2;
    super(type, canvas.width, yPos, width, height, 100, 0, 7, 290, 420);
    this.speed = randomUpTo(0.8) + 0.4;
    this.movement = this.speed;
  }

  update() {
    this.x -= this.movement;
    if (gameState.frame % 2 === 0) {
      this.nextSpriteFrame();
    }
  }

  draw() {
    this.drawHP("black", "20px Arial", this.x + 15, this.y + 30);
    this.drawSprite();
  }
}

function handleEnemies() {
  for (let i = 0; i < enemy.units.length; i++) {
    const unit = enemy.units[i];
    unit.update();
    unit.draw();
    if (unit && unit.x < 0) gameState.over = true;
    if (unit && unit.health <= 0) {
      const resourcesGained = unit.maxHealth / 10;
      gameState.messages.push(
        new FloatingMessage(`+${resourcesGained}`, 250, 50, 30, "gold")
      );
      gameState.messages.push(
        new FloatingMessage(`+${resourcesGained}`, unit.x, unit.y, 30, "black")
      );
      player.resources += resourcesGained;
      player.score += resourcesGained;
      enemy.positions.splice(enemy.positions.indexOf(unit.y), 1);
      enemy.units.splice(i, 1);
      i--;
    }
  }
  if (
    gameState.frame % enemy.frequency === 0 &&
    player.score < gameState.winningScore
  ) {
    let yPos = (randomUpTo(5, true) + 1) * board.cell.size + board.cell.gap;
    enemy.positions.push(yPos);
    enemy.units.push(new Enemy(yPos));
    if (enemy.frequency > 100) enemy.frequency -= 25;
  }
}

/***********************************************************
 *              F L O A T I N G  M E S S A G E S
 */
class FloatingMessage extends BaseCanvasModel {
  constructor(value, x, y, size, color) {
    super(x, y, null, null); // keep things consistent
    this.value = value;
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
    const message = gameState.messages[i];
    message.update();
    message.draw();
    if (message.lifeSpan > 50) {
      gameState.messages.splice(i, 1);
      i--;
    }
  }
}

/***********************************************************
 *              R E S O U R C E S
 */

class Resource extends BaseCanvasModel {
  constructor() {
    super(
      randomUpTo(canvas.width - board.cell.size),
      (randomUpTo(5, true) + 1) * (board.cell.size + 25),
      board.cell.size * 0.6,
      board.cell.size * 0.6
    );
    const amounts = board.resources.amounts;
    this.amount = amounts[randomUpTo(amounts.length, true)];
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
    const pickup = gameState.pickups[i];
    pickup.draw();
    if (pickup && mouse.x && mouse.y && isColliding(pickup, mouse)) {
      player.resources += pickup.amount;
      gameState.messages.push(
        new FloatingMessage(
          `+${pickup.amount}`,
          pickup.x,
          pickup.y,
          30,
          "black"
        )
      );
      gameState.messages.push(
        new FloatingMessage(`+${pickup.amount}`, 250, 50, 30, "gold")
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
  actionBar.canvasPosition = canvas.getBoundingClientRect();
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
  ctx.fillRect(0, 0, actionBar.width, actionBar.height);
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

function randomUpTo(num, floor = false) {
  const res = Math.random() * num;
  return floor ? Math.floor(res) : res;
}
