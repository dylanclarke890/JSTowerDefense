var TD = TD || {};
const [canvas, ctx] = TD.utils.new2dCanvas("play-area", 900, 600);

/***********************************************************
 *              G L O B A L  V A R I A B L E S
 */

const plant = new TD.base.Sprite(
  "sprites/plant.png",
  { width: 167, height: 256, projectileOffset: { x: 70, y: 40 } },
  { min: 0, max: 1, attack: 1 }
);
const plantCopy = new TD.base.Sprite(
  "sprites/plant.png",
  { width: 167, height: 256, projectileOffset: { x: 70, y: 40 } },
  { min: 0, max: 1, attack: 1 }
);
const zombie = new TD.base.Sprite(
  "sprites/zombie.png",
  { width: 290, height: 420 },
  { min: 0, max: 4, attack: 7 }
);

const playable = {
  units: {
    player: [
      { cost: 60, health: 40, power: 5, sprite: plant },
      { cost: 100, health: 100, power: 20, sprite: plantCopy },
    ],
    enemy: [{ health: 100, power: 0.5, sprite: zombie }],
  },
  resources: {
    frequency: 50,
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
  freq: {
    // how regularly in frames to spawn a new enemy.
    current: 600,
    lowest: 100,
    decrementBy: 25,
  },
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
  const gridPos = {
    x: mouse.x - (mouse.x % board.cell.size) + board.cell.gap,
    y: mouse.y - (mouse.y % board.cell.size) + board.cell.gap,
  };
  if (gridPos.y < board.cell.size) return;
  if (player.units.some((def) => def.x === gridPos.x && def.y === gridPos.y))
    return;

  const selected = playable.units.player[player.selectedUnit];
  const { sprite, cost, ...stats } = selected;

  if (cost <= player.resources) {
    player.units.push(
      new TD.units.Defender(sprite, { ...gridPos }, { cost, ...stats })
    );
    player.resources -= cost;
  } else {
    gameState.messages.push(
      new TD.messages.Floating(
        "Missing resources",
        { x: mouse.x, y: mouse.y },
        { size: 20, color: "red" }
      )
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
    if (i < 0) continue;
    player.units[i].update();
    player.units[i].draw();
    player.units[i].shooting =
      enemy.positions.indexOf(player.units[i].y) !== -1; // there is an enemy in the same row.
    for (let j = 0; j < enemy.units.length; j++) {
      if (i < 0 || j < 0) continue;
      const enemyUnit = enemy.units[j];
      if (TD.utils.isColliding(player.units[i], enemyUnit)) {
        player.units[i].health -= enemyUnit.power;
        enemyUnit.movement = 0;
      }
      if (player.units[i].health <= 0) {
        player.units.splice(i--, 1);
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
  if (
    TD.utils.isIntervalOf(player.resources.frequency) &&
    player.score < gameState.winningScore
  ) {
    const newRss = new TD.pickups.Resource();
    gameState.pickups.push(newRss);
  }
  for (let i = 0; i < gameState.pickups.length; i++) {
    if (i < 0) continue;
    gameState.pickups[i].draw();
    if (
      mouse.x &&
      mouse.y &&
      TD.utils.isColliding(gameState.pickups[i], mouse)
    ) {
      const { x, y, amount } = gameState.pickups[i];
      player.resources += amount;
      gameState.messages.push(
        new TD.messages.Floating(
          `+${amount}`,
          { x, y },
          { size: 30, color: "black" }
        )
      );
      gameState.messages.push(
        new TD.messages.Floating(
          `+${amount}`,
          { x: 250, y: 50 },
          { size: 30, color: "gold" }
        )
      );
      gameState.pickups.splice(i--, 1);
    }
  }
}

function handleProjectiles() {
  for (let i = 0; i < player.projectiles.length; i++) {
    if (i < 0) continue;
    player.projectiles[i].update();
    player.projectiles[i].draw();

    for (let j = 0; j < enemy.units.length; j++) {
      const enemyUnit = enemy.units[j];
      if (TD.utils.isColliding(player.projectiles[i], enemyUnit)) {
        enemyUnit.health -= player.projectiles[i].power;
        player.projectiles.splice(i--, 1);
      }
    }
    if (i < 0) continue;
    if (player.projectiles[i].x > canvas.width)
      player.projectiles.splice(i--, 1);
  }
}

function handleEnemies() {
  for (let i = 0; i < enemy.units.length; i++) {
    if (i < 0) continue;
    enemy.units[i].update();
    enemy.units[i].draw();
    if (enemy.units[i].x < 0) gameState.over = true;
    if (enemy.units[i].health <= 0) {
      const rssGained = TD.utils.getRssGained(enemy.units[i]);
      gameState.messages.push(
        new TD.messages.Floating(
          `+${rssGained}`,
          { x: 250, y: 50 },
          { size: 30, color: "gold" }
        )
      );
      const { x, y } = enemy.units[i];
      gameState.messages.push(
        new TD.messages.Floating(
          `+${rssGained}`,
          { x, y },
          { size: 30, color: "black" }
        )
      );
      player.resources += rssGained;
      player.score += rssGained;
      enemy.positions.splice(enemy.positions.indexOf(enemy.units[i].y), 1);
      enemy.units.splice(i--, 1);
    }
  }
  if (
    TD.utils.isIntervalOf(enemy.freq.current) &&
    player.score < gameState.winningScore
  ) {
    const y =
      (TD.utils.random.upTo(5, true) + 1) * board.cell.size + board.cell.gap;
    enemy.positions.push(y);
    const selected =
      playable.units.enemy[
        TD.utils.random.upTo(playable.units.enemy.length, true)
      ];
    const { sprite, ...stats } = selected;
    enemy.units.push(new TD.units.Enemy(sprite, { y }, { ...stats }));
    const { current, lowest, decrementBy } = enemy.freq;
    if (current > lowest) enemy.freq.current -= decrementBy;
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
    gameState.messages[i].update();
    gameState.messages[i].draw();
    const { lifeSpan, maxLifeSpan } = gameState.messages[i];
    if (lifeSpan > maxLifeSpan) i = gameState.messages.splice(i--, 1);
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
