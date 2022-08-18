var TD = TD || {};
TD.messages = TD.messages || {};

TD.messages.Base = class extends TD.base.BaseCanvasModel {
  constructor(message, position, font) {
    const { x, y } = position;
    super({ x, y }); // no width or height but keeps class consistent with others
    const { size, color } = font;
    this.message = message;
    this.fontSize = size;
    this.fontColor = color;
  }
};

TD.messages.Floating = class extends TD.messages.Base {
  constructor(message, position, font) {
    super(message, position, font);
    this.lifeSpan = 0;
    this.maxLifeSpan = 50;
    this.opacity = 1;
  }

  update() {
    this.y -= 0.3;
    this.lifeSpan++;
    if (this.opacity > 0.03) this.opacity -= 0.03;
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.fontColor;
    ctx.font = `${this.fontSize}px Arial`;
    ctx.fillText(this.message, this.x, this.y);
    ctx.globalAlpha = 1;
  }
};
