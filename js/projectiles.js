var TD = TD || {};
TD.projectiles = TD.projectiles || {};

TD.projectiles.Base = class extends TD.base.BaseCanvasModel {
  constructor(x, y, width, height, power, speed) {
    super({ x, y, width, height });
    this.power = power;
    this.speed = speed;
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
};

TD.projectiles.Standard = class extends TD.projectiles.Base {
  constructor(position, stats) {
    super(position.x, position.y, 10, 10, stats.power, 5);
  }
};
