var TD = TD || {};
TD.Base = TD.Base || {};

TD.Base.Sprite = class {
  constructor(src, width, height, minFrame, maxFrame) {
    this.image = new Image();
    this.image.src = src;
    this.width = width;
    this.height = height;
    this.minFrame = minFrame;
    this.maxFrame = maxFrame;
  }
};

TD.Base.BaseCanvasModel = class {
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
};

TD.Base.BaseUnit = class extends TD.Base.BaseCanvasModel {
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
