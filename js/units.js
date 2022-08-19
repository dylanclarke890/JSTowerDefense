var TD = TD || {};
TD.units = TD.units || {};

TD.units.BaseUnit = class extends TD.base.BaseCanvasModel {
  constructor(sprite, dimensions, stats) {
    super(dimensions);
    this.sprite = sprite;
    const { health, power } = stats;
    this.health = health;
    this.maxHealth = health;
    this.power = power;
    this.frameX = 0;
    this.frameY = 0;
  }

  get unitHealth() {
    return Math.floor(this.health);
  }

  nextSpriteFrame() {
    if (this.frameX < this.sprite.frames.max) this.frameX++;
    else this.frameX = this.sprite.frames.min;
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
      0, // update to use sprite height and frameY.
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
  constructor(sprite, dimensions, stats) {
    const cellSize = board.cell.size - board.cell.gap * 2;
    let { width, height, ...otherDimensions } = dimensions;
    width ??= cellSize;
    height ??= cellSize;
    const { cost, ...otherStats } = stats;
    super(sprite, { ...otherDimensions, width, height }, { ...otherStats });
    this.cost = cost;
    this.shooting = false;
    this.shootNow = false;
    this.timer = 0;
  }

  update() {
    if (TD.utils.isIntervalOf(16)) {
      this.nextSpriteFrame();
      if (this.frameX === this.sprite.frames.attack) this.shootNow = true;
    }
    if (this.shooting && this.shootNow) {
      const x = this.x + 70,
        y = this.y + 50;
      player.projectiles.push(
        new TD.projectiles.Standard({ x, y }, { power: this.power })
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
  constructor(sprite, dimensions, stats) {
    const cellSize = board.cell.size - board.cell.gap * 2;
    let { x, width, height, ...otherDimensions } = dimensions;
    width ??= cellSize;
    height ??= cellSize;
    x ??= canvas.width;
    let { ...otherStats } = stats;
    super(sprite, { width, height, x, ...otherDimensions }, { ...otherStats });
    this.speed = TD.utils.random.upTo(0.8) + 0.4;
    this.movement = this.speed;
  }

  update() {
    this.x -= this.movement;
    if (TD.utils.isIntervalOf(2)) {
      this.nextSpriteFrame();
    }
  }

  draw() {
    this.drawHP("black", "20px Arial", this.x + 15, this.y + 30);
    this.drawSprite();
  }
};
