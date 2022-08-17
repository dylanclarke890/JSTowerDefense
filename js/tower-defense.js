var TD = TD || {};
const [canvas, ctx] = TD.base.new2dCanvas("play-area", 900, 600);

/***********************************************************
 *              G L O B A L  V A R I A B L E S
 */

const plant = new TD.base.Sprite("sprites/plant.png", 167, 256, 0, 1);
const plantCopy = new TD.base.Sprite("sprites/plant.png", 167, 256, 0, 1);
const zombie = new TD.base.Sprite("sprites/zombie.png", 290, 420, 0, 7);

const playable = {
  units: {
    player: [
      { cost: 60, health: 40, power: 5, sprite: plant },
      { cost: 100, health: 100, power: 20, sprite: plantCopy },
    ],
    enemy: [{ health: 100, power: 0.5, sprite: zombie }],
  },
  resources: {
    amounts: [20, 30, 40],
  },
};

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

const actionBar = {
  canvasPosition: canvas.getBoundingClientRect(),
  width: canvas.width,
  height: board.cell.size,
  unitStrokes: {
    normal: "black",
    selected: "gold",
  },
  icons: {
    width: 70,
    height: 85,
    gap: 3,
  },
};

const fps = {
  current: 0,
  times: [],
};

/***********************************************************
 *                  E V E N T S
 */

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

canvas.addEventListener("click", () => {
  const pos = {
    x: mouse.x - (mouse.x % board.cell.size) + board.cell.gap,
    y: mouse.y - (mouse.y % board.cell.size) + board.cell.gap,
  };
  if (pos.y < board.cell.size) return;
  if (player.units.some((def) => def.x === pos.x && def.y === pos.y)) return;

  const selected = playable.units.player[player.selectedUnit];
  const { sprite, health, cost, power } = selected;

  if (cost <= player.resources) {
    player.units.push(
      new TD.units.Defender(sprite, { ...pos }, { cost, health, power })
    );
    player.resources -= cost;
  } else {
    gameState.messages.push(
      new TD.messages.Floating("Missing resources", mouse.x, mouse.y, 20, "red")
    );
  }
});

window.addEventListener("resize", () => {
  actionBar.canvasPosition = canvas.getBoundingClientRect();
});

/***********************************************************
 *                     M A I N
 */

function handleGameGrid() {
  for (let i = 0; i < board.grid.length; i++) board.grid[i].draw();
}

function handleFps() {
  const now = performance.now();
  const times = fps.times;
  while (times.length && times[0] <= now - 1000) times.shift();
  times.push(now);
  fps.current = times.length;
  ctx.fillStyle = "gold";
  ctx.font = "12px Arial";
  ctx.fillText(`${fps.current} fps`, canvas.width - 40, 15);
}

function handleDefenders() {
  for (let i = 0; i < player.units.length; i++) {
    const unit = player.units[i];
    unit.update();
    unit.draw();
    unit.shooting = enemy.positions.indexOf(unit.y) !== -1; // there is an enemy in the same row.
    for (let j = 0; j < enemy.units.length; j++) {
      const enemyUnit = enemy.units[j];
      if (TD.utils.isColliding(unit, enemyUnit)) {
        unit.health -= enemyUnit.power;
        enemyUnit.movement = 0;
      }
      if (unit.health <= 0) {
        i = TD.base.splice(player.units, i, 1);
        enemyUnit.movement = enemyUnit.speed;
      }
    }
  }
}

function createUnitSelector() {
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  let currentX = 7;
  let currentY = 7;
  const { width, height, gap } = actionBar.icons;
  playable.units.player.forEach((unit, i) => {
    ctx.fillRect(currentX, currentY, width, height);
    if (
      mouse.clicked &&
      TD.utils.isColliding(mouse, {
        x: currentX,
        y: currentY,
        width,
        height,
      })
    ) {
      player.selectedUnit = i;
    }
    const strokes = actionBar.unitStrokes;
    ctx.strokeStyle =
      player.selectedUnit === i ? strokes.selected : strokes.normal;
    ctx.strokeRect(currentX, currentY, width, height);
    currentX += 10;
    currentY += gap;
    const sprite = unit.sprite;
    ctx.drawImage(
      sprite.image,
      0,
      0,
      sprite.width,
      sprite.height,
      currentX,
      currentY,
      50,
      80
    );
    currentY -= gap;
    currentX += width + gap;
  });
}

