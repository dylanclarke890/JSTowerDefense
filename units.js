var TD = TD || {};
TD.units = TD.units || {};

TD.units.BaseUnit = class extends TD.base.BaseCanvasModel {
  constructor(x, y, width, height, health, sprite) {
    super(x, y, width, height);
    this.health = health;
    this.maxHealth = health;
    this.frameX = 0;
    this.frameY = 0;
    this.sprite = sprite;
  }

  get unitHealth() {
    return Math.floor(this.health);
  }

  nextSpriteFrame() {
    if (this.frameX < this.sprite.maxFrame) this.frameX++;
    else this.frameX = this.sprite.minFrame;
  }

  drawHP(fillStyle, font, x, y) {
    ctx.fillStyle = fillStyle;
    ctx.font = font;
    ctx.fillText(this.unitHealth, x, y);
  }

  drawSprite() {
    ctx.drawImage(
      this.sprite.image,
      this.frameX * this.sprite.width,
      0,
      this.sprite.width,
      this.sprite.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
};

/***********************************************************
 *              D E F E N D E R S
 */

TD.units.Defender = class extends TD.units.BaseUnit {
  constructor(x, y) {
    const width = board.cell.size - board.cell.gap * 2;
    const height = board.cell.size - board.cell.gap * 2;
    const sprite = playable.units.player[player.selectedUnit];
    super(x, y, width, height, 100, sprite);
    this.shooting = false;
    this.shootNow = false;
    this.timer = 0;
  }

  update() {
    if (gameState.frame % 16 === 0) {
      this.nextSpriteFrame();
      if (this.frameX === 1) this.shootNow = true;
    }
    if (this.shooting && this.shootNow) {
      player.projectiles.push(
        new TD.projectiles.Standard(this.x + 70, this.y + 50)
      );
      this.shootNow = false;
    }
  }

  draw() {
    this.drawSprite();
    this.drawHP("gold", "20px Arial", this.x + 15, this.y + 30);
  }
};

/***********************************************************
 *              E N E M I E S
 */

TD.units.Enemy = class extends TD.units.BaseUnit {
  constructor(yPos) {
    const sprite =
      playable.units.enemy[
        TD.utils.random.upTo(playable.units.enemy.length, true)
      ];
    const width = board.cell.size - board.cell.gap * 2;
    const height = board.cell.size - board.cell.gap * 2;
    super(canvas.width, yPos, width, height, 100, sprite);
    this.speed = TD.utils.random.upTo(0.8) + 0.4;
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
};
