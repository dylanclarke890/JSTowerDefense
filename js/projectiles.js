var TD = TD || {};
TD.projectiles = TD.projectiles || {};

TD.projectiles.Base = class extends TD.base.BaseCanvasModel {
  constructor(dimensions, stats) {
    const { x, y, width, height } = dimensions;
    super({ x, y, width, height });
    const { power, speed } = stats;
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
    const { x, y } = position;
    super({ x, y, width: 10, height: 10 }, { ...stats, speed: 5 });
  }
};
