var TD = TD || {};
TD.messages = TD.messages || {};

TD.messages.Base = class extends TD.base.BaseCanvasModel {
  constructor(message, x, y, fontSize, fontColor) {
    super({x, y}); // no width or height but keeps class consistent with others
    this.message = message;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
  }
};

TD.messages.Floating = class extends TD.messages.Base {
  constructor(message, x, y, fontSize, fontColor) {
    super(message, x, y, fontSize, fontColor);
    this.lifeSpan = 0;
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