function handleResources() {
  if (gameState.frame % 500 === 0 && player.score < gameState.winningScore) {
    gameState.pickups.push(new TD.pickups.Resource());
  }
  for (let i = 0; i < gameState.pickups.length; i++) {
    const pickup = gameState.pickups[i];
    pickup.draw();
    if (mouse.x && mouse.y && TD.utils.isColliding(pickup, mouse)) {
      player.resources += pickup.amount;
      gameState.messages.push(
        new TD.messages.Floating(
          `+${pickup.amount}`,
          pickup.x,
          pickup.y,
          30,
          "black"
        )
      );
      gameState.messages.push(
        new TD.messages.Floating(`+${pickup.amount}`, 250, 50, 30, "gold")
      );
      i = TD.base.splice(gameState.pickups, i, 1);
    }
  }
}

function handleProjectiles() {
  for (let i = 0; i < player.projectiles.length; i++) {
    const projectile = player.projectiles[i];
    projectile.update();
    projectile.draw();

    for (let j = 0; j < enemy.units.length; j++) {
      const enemyUnit = enemy.units[j];
      if (TD.utils.isColliding(projectile, enemyUnit)) {
        enemyUnit.health -= projectile.power;
        i = TD.base.splice(player.projectiles, i, 1);
      }
    }

    if (projectile.x > canvas.width)
      i = TD.base.splice(player.projectiles, i, 1);
  }
}

function handleEnemies() {
  for (let i = 0; i < enemy.units.length; i++) {
    const unit = enemy.units[i];
    unit.update();
    unit.draw();
    if (unit.x < 0) gameState.over = true;
    if (unit.health <= 0) {
      const resourcesGained = unit.maxHealth / 10;
      gameState.messages.push(
        new TD.messages.Floating(`+${resourcesGained}`, 250, 50, 30, "gold")
      );
      gameState.messages.push(
        new TD.messages.Floating(
          `+${resourcesGained}`,
          unit.x,
          unit.y,
          30,
          "black"
        )
      );
      player.resources += resourcesGained;
      player.score += resourcesGained;
      i = TD.base.splice(enemy.units, i, 1);
      TD.base.splice(enemy.positions, enemy.positions.indexOf(unit.y), 1);
    }
  }
  if (
    gameState.frame % enemy.frequency === 0 &&
    player.score < gameState.winningScore
  ) {
    let yPosition =
      (TD.utils.random.upTo(5, true) + 1) * board.cell.size + board.cell.gap;
    enemy.positions.push(yPosition);
    const selected =
      playable.units.enemy[
        TD.utils.random.upTo(playable.units.enemy.length, true)
      ];
    const { sprite, health, power } = selected;
    enemy.units.push(new TD.units.Enemy(sprite, health, power, yPosition));
    if (enemy.frequency > 100) enemy.frequency -= 25;
  }
}

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

function handleFloatingMessages() {
  for (let i = 0; i < gameState.messages.length; i++) {
    const message = gameState.messages[i];
    message.update();
    message.draw();
    if (message.lifeSpan > 50) i = TD.base.splice(gameState.messages, i, 1);
  }
}

(function createGameGrid() {
  const size = board.cell.size;
  for (let y = size; y < canvas.height; y += size)
    for (let x = 0; x < canvas.width; x += size)
      board.grid.push(new TD.base.Cell(x, y));
})();

// don't repaint the blue bar each time?
(function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, actionBar.width, actionBar.height);
  handleFps();
  handleGameGrid();
  handleDefenders();
  handleResources();
  handleProjectiles();
  handleEnemies();
  createUnitSelector();
  handleGameStatus();
  handleFloatingMessages();
  gameState.frame++;
  if (!gameState.over) requestAnimationFrame(animate);
})();
