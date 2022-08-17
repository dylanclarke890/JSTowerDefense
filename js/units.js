var TD = TD || {};
TD.units = TD.units || {};

TD.units.BaseUnit = class extends TD.base.BaseCanvasModel {
  constructor(sprite, health, power, width, height, xPosition, yPosition) {
    super(xPosition, yPosition, width, height);
    this.frameX = 0;
    this.frameY = 0;
    this.health = health;
    this.maxHealth = health;
    this.power = power;
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
  constructor(sprite, cost, health, power, xPosition, yPosition) {
    const width = board.cell.size - board.cell.gap * 2;
    const height = board.cell.size - board.cell.gap * 2;
    super(sprite, health, power, width, height, xPosition, yPosition);
    this.cost = cost;
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
        new TD.projectiles.Standard(this.x + 70, this.y + 50, this.power)
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
  constructor(sprite, health, power, yPosition) {
    const width = board.cell.size - board.cell.gap * 2;
    const height = board.cell.size - board.cell.gap * 2;
    super(sprite, health, power, width, height, canvas.width, yPosition);
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
