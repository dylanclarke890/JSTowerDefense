TD = TD || {};
TD.Projectile = TD.Projectile || {};

TD.Projectile.Base = class extends TD.Base.BaseCanvasModel {
  constructor(x, y, width, height, power, speed) {
    super(x, y, width, height);
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

TD.Projectile.Standard = class extends TD.Projectile.Base {
  constructor(x, y) {
    super(x, y, 10, 10, 20, 5);
  }
};
